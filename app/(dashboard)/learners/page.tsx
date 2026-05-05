import Link from 'next/link';
import { Plus, User, Eye, Pencil } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import GradeSelect from './GradeSelect';

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
    .select('id, member_number, full_name, grade, class_name, member_type, is_active, contact_phone, contact_email, max_loans')
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
            <Plus weight="light" className="w-4 h-4" />
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

      {/* Search + grade filter */}
      <form className="flex gap-2 mb-6">
        <input type="hidden" name="type" value={activeType} />
        <input
          name="q"
          defaultValue={q}
          placeholder={`Search ${TYPE_LABELS[activeType].toLowerCase()} by name or member number…`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate/20 bg-white text-sm text-slate placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-steel"
        />
        {activeType === 'learner' && <GradeSelect defaultValue={grade} />}
      </form>

      {!members?.length ? (
        <div className="bg-white rounded-2xl border border-slate/10 text-center py-20">
          <User weight="light" className="w-10 h-10 text-slate/20 mx-auto mb-3" />
          <p className="text-slate/40 font-medium">No {TYPE_LABELS[activeType].toLowerCase()} found.</p>
          <Link href="/learners/new" className="inline-block mt-4">
            <Button size="sm"><Plus weight="light" className="w-3.5 h-3.5" />Add one now</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate/10 bg-cream/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">Member</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden sm:table-cell">Grade / Class</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest hidden lg:table-cell">Contact</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate/50 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate/50 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/5">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-lavender/20 flex items-center justify-center shrink-0">
                          <User weight="light" className="w-4 h-4 text-lavender" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate">{m.full_name}</p>
                          <p className="text-xs text-slate/40">{m.member_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="text-sm text-slate/70">
                        {m.grade ? `Grade ${m.grade}` : '—'}
                      </p>
                      {m.class_name && (
                        <p className="text-xs text-slate/40">{m.class_name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="text-sm text-slate/70">{m.contact_phone ?? '—'}</p>
                      {m.contact_email && (
                        <p className="text-xs text-slate/40 truncate max-w-[180px]">{m.contact_email}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={m.is_active ? 'success' : 'neutral'}>
                        {m.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/learners/${m.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate/60 hover:text-steel hover:bg-steel/10 transition-colors"
                        >
                          <Eye weight="light" className="w-3.5 h-3.5" />
                          View
                        </Link>
                        <Link
                          href={`/learners/${m.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate/60 hover:text-slate hover:bg-slate/10 transition-colors"
                        >
                          <Pencil weight="light" className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                      </div>
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
