import type { ElementType } from 'react';
import Link from 'next/link';
import {
  ChartBar,
  BookOpen,
  ArrowsLeftRight,
  WarningCircle,
  UsersThree,
  CheckCircle,
  FileText,
  ClipboardText,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/ui/Badge';

export default async function ReportsPage() {
  const supabase = await createClient();

  const termStart = getTermStart();

  const [
    { count: totalBooks },
    { count: totalMembers },
    { count: activeLoans },
    { count: overdueLoans },
    { count: returnedThisTerm },
    { count: newBooksThisTerm },
    { data: dbeReports },
  ] = await Promise.all([
    supabase.from('books').select('id', { count: 'exact', head: true }),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
    supabase
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'returned')
      .gte('returned_at', termStart),
    supabase
      .from('books')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', termStart),
    supabase
      .from('dbe_reports')
      .select('id, report_type, report_year, term, generated_by, submitted_at, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate">Reports</h1>
        <p className="text-slate/50 text-sm mt-0.5">DBE compliance reports and library summaries</p>
      </div>

      {/* Summary stats */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-3 flex items-center gap-2">
          <ChartBar weight="light" className="w-3.5 h-3.5" />
          Library Snapshot
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBlock icon={BookOpen} label="Total Books" value={totalBooks ?? 0} colour="steel" />
          <StatBlock icon={UsersThree} label="Active Members" value={totalMembers ?? 0} colour="lavender" />
          <StatBlock icon={ArrowsLeftRight} label="On Loan" value={activeLoans ?? 0} colour="slate" />
          <StatBlock icon={WarningCircle} label="Overdue" value={overdueLoans ?? 0} colour="red" />
          <StatBlock icon={CheckCircle} label="Returned This Term" value={returnedThisTerm ?? 0} colour="green" />
          <StatBlock icon={BookOpen} label="New Books This Term" value={newBooksThisTerm ?? 0} colour="golden" />
        </div>
      </section>

      {/* Generate reports */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-3 flex items-center gap-2">
          <FileText weight="light" className="w-3.5 h-3.5" />
          Generate Reports
        </h2>
        <div className="space-y-3">
          <ReportCard
            href="/reports/stocktake"
            title="Annual Stocktake Report"
            description="DBE-compliant asset register showing all books, condition, and availability. Required annually."
            badge="DBE Required"
            badgeVariant="danger"
          />
          <ReportCard
            href="/reports/stocktake"
            title="Loans Summary"
            description="Checkout and return activity for the current term, including overdue statistics."
            badge="Term Report"
            badgeVariant="steel"
          />
          <ReportCard
            href="/reports/stocktake"
            title="Assets Register"
            description="Full catalogue with acquisition dates, costs, and current condition for insurance purposes."
            badge="Financial"
            badgeVariant="golden"
          />
        </div>
      </section>

      {/* Past DBE reports */}
      <section>
        <h2 className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-3 flex items-center gap-2">
          <ClipboardText weight="light" className="w-3.5 h-3.5" />
          Generated Reports
        </h2>

        {!dbeReports || dbeReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate/10 p-10 text-center">
            <FileText weight="light" className="w-8 h-8 text-slate/20 mx-auto mb-2" />
            <p className="text-sm text-slate/40">No reports generated yet.</p>
            <p className="text-xs text-slate/30 mt-1">
              Use the options above to generate your first DBE report.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate/10 bg-cream/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">
                    Report
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden sm:table-cell">
                    Year / Term
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden md:table-cell">
                    Generated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/5">
                {dbeReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate capitalize">
                        {report.report_type.replace(/_/g, ' ')}
                      </p>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="text-sm text-slate/50">
                        {report.report_year}
                        {report.term ? ` · Term ${report.term}` : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {report.submitted_at ? (
                        <Badge variant="success">Submitted</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate/50">
                        {new Date(report.created_at).toLocaleDateString('en-ZA')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTermStart(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  // SA school terms: T1 Jan–Mar, T2 Apr–Jun, T3 Jul–Sep, T4 Oct–Dec
  let termMonth: number;
  if (month <= 3) termMonth = 1;
  else if (month <= 6) termMonth = 4;
  else if (month <= 9) termMonth = 7;
  else termMonth = 10;
  return new Date(year, termMonth - 1, 1).toISOString();
}

type ColourKey = 'steel' | 'lavender' | 'slate' | 'red' | 'green' | 'golden';

const colourMap: Record<ColourKey, { bg: string; icon: string; text: string }> = {
  steel:    { bg: 'bg-steel/10',    icon: 'text-steel',    text: 'text-slate' },
  lavender: { bg: 'bg-lavender/10', icon: 'text-lavender', text: 'text-slate' },
  slate:    { bg: 'bg-slate/10',    icon: 'text-slate/60', text: 'text-slate' },
  red:      { bg: 'bg-red-50',      icon: 'text-red-500',  text: 'text-red-600' },
  green:    { bg: 'bg-green-50',    icon: 'text-green-600', text: 'text-slate' },
  golden:   { bg: 'bg-golden/10',   icon: 'text-golden',   text: 'text-slate' },
};

function StatBlock({
  icon: Icon,
  label,
  value,
  colour,
}: {
  icon: ElementType;
  label: string;
  value: number;
  colour: ColourKey;
}) {
  const c = colourMap[colour];
  return (
    <div className="bg-white rounded-2xl border border-slate/10 p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon weight="light" className={`w-4 h-4 ${c.icon}`} />
      </div>
      <div>
        <p className={`text-xl font-bold ${c.text}`}>{value.toLocaleString()}</p>
        <p className="text-xs text-slate/50">{label}</p>
      </div>
    </div>
  );
}

type BadgeVariant = 'danger' | 'steel' | 'golden' | 'success' | 'warning' | 'neutral' | 'lavender';

function ReportCard({
  href,
  title,
  description,
  badge,
  badgeVariant,
}: {
  href: string;
  title: string;
  description: string;
  badge: string;
  badgeVariant: BadgeVariant;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-2xl border border-slate/10 p-5 hover:border-steel/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate group-hover:text-steel transition-colors">
            {title}
          </p>
          <p className="text-xs text-slate/50 mt-1 leading-relaxed">{description}</p>
        </div>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
    </Link>
  );
}
