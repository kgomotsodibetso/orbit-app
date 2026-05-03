import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email';
import { monthlyOverdueReport } from '@/lib/email/templates';

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const service = createServiceClient();
  const todayStr = new Date().toISOString().split('T')[0];
  const month    = new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orbit.school';

  const { data: institutions } = await service
    .from('institutions')
    .select('id, name, contact_email, settings');

  let sent = 0;
  let failed = 0;

  for (const inst of institutions ?? []) {
    const notifPrefs = ((inst.settings as Record<string, unknown>)?.notifications ?? {}) as Record<string, boolean>;
    if (notifPrefs.emailMonthlyReport === false) continue;
    if (!inst.contact_email) continue;

    const { data: overdueLoans } = await service
      .from('loans')
      .select('due_date, members(full_name, member_number), books(title)')
      .eq('institution_id', inst.id)
      .in('status', ['active', 'overdue'])
      .lt('due_date', todayStr)
      .order('due_date');

    const loans = (overdueLoans ?? []).map(l => {
      const m = l.members as unknown as { full_name: string; member_number: string } | null;
      const b = l.books   as unknown as { title: string } | null;
      const daysOverdue = Math.floor((Date.now() - new Date(l.due_date).getTime()) / 86_400_000);
      return {
        memberName:   m?.full_name ?? 'Unknown',
        memberNumber: m?.member_number ?? '—',
        bookTitle:    b?.title ?? 'Unknown',
        dueDate:      new Date(l.due_date).toLocaleDateString('en-ZA'),
        daysOverdue,
      };
    });

    const result = await sendEmail({
      to:      inst.contact_email,
      subject: `📋 Monthly Overdue Report — ${inst.name} — ${month}`,
      html:    monthlyOverdueReport({
        schoolName:  inst.name,
        adminName:   'Library Admin',
        month,
        loans,
        dashboardUrl: appUrl,
      }),
    });

    result.ok ? sent++ : failed++;
  }

  return NextResponse.json({ institutions: institutions?.length ?? 0, sent, failed });
}
