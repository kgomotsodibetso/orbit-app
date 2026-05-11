'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const GRADES = ['R', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MEMBER_TYPES = ['learner', 'teacher', 'staff', 'community'];

export default function AddLearnerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [newMemberNumber, setNewMemberNumber] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    member_type: 'learner',
    grade: '',
    class_name: '',
    guardian_name: '',
    contact_phone: '',
    contact_email: '',
    notes: '',
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name:     form.full_name,
        member_type:   form.member_type,
        grade:         form.grade || null,
        class_name:    form.class_name || null,
        guardian_name: form.guardian_name || null,
        contact_phone: form.contact_phone || null,
        contact_email: form.contact_email || null,
        notes:         form.notes || null,
      }),
    });

    setSaving(false);

    if (res.ok) {
      const data = await res.json();
      setNewMemberNumber(data.member_number);
      setDone(true);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Failed to add member');
    }
  };

  if (done) {
    return (
      <div className="max-w-lg">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle weight="light" className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate mb-1">Member Added</h2>
          <p className="text-sm text-slate/50 mb-1">{form.full_name}</p>
          <p className="text-sm font-semibold text-steel mb-2">{newMemberNumber}</p>
          <p className="text-xs text-slate/40 mb-8">To set a learner portal PIN, open the member profile.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setDone(false); setForm({ full_name: '', member_type: 'learner', grade: '', class_name: '', guardian_name: '', contact_phone: '', contact_email: '', notes: '' }); }}>
              Add Another
            </Button>
            <Link href="/learners"><Button variant="secondary">View Members</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/learners" className="text-slate/40 hover:text-slate transition-colors">
          <ArrowLeft weight="light" className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-slate">Add Member</h1>
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
                <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          {form.member_type === 'learner' && (
            <>
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
            </>
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
            placeholder="Any special notes about this learner…"
            className="w-full rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-sm text-slate placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-steel resize-none"
          />
        </div>

        <Button type="submit" loading={saving} disabled={!form.full_name} className="w-full" size="lg">
          Add Member
        </Button>
      </form>
    </div>
  );
}
