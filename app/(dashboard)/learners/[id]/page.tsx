import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, BookOpen, Clock, WarningCircle, Pencil } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/ui/Badge';
import SetPinForm from './SetPinForm';

export default async function LearnerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: member }, { data: loans }] = await Promise.all([
    supabase
      .from('members')
      .select('*, pin_hash')
      .eq('id', id)
      .single(),
    supabase
      .from('loans')
      .select('id, status, due_date, checked_out_at, returned_at, books(title, isbn_13, cover_url, authors)')
      .eq('member_id', id)
      .order('checked_out_at', { ascending: false })
      .limit(20),
  ]);

  if (!member) notFound();

  const activeLoans = loans?.filter((l) => l.status === 'active' || l.status === 'overdue') ?? [];
  const history = loans?.filter((l) => l.status === 'returned' || l.status === 'lost') ?? [];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/learners" className="text-slate/40 hover:text-slate transition-colors">
            <ArrowLeft weight="light" className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-slate">Member Profile</h1>
        </div>
        <Link
          href={`/learners/${id}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-slate/20 bg-white text-slate hover:bg-cream transition-colors"
        >
          <Pencil weight="light" className="w-3.5 h-3.5" />
          Edit
        </Link>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate/10 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-lavender/20 flex items-center justify-center shrink-0">
            <User weight="light" className="w-8 h-8 text-lavender" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate">{member.full_name}</h2>
              <Badge variant={member.is_active ? 'success' : 'neutral'}>
                {member.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {activeLoans.some((l) => l.status === 'overdue') && (
                <Badge variant="danger">Overdue</Badge>
              )}
            </div>
            <p className="text-sm text-slate/50 mt-0.5">{member.member_number}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate/10">
          <div>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Grade</p>
            <p className="text-sm font-medium text-slate">{member.grade ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Class</p>
            <p className="text-sm font-medium text-slate">{member.class_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Type</p>
            <p className="text-sm font-medium text-slate capitalize">{member.member_type}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Phone</p>
            <p className="text-sm font-medium text-slate">{member.contact_phone ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Email</p>
            <p className="text-sm font-medium text-slate truncate">{member.contact_email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Max Loans</p>
            <p className="text-sm font-medium text-slate">{activeLoans.length} / {member.max_loans}</p>
          </div>
          {member.guardian_name && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Guardian</p>
              <p className="text-sm font-medium text-slate">{member.guardian_name}</p>
            </div>
          )}
          {member.notes && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Notes</p>
              <p className="text-sm text-slate/70">{member.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* PIN management */}
      <SetPinForm memberId={member.id} hasPin={!!member.pin_hash} />

      {/* Active loans */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate/50 uppercase tracking-widest mb-3">
          Active Loans ({activeLoans.length})
        </h3>
        {activeLoans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate/10 p-8 text-center">
            <BookOpen weight="light" className="w-8 h-8 text-slate/20 mx-auto mb-2" />
            <p className="text-sm text-slate/40">No books currently checked out</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeLoans.map((loan) => {
              const book = loan.books as unknown as { title: string; cover_url?: string | null; authors: string[] } | null;
              const isOverdue = loan.status === 'overdue';
              const dueDate = new Date(loan.due_date);
              const today = new Date();
              const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={loan.id}
                  className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${
                    isOverdue ? 'border-red-200 bg-red-50/30' : 'border-slate/10'
                  }`}
                >
                  <div className="w-10 h-14 bg-steel/10 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen weight="light" className="w-5 h-5 text-steel/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate truncate">{book?.title}</p>
                    <p className="text-xs text-slate/40">{book?.authors?.join(', ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {isOverdue ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <WarningCircle weight="light" className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Overdue</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate/50">
                        {daysUntilDue > 0 ? `${daysUntilDue}d left` : 'Due today'}
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
        )}
      </div>

      {/* Loan history */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate/50 uppercase tracking-widest mb-3">
            Loan History ({history.length})
          </h3>
          <div className="bg-white rounded-2xl border border-slate/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate/10 bg-cream/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">Book</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden sm:table-cell">Returned</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/5">
                {history.map((loan) => {
                  const book = loan.books as unknown as { title: string } | null;
                  return (
                    <tr key={loan.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Clock weight="light" className="w-3.5 h-3.5 text-slate/30 shrink-0" />
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
                      <td className="px-5 py-3">
                        <Badge variant={loan.status === 'lost' ? 'danger' : 'success'}>
                          {loan.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
