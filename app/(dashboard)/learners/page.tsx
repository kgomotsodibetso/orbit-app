import Link from 'next/link';
import { Plus, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const MEMBER_TYPES = ['learner', 'teacher', 'staff', 'community'] as const;
type MemberType = (typeof MEMBER_TYPES)[number];

const TYPE_LABELS: Record<MemberType, string> = {
  learner: 'Learners',
  teacher: 'Teachers',
  staff: 'Staff',
  community: 'Community',
};

export default async function LearnersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; grade?: string; type?: string }>;
}) {
  const { q, grade, type } = await searchParams;
  const activeType: MemberType = MEMBER_TYPES.includes(type as MemberType)
    ? (type as MemberType)
    : 'learner';

  const supabase = await createClient();

  let query = supabase
    .from('members')
    .select('id, member_number, full_name, grade, member_type, is_active, max_loans')
    .eq('member_type', activeType)
    .order('full_name');

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,member_number.ilike.%${q}%`);
  }
  if (grade) {
    query = query.eq('grade', grade);
  }

  const { data: members } = await query.limit(100);

  const typeParams = (t: MemberType) =>
    new URLSearchParams({ type: t, ...(q ? { q } : {}), ...(grade ? { grade } : {}) }).toString();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate">Members</h1>
          <p className="text-slate/50 text-sm mt-1">{members?.length ?? 0} {TYPE_LABELS[activeType].toLowerCase()}</p>
        </div>
        <Link href="/learners/new" className="shrink-0">
          <Button>
            <Plus className="w-4 h-4" />
            Add Member
          </Button>
        </Link>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 bg-slate/5 rounded-xl p-1 w-fit mb-5">
        {MEMBER_TYPES.map((t) => (
          <Link
            key={t}
            href={`/learners?${typeParams(t)}`}
            className={[
              'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
              activeType === t ? 'bg-white text-slate shadow-sm' : 'text-slate/50 hover:text-slate',
            ].join(' ')}
          >
            {TYPE_LABELS[t]}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mb-6">
        <input type="hidden" name="type" value={activeType} />
        <input
          name="q"
          defaultValue={q}
          placeholder={`Search ${TYPE_LABELS[activeType].toLowerCase()} by name or member number…`}
          className="w-full px-4 py-2.5 rounded-xl border border-slate/20 bg-white text-sm text-slate placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-steel"
        />
      </form>

      {!members?.length ? (
        <div className="text-center py-20">
          <p className="text-slate/40 mb-4">No {TYPE_LABELS[activeType].toLowerCase()} found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate/10 bg-cream/60">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">Member</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden sm:table-cell">Grade</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden md:table-cell">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/5">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-cream/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/learners/${m.id}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-lavender/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-lavender" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate group-hover:text-steel transition-colors">
                          {m.full_name}
                        </p>
                        <p className="text-xs text-slate/40">{m.member_number}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-slate/60">{m.grade ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-slate/60 capitalize">{m.member_type}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={m.is_active ? 'success' : 'neutral'}>
                      {m.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
