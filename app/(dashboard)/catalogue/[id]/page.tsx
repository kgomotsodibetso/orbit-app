import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  AlertCircle,
  MapPin,
  Tag,
  Users,
  Package,
  Pencil,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

type LoanWithMember = {
  id: string;
  status: string;
  due_date: string;
  checked_out_at: string;
  returned_at: string | null;
  condition_on_return: string | null;
  members: { id: string; full_name: string; member_number: string } | null;
};

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: book }, { data: rawLoans }] = await Promise.all([
    supabase.from('books').select('*').eq('id', id).single(),
    supabase
      .from('loans')
      .select(
        'id, status, due_date, checked_out_at, returned_at, condition_on_return, ' +
        'members(id, full_name, member_number)'
      )
      .eq('book_id', id)
      .order('checked_out_at', { ascending: false })
      .limit(30),
  ]);

  if (!book) notFound();

  const loans = (rawLoans ?? []) as unknown as LoanWithMember[];
  const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'overdue');
  const loanHistory = loans.filter((l) => l.status === 'returned' || l.status === 'lost');

  const conditionColour: Record<string, string> = {
    new:      'bg-green-50 text-green-700 border-green-200',
    good:     'bg-steel/10 text-steel border-steel/20',
    fair:     'bg-golden/10 text-amber-700 border-golden/30',
    poor:     'bg-orange-50 text-orange-700 border-orange-200',
    damaged:  'bg-red-50 text-red-700 border-red-200',
    lost:     'bg-slate/10 text-slate/60 border-slate/20',
  };
  const conditionClass = conditionColour[book.condition] ?? conditionColour.fair;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-3xl">
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/catalogue" className="text-slate/40 hover:text-slate transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-slate flex-1">Book Detail</h1>
        <Link href={`/catalogue/${id}/edit`}>
          <Button variant="secondary" size="sm">
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit Book
          </Button>
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate/10 p-6 mb-6">
        <div className="flex gap-5">
          {/* Cover */}
          <div className="shrink-0 w-24 h-32 rounded-xl overflow-hidden bg-steel/10 flex items-center justify-center">
            {book.cover_url ? (
              <Image
                src={book.cover_url}
                alt={book.title}
                width={96}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <BookOpen className="w-8 h-8 text-steel/30" />
            )}
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate leading-snug">{book.title}</h2>
            {book.subtitle && (
              <p className="text-sm text-slate/50 mt-0.5">{book.subtitle}</p>
            )}
            <p className="text-sm text-slate/60 mt-1">{(book.authors as string[]).join(', ')}</p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${conditionClass}`}
              >
                {book.condition}
              </span>
              {book.is_reference_only && (
                <Badge variant="lavender">Reference Only</Badge>
              )}
              {book.subject_area && (
                <Badge variant="neutral">{book.subject_area}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Availability bar */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-steel">{book.available_copies}</p>
            <p className="text-xs text-slate/50 mt-0.5">Available</p>
          </div>
          <div className="text-center border-x border-slate/10">
            <p className="text-2xl font-bold text-slate">{book.total_copies}</p>
            <p className="text-xs text-slate/50 mt-0.5">Total Copies</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate">
              {book.total_copies - book.available_copies}
            </p>
            <p className="text-xs text-slate/50 mt-0.5">On Loan</p>
          </div>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="bg-white rounded-2xl border border-slate/10 p-6 mb-6">
        <h3 className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-4">
          Book Information
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">ISBN-13</p>
            <p className="text-sm font-medium text-slate font-mono">{book.isbn_13}</p>
          </div>
          {book.isbn_10 && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">ISBN-10</p>
              <p className="text-sm font-medium text-slate font-mono">{book.isbn_10}</p>
            </div>
          )}
          {book.publisher && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Publisher</p>
              <p className="text-sm font-medium text-slate">{book.publisher}</p>
            </div>
          )}
          {book.published_year && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Year</p>
              <p className="text-sm font-medium text-slate">{book.published_year}</p>
            </div>
          )}
          {book.language && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Language</p>
              <p className="text-sm font-medium text-slate capitalize">{book.language}</p>
            </div>
          )}
          {book.dewey_decimal && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Dewey</p>
              <p className="text-sm font-medium text-slate font-mono">{book.dewey_decimal}</p>
            </div>
          )}
          {book.location_shelf && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Shelf
              </p>
              <p className="text-sm font-medium text-slate">{book.location_shelf}</p>
            </div>
          )}
          {book.grade_level && (book.grade_level as string[]).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> Grade Level
              </p>
              <p className="text-sm font-medium text-slate">{(book.grade_level as string[]).join(', ')}</p>
            </div>
          )}
          {book.acquisition_date && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Acquired</p>
              <p className="text-sm font-medium text-slate">
                {new Date(book.acquisition_date).toLocaleDateString('en-ZA')}
              </p>
            </div>
          )}
          {book.acquisition_source && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Package className="w-3 h-3" /> Source
              </p>
              <p className="text-sm font-medium text-slate">{book.acquisition_source}</p>
            </div>
          )}
          {book.acquisition_cost != null && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Cost</p>
              <p className="text-sm font-medium text-slate">
                R {(book.acquisition_cost as number).toFixed(2)}
              </p>
            </div>
          )}
          {book.barcode && (
            <div>
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Barcode</p>
              <p className="text-sm font-medium text-slate font-mono">{book.barcode}</p>
            </div>
          )}
        </div>

        {book.tags && (book.tags as string[]).length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate/10">
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(book.tags as string[]).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-slate/5 border border-slate/15 text-slate/60 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {book.description && (
          <div className="mt-4 pt-4 border-t border-slate/10">
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-2">Description</p>
            <p className="text-sm text-slate/70 leading-relaxed">{book.description}</p>
          </div>
        )}
      </div>

      {/* Currently on loan */}
      {activeLoans.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate/50 uppercase tracking-widest mb-3">
            Currently On Loan ({activeLoans.length})
          </h3>
          <div className="space-y-2">
            {activeLoans.map((loan) => {
              const dueDate = new Date(loan.due_date);
              dueDate.setHours(0, 0, 0, 0);
              const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = loan.status === 'overdue' || diffDays < 0;

              return (
                <div
                  key={loan.id}
                  className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${
                    isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate/10'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-lavender/10 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-lavender" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {loan.members ? (
                      <Link
                        href={`/learners/${loan.members.id}`}
                        className="text-sm font-semibold text-slate hover:text-steel transition-colors"
                      >
                        {loan.members.full_name}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-slate/30">Unknown member</p>
                    )}
                    <p className="text-xs text-slate/40">
                      Out since {new Date(loan.checked_out_at).toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {isOverdue ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">{Math.abs(diffDays)}d overdue</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate/50">
                        {diffDays === 0 ? 'Due today' : `${diffDays}d left`}
                      </p>
                    )}
                    <p className="text-xs text-slate/40 mt-0.5">
                      Due {new Date(loan.due_date).toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loan history */}
      {loanHistory.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate/50 uppercase tracking-widest mb-3">
            Loan History ({loanHistory.length})
          </h3>
          <div className="bg-white rounded-2xl border border-slate/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate/10 bg-cream/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">
                    Learner
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden sm:table-cell">
                    Returned
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/5">
                {loanHistory.map((loan) => (
                  <tr key={loan.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate/30 shrink-0" />
                        {loan.members ? (
                          <Link
                            href={`/learners/${loan.members.id}`}
                            className="text-sm text-slate hover:text-steel transition-colors"
                          >
                            {loan.members.full_name}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate/30">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="text-sm text-slate/50">
                        {loan.returned_at
                          ? new Date(loan.returned_at).toLocaleDateString('en-ZA')
                          : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={loan.status === 'lost' ? 'danger' : 'success'}>
                        {loan.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state when book has never been borrowed */}
      {activeLoans.length === 0 && loanHistory.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate/10 p-10 text-center">
          <BookOpen className="w-8 h-8 text-slate/20 mx-auto mb-2" />
          <p className="text-sm text-slate/40">This book has no loan history yet.</p>
        </div>
      )}
    </div>
  );
}
