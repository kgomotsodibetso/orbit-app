import Link from 'next/link';
import {
  ArrowLeft,
  DownloadSimple,
  FileText,
  BookOpen,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import { generateStocktakeReport } from './actions';

type BookRow = {
  id: string;
  title: string;
  authors: string[];
  isbn_13: string | null;
  condition: string;
  location_shelf: string | null;
  subject_area: string | null;
  total_copies: number;
  available_copies: number;
};

type Condition = 'new' | 'good' | 'fair' | 'poor' | 'withdrawn';

const ALL_CONDITIONS: Condition[] = ['new', 'good', 'fair', 'poor', 'withdrawn'];

const conditionBadge: Record<string, string> = {
  new:       'bg-green-50 text-green-700 border-green-200',
  good:      'bg-steel/10 text-steel border-steel/20',
  fair:      'bg-golden/10 text-amber-700 border-golden/30',
  poor:      'bg-orange-50 text-orange-700 border-orange-200',
  withdrawn: 'bg-slate/10 text-slate/60 border-slate/20',
};

export default async function StocktakePage({
  searchParams,
}: {
  searchParams: Promise<{ condition?: string }>;
}) {
  const { condition = 'all' } = await searchParams;
  const supabase = await createClient();

  const { data: rawBooks } = await supabase
    .from('books')
    .select(
      'id, title, authors, isbn_13, condition, location_shelf, subject_area, total_copies, available_copies'
    )
    .order('title', { ascending: true })
    .limit(2000);

  const allBooks = (rawBooks ?? []) as unknown as BookRow[];

  // Aggregate stats across all books (unaffected by filter)
  const conditionCounts: Record<string, number> = {};
  let totalCopies = 0;
  let availableCopies = 0;
  for (const b of allBooks) {
    conditionCounts[b.condition] = (conditionCounts[b.condition] ?? 0) + 1;
    totalCopies += b.total_copies;
    availableCopies += b.available_copies;
  }

  // Apply filter in JS (avoids a second DB round-trip)
  const books =
    condition === 'all' ? allBooks : allBooks.filter((b) => b.condition === condition);

  const today = new Date().toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="text-slate/40 hover:text-slate transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate">Annual Stock-take</h1>
            <p className="text-slate/50 text-sm mt-0.5">
              DBE asset register · {today}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/api/reports/stocktake"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold rounded-xl bg-cream text-slate border border-slate/20 hover:bg-cream/80 transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download CSV</span>
            <span className="sm:hidden">CSV</span>
          </a>
          <form action={generateStocktakeReport}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold rounded-xl btn-primary transition-all"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Generate</span>
            </button>
          </form>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Total Titles" value={allBooks.length} />
        <SummaryCard label="Total Copies" value={totalCopies} />
        <SummaryCard label="Available" value={availableCopies} />
        <SummaryCard label="On Loan" value={totalCopies - availableCopies} />
      </div>

      {/* Condition breakdown chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_CONDITIONS.map((c) => {
          if (!conditionCounts[c]) return null;
          return (
            <Link
              key={c}
              href={`/reports/stocktake?condition=${condition === c ? 'all' : c}`}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                conditionBadge[c],
                condition === c ? 'ring-2 ring-offset-1 ring-steel/40' : 'opacity-80 hover:opacity-100',
              ].join(' ')}
            >
              <span className="capitalize">{c}</span>
              <span className="font-bold">{conditionCounts[c]}</span>
            </Link>
          );
        })}
        {condition !== 'all' && (
          <Link
            href="/reports/stocktake"
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-slate/20 text-slate/50 hover:text-slate transition-colors"
          >
            Clear filter
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="overflow-x-auto mb-4">
      <div className="flex gap-1 bg-slate/5 rounded-xl p-1 w-fit">
        <FilterTab
          href="/reports/stocktake"
          active={condition === 'all'}
          label="All"
          count={allBooks.length}
        />
        {ALL_CONDITIONS.map((c) =>
          conditionCounts[c] ? (
            <FilterTab
              key={c}
              href={`/reports/stocktake?condition=${c}`}
              active={condition === c}
              label={c.charAt(0).toUpperCase() + c.slice(1)}
              count={conditionCounts[c]}
            />
          ) : null
        )}
      </div>
      </div>

      {/* Book table */}
      {books.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate/10 p-16 text-center">
          <BookOpen className="w-10 h-10 text-slate/20 mx-auto mb-3" />
          <p className="text-slate/50 font-medium">No books found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate/10 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate/10 bg-cream/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate/40 uppercase tracking-widest w-10">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate/40 uppercase tracking-widest">
                  Title / Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate/40 uppercase tracking-widest hidden md:table-cell">
                  ISBN-13
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate/40 uppercase tracking-widest">
                  Condition
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate/40 uppercase tracking-widest hidden lg:table-cell">
                  Shelf
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate/40 uppercase tracking-widest">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate/40 uppercase tracking-widest">
                  Avail
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate/40 uppercase tracking-widest hidden sm:table-cell">
                  Loan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/5">
              {books.map((book, i) => {
                const onLoan = book.total_copies - book.available_copies;
                return (
                  <tr
                    key={book.id}
                    className="hover:bg-cream/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-slate/25 font-mono">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/catalogue/${book.id}`}
                        className="group block"
                      >
                        <p className="text-sm font-medium text-slate group-hover:text-steel transition-colors leading-snug">
                          {book.title}
                        </p>
                        <p className="text-xs text-slate/40 mt-0.5">
                          {book.authors.join(', ')}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono text-slate/40">
                        {book.isbn_13 ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border capitalize ${
                          conditionBadge[book.condition] ?? conditionBadge.fair
                        }`}
                      >
                        {book.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-slate/40">
                        {book.location_shelf ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-slate">
                        {book.total_copies}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          book.available_copies === 0
                            ? 'text-red-500'
                            : 'text-green-600'
                        }`}
                      >
                        {book.available_copies}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className="text-sm text-slate/50">{onLoan}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {allBooks.length >= 2000 && (
            <div className="px-5 py-3 border-t border-slate/10 bg-cream/40 text-center">
              <p className="text-xs text-slate/40">
                Showing first 2,000 titles.{' '}
                <a
                  href="/api/reports/stocktake"
                  className="underline hover:text-slate"
                >
                  Download CSV
                </a>{' '}
                for the full register.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate/10 p-4 text-center">
      <p className="text-2xl font-bold text-slate">{value.toLocaleString()}</p>
      <p className="text-xs text-slate/50 mt-0.5">{label}</p>
    </div>
  );
}

function FilterTab({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={[
        'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5',
        active ? 'bg-white text-slate shadow-sm' : 'text-slate/50 hover:text-slate',
      ].join(' ')}
    >
      {label}
      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-slate/10 text-slate/50">
        {count}
      </span>
    </Link>
  );
}
