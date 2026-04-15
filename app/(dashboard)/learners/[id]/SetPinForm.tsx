'use client';

import { useState } from 'react';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function SetPinForm({ memberId, hasPin }: { memberId: string; hasPin: boolean }) {
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }

    setSaving(true);
    setError('');

    const pinHash = await hashPin(pin);

    const res = await fetch(`/api/learner/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: memberId, pin_hash: pinHash }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? 'Failed to set PIN');
    } else {
      setDone(true);
      setPin('');
      setTimeout(() => setDone(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate/10 p-5">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-4 h-4 text-steel" />
        <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">
          Learner Portal PIN
        </p>
        {hasPin && (
          <span className="ml-auto text-xs bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded-full border border-green-200">
            PIN set
          </span>
        )}
      </div>

      {done ? (
        <div className="flex items-center gap-2 text-green-600 py-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-semibold">PIN updated successfully</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label={hasPin ? 'New PIN (4 digits)' : 'Set PIN (4 digits)'}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setError('');
                setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
              }}
              placeholder="e.g. 1234"
              error={error}
            />
          </div>
          <Button
            type="submit"
            loading={saving}
            disabled={pin.length !== 4}
            variant="secondary"
          >
            {hasPin ? 'Update' : 'Set PIN'}
          </Button>
        </form>
      )}

      <p className="text-xs text-slate/40 mt-3">
        The learner uses their member number + this PIN to sign in at{' '}
        <span className="font-semibold">/learner/login</span>.
      </p>
    </div>
  );
}
