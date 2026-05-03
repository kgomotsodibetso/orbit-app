import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email';
import { weeklySummaryEmail } from '@/lib/email/templates';

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const service = createServiceClient();

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();
  const todayStr   = now.toISOString().split('T')[0];

  // Fetch all institutions that have weekly summary enabled
  const { data: institutions } = await service
    .from('institutions')
    .select('id, name, contact_email, settings');

  let sent = 0;
  let failed = 0;

  for (const inst of institutions ?? []) {
    const settings  = (inst.settings ?? {}) as Record<string, unknown>;
    const notifPrefs = (settings.notifications ?? {}) as Record<string, boolean>;

    // Skip if weekly summary is explicitly disabled
    if (notifPrefs.emailWeeklySummary === false) continue;
    if (!inst.contact_email) continue;

    const [
      { count: totalLoans },
      { count: newLoans },
      { count: returnedThisWeek },
      { count: overdueCount },
      { count: newBooks },
      { count: newMembers },
      { data: recentLoans },
    ] = await Promise.all([
      service.from('loans').select('id', { count: 'exact', head: true })
        .eq('institution_id', inst.id).in('status', ['active', 'overdue']),
      service.from('loans').select('id', { count: 'exact', head: true })
        .eq('institution_id', inst.id).gte('checked_out_at', weekAgoStr),
      service.from('loans').select('id', { count: 'exact', head: true })
        .eq('institution_id', inst.id).eq('status', 'returned').gte('returned_at', weekAgoStr),
      service.from('loans').select('id', { count: 'exact', head: true })
        .eq('institution_id', inst.id).eq('status', 'overdue'),
      service.from('books').select('id', { count: 'exact', head: true })
        .eq('institution_id', inst.id).gte('created_at', weekAgoStr),
      service.from('members').select('id', { count: 'exact', head: true })
        .eq('institution_id', inst.id).gte('created_at', weekAgoStr),
      // Top books by checkouts this week
      service.from('loans').select('book_id, books(title)')
        .eq('institution_id', inst.id).gte('checked_out_at', weekAgoStr).limit(50),
    ]);

    // Aggregate top books
    const bookCounts: Record<string, { title: string; count: number }> = {};
    for (const loan of recentLoans ?? []) {
      const b = loan.books as unknown as { title: string } | null;
      if (!b || !loan.book_id) continue;
      if (!bookCounts[loan.book_id]) bookCounts[loan.book_id] = { title: b.title, count: 0 };
      bookCounts[loan.book_id].count++;
    }
    const topBooks = Object.values(bookCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(b => ({ title: b.title, checkouts: b.count }));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orbit.school';

    const result = await sendEmail({
      to:      inst.contact_email,
      subject: `📚 Weekly Library Summary — ${inst.name}`,
      html:    weeklySummaryEmail({
        schoolName:        inst.name,
        adminName:         'Library Admin',
        weekOf:            weekAgo.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }),
        totalLoans:        totalLoans ?? 0,
        newLoans:          newLoans ?? 0,
        returnedThisWeek:  returnedThisWeek ?? 0,
        overdueCount:      overdueCount ?? 0,
        newBooks:          newBooks ?? 0,
        newMembers:        newMembers ?? 0,
        topBooks,
        dashboardUrl:      appUrl,
      }),
    });

    result.ok ? sent++ : failed++;
  }

  return NextResponse.json({ institutions: institutions?.length ?? 0, sent, failed });
}
