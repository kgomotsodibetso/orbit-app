import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/sms/panacea';

export async function GET(request: NextRequest) {
  // Protect with CRON_SECRET header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const supabase = await createClient();

  // Find all active loans that are past their due date
  const today = new Date().toISOString().split('T')[0];

  const { data: overdueLoans, error } = await supabase
    .from('loans')
    .select('id, institution_id, book_id, member_id, due_date, members(full_name, contact_phone), books(title)')
    .eq('status', 'active')
    .lt('due_date', today);

  if (error) {
    console.error('[SMS Cron]', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const loan of overdueLoans ?? []) {
    const member = loan.members as unknown as { full_name: string; contact_phone: string | null } | null;
    const book = loan.books as unknown as { title: string } | null;

    if (!member?.contact_phone) continue;

    const daysOverdue = Math.floor(
      (Date.now() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const message = `Orbit Tech: ${member.full_name}, "${book?.title}" was due ${daysOverdue} day(s) ago. Please return it to your school library. Reply STOP to opt out.`;

    // Update loan status to overdue
    await supabase
      .from('loans')
      .update({ status: 'overdue' })
      .eq('id', loan.id);

    // Send SMS
    const alertType = daysOverdue <= 1 ? 'overdue_1d' : daysOverdue <= 7 ? 'overdue_7d' : 'overdue_14d';
    const result = await sendSMS(member.contact_phone, message);

    await supabase.from('sms_alerts').insert({
      institution_id: loan.institution_id,
      loan_id: loan.id,
      member_id: loan.member_id,
      phone_number: member.contact_phone,
      message,
      alert_type: alertType,
      status: result.success ? 'sent' : 'failed',
      panacea_message_id: result.messageId ?? null,
      sent_at: result.success ? new Date().toISOString() : null,
    });

    result.success ? sent++ : failed++;
  }

  return NextResponse.json({ processed: overdueLoans?.length ?? 0, sent, failed });
}
