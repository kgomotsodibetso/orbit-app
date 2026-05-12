'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const GRADES = ['R', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MEMBER_TYPES = ['learner', 'teacher', 'staff', 'community'];

interface Form {
  full_name: string;
  member_type: string;
  grade: string;
  class_name: string;
  guardian_name: string;
  contact_phone: string;
  contact_email: string;
  notes: string;
  is_active: boolean;
}

export default function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [memberNumber, setMemberNumber] = useState('');
  const [form, setForm] = useState<Form>({
    full_name: '',
    member_type: 'learner',
    grade: '',
    class_name: '',
    guardian_name: '',
    contact_phone: '',
    contact_email: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    params.then(({ id: resolvedId }) => {
      setId(resolvedId);
      const supabase = createClient();
      supabase
        .from('members')
        .select('full_name, member_number, member_type, grade, class_name, guardian_name, contact_phone, contact_email, notes, is_active')
        .eq('id', resolvedId)
        .single()
        .then(({ data }) => {
          if (data) {
            setMemberNumber(data.member_number);
            setForm({
              full_name: data.full_name ?? '',
              member_type: data.member_type ?? 'learner',
              grade: data.grade ?? '',
              class_name: data.class_name ?? '',
              guardian_name: data.guardian_name ?? '',
              contact_phone: data.contact_phone ?? '',
              contact_email: data.contact_email ?? '',
              notes: data.notes ?? '',
              is_active: data.is_active ?? true,
            });
          }
          setLoading(false);
        });
    });
  }, [params]);

  const set =
    (key: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      setDone(true);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Failed to save changes');
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg">
        <div className="h-8 w-48 bg-slate/10 rounded-xl animate-pulse mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-lg">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle weight="light" className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate mb-1">Changes Saved</h2>
          <p className="text-sm text-slate/50 mb-8">{form.full_name} · {memberNumber}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push(`/learners/${id}`)}>View Profile</Button>
            <Link href="/learners"><Button variant="secondary">Back to Members</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/learners/${id}`} className="text-slate/40 hover:text-slate transition-colors">
          <ArrowLeft weight="light" className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate">Edit Member</h1>
          <p className="text-sm text-slate/40 mt-0.5">{memberNumber}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
          <p role="alert" className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Personal Details</p>
          <Input
            label="Full name"
            value={form.full_name}
            onChange={set('full_name')}
            placeholder="Lesedi Mokoena"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate">Type</label>
            <select
              value={form.member_type}
              onChange={set('member_type')}
              className="w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel"
            >
              {MEMBER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {form.member_type === 'learner' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate">Grade</label>
                <select
                  value={form.grade}
                  onChange={set('grade')}
                  className="w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel"
                >
                  <option value="">Select…</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Classroom (optional)"
                value={form.class_name}
                onChange={set('class_name')}
                placeholder="e.g. 7A"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Contact Details</p>
          {form.member_type === 'learner' && (
            <Input
              label="Guardian name (optional)"
              value={form.guardian_name}
              onChange={set('guardian_name')}
              placeholder="Parent or guardian"
            />
          )}
          <Input
            label="Contact phone (optional)"
            type="tel"
            value={form.contact_phone}
            onChange={set('contact_phone')}
            placeholder="071 000 0000"
          />
          <Input
            label="Contact email (optional)"
            type="email"
            value={form.contact_email}
            onChange={set('contact_email')}
            placeholder="parent@email.com"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate/10 p-5">
          <label className="text-sm font-semibold text-slate block mb-1.5">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={3}
            placeholder="Any special notes…"
            className="w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-steel resize-none"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate/10 p-5">
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-3">Account Status</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
              className={`relative w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-steel' : 'bg-slate/20'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </button>
            <span className="text-sm font-medium text-slate">
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-slate/40 mt-2">Inactive members cannot borrow books.</p>
        </div>

        <Button type="submit" loading={saving} disabled={!form.full_name} className="w-full" size="lg">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
