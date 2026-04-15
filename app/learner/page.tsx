import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Clock, AlertCircle, LogOut, User, ChevronRight } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/service';
import Badge from '@/components/ui/Badge';

export default async function LearnerDashboardPage() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get('orbit_learner_session')?.value;
  if (!memberId) redirect('/learner/login');

  const supabase = createServiceClient();

  const [{ data: member }, { data: loans }] = await Promise.all([
    supabase
      .from('members')
      .select('id, full_name, member_number, grade, class_name, max_loans, institution_id')
      .eq('id', memberId)
      .single(),
    supabase
      .from('loans')
      .select('id, status, due_date, checked_out_at, returned_at, books(id, title, cover_url, authors)')
      .eq('member_id', memberId)
      .order('checked_out_at', { ascending: false })
      .limit(30),
  ]);

  if (!member) redirect('/learner/login');

  // Fetch available books scoped to the learner's institution
  const { data: books } = await supabase
    .from('books')
    .select('id, title, authors, subject_area, available_copies')
    .eq('institution_id', member.institution_id)
    .gt('available_copies', 0)
    .order('title')
    .limit(6);

  const activeLoans = loans?.filter((l) => l.status === 'active' || l.status === 'overdue') ?? [];
  const history = loans?.filter((l) => l.status === 'returned' || l.status === 'lost') ?? [];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-slate text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-lavender/30 flex items-center justify-center">
            <User className="w-4 h-4 text-lavender" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{member.full_name}</p>
            <p className="text-xs text-white/40">
              {member.member_number}
              {member.grade ? ` · Grade ${member.grade}` : ''}
              {member.class_name ? ` ${member.class_name}` : ''}
            </p>
          </div>
        </div>
        <Link
          href="/learner/logout"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center border border-slate/10">
            <p className="text-2xl font-bold text-steel">{activeLoans.length}</p>
            <p className="text-xs text-slate/50 mt-0.5">Books out</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-slate/10">
            <p className="text-2xl font-bold text-slate">{member.max_loans - activeLoans.length}</p>
            <p className="text-xs text-slate/50 mt-0.5">Can borrow</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-slate/10">
            <p className="text-2xl font-bold text-golden">{history.length}</p>
            <p className="text-xs text-slate/50 mt-0.5">Books read</p>
          </div>
        </div>

        {/* Active loans */}
        <section>
          <h2 className="text-sm font-semibold text-slate/50 uppercase tracking-widest mb-3">
            Currently Reading ({activeLoans.length})
          </h2>

          {activeLoans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate/10 p-8 text-center">
              <BookOpen className="w-8 h-8 text-slate/20 mx-auto mb-2" />
              <p className="text-sm text-slate/40">No books checked out</p>
              <p className="text-xs text-slate/30 mt-1">Visit the library to borrow a book</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeLoans.map((loan) => {
                const book = loan.books as unknown as { id: string; title: string; authors: string[] } | null;
                const isOverdue = loan.status === 'overdue';
                const dueDate = new Date(loan.due_date);
                const today = new Date();
                const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={loan.id}
                    className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${
                      isOverdue ? 'border-red-200 bg-red-50/40' : 'border-slate/10'
                    }`}
                  >
                    <div className="w-10 h-14 bg-steel/10 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-steel/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate leading-tight truncate">{book?.title}</p>
                      <p className="text-xs text-slate/40 mt-0.5">{book?.authors?.join(', ')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {isOverdue ? (
                        <div className="flex items-center gap-1 text-red-500 justify-end">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">Overdue!</span>
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-steel">
                          {daysLeft > 0 ? `${daysLeft}d left` : 'Due today'}
                        </p>
                      )}
                      <p className="text-xs text-slate/40 mt-0.5">
                        Due {dueDate.toLocaleDateString('en-ZA')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Available books to browse */}
        {books && books.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate/50 uppercase tracking-widest">
                Browse Library
              </h2>
              <span className="text-xs text-steel/60 font-semibold flex items-center gap-0.5">
                Ask your librarian <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="space-y-2">
              {books.map((book) => {
                const authors = book.authors as string[] | null;
                return (
                  <div key={book.id} className="bg-white rounded-2xl border border-slate/10 p-4 flex items-center gap-3">
                    <div className="w-8 h-11 bg-lavender/10 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-lavender/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate leading-tight truncate">{book.title}</p>
                      <p className="text-xs text-slate/40">{authors?.join(', ')}</p>
                    </div>
                    <Badge variant="success">{book.available_copies} avail.</Badge>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Reading history */}
        {history.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate/50 uppercase tracking-widest mb-3">
              Reading History ({history.length})
            </h2>
            <div className="bg-white rounded-2xl border border-slate/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate/10 bg-cream/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">Book</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden sm:table-cell">Returned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate/5">
                  {history.map((loan) => {
                    const book = loan.books as unknown as { title: string } | null;
                    return (
                      <tr key={loan.id}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate/30 shrink-0" />
                            <span className="text-sm text-slate truncate">{book?.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className="text-sm text-slate/50">
                            {loan.returned_at
                              ? new Date(loan.returned_at).toLocaleDateString('en-ZA')
                              : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
