import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email';
import { overdueEmail, dueDateReminderEmail } from '@/lib/email/templates';

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const service = createServiceClient();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Due-in-2-days reminder
  const reminder = new Date(today);
  reminder.setDate(today.getDate() + 2);
  const reminderStr = reminder.toISOString().split('T')[0];

  let emailsSent = 0;
  let emailsFailed = 0;

  // ── 1. Overdue notices ─────────────────────────────────────────────────────
  const { data: overdueLoans } = await service
    .from('loans')
    .select(`
      id, due_date, institution_id,
      members(full_name, contact_email, member_number),
      books(title, authors),
      institutions(name, settings)
    `)
    .in('status', ['active', 'overdue'])
    .lt('due_date', todayStr);

  for (const loan of overdueLoans ?? []) {
    const member = loan.members as unknown as { full_name: string; contact_email: string | null } | null;
    const book   = loan.books   as unknown as { title: string; authors: string[] } | null;
    const inst   = loan.institutions as unknown as { name: string; settings: Record<string, unknown> } | null;

    if (!member?.contact_email || !book || !inst) continue;

    // Check institution email notification preference
    const notifPrefs = (inst.settings?.notifications ?? {}) as Record<string, boolean>;
    if (notifPrefs.emailOverdue === false) continue;

    const daysOverdue = Math.floor(
      (Date.now() - new Date(loan.due_date).getTime()) / 86_400_000
    );
    const finePerDay = Number((inst.settings?.fine_per_day as number | undefined) ?? 0);

    // Update status to overdue
    await service.from('loans').update({ status: 'overdue' }).eq('id', loan.id);

    const result = await sendEmail({
      to:      member.contact_email,
      subject: `Overdue Book — ${book.title}`,
      html:    overdueEmail({
        schoolName:  inst.name,
        memberName:  member.full_name,
        bookTitle:   book.title,
        authors:     (book.authors ?? []).join(', '),
        dueDate:     new Date(loan.due_date).toLocaleDateString('en-ZA'),
        daysOverdue,
        finePerDay,
      }),
    });

    result.ok ? emailsSent++ : emailsFailed++;
  }

  // ── 2. Due-date reminders (2 days before) ──────────────────────────────────
  const { data: upcomingLoans } = await service
    .from('loans')
    .select(`
      id, due_date, institution_id,
      members(full_name, contact_email),
      books(title, authors),
      institutions(name, settings)
    `)
    .eq('status', 'active')
    .eq('due_date', reminderStr);

  for (const loan of upcomingLoans ?? []) {
    const member = loan.members as unknown as { full_name: string; contact_email: string | null } | null;
    const book   = loan.books   as unknown as { title: string; authors: string[] } | null;
    const inst   = loan.institutions as unknown as { name: string; settings: Record<string, unknown> } | null;

    if (!member?.contact_email || !book || !inst) continue;

    const notifPrefs = (inst.settings?.notifications ?? {}) as Record<string, boolean>;
    if (notifPrefs.emailDueReminder === false) continue;

    const result = await sendEmail({
      to:      member.contact_email,
      subject: `Reminder: "${book.title}" is due in 2 days`,
      html:    dueDateReminderEmail({
        schoolName: inst.name,
        memberName: member.full_name,
        bookTitle:  book.title,
        authors:    (book.authors ?? []).join(', '),
        dueDate:    new Date(loan.due_date).toLocaleDateString('en-ZA'),
        daysLeft:   2,
      }),
    });

    result.ok ? emailsSent++ : emailsFailed++;
  }

  return NextResponse.json({
    overdueProcessed: overdueLoans?.length ?? 0,
    remindersProcessed: upcomingLoans?.length ?? 0,
    emailsSent,
    emailsFailed,
  });
}
