'use client';

import { useState } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { InstitutionRow } from '@/types/database';

interface Props {
  institution: InstitutionRow;
}

export default function InstitutionForm({ institution }: Props) {
  const [name, setName] = useState(institution.name);
  const [contactEmail, setContactEmail] = useState(institution.contact_email);
  const [contactPhone, setContactPhone] = useState(institution.contact_phone ?? '');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/settings/institution', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim() || null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? 'Failed to save changes');
    } else {
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }
  };

  const address = institution.address as {
    street?: string;
    suburb?: string;
    city?: string;
    postal_code?: string;
  } | null;

  return (
    <div className="bg-white rounded-2xl border border-slate/10 p-5">
      {/* Read-only identity fields */}
      <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-slate/10">
        <div>
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Type</p>
          <p className="text-sm font-medium text-slate capitalize">{institution.type}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Province</p>
          <p className="text-sm font-medium text-slate">{institution.province}</p>
        </div>
        {institution.district && (
          <div>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">District</p>
            <p className="text-sm font-medium text-slate">{institution.district}</p>
          </div>
        )}
        {institution.emis_number && (
          <div>
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">EMIS Number</p>
            <p className="text-sm font-medium text-slate font-mono">{institution.emis_number}</p>
          </div>
        )}
        {address && (
          <div className="col-span-2">
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Address</p>
            <p className="text-sm font-medium text-slate">
              {[address.street, address.suburb, address.city, address.postal_code]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Slug</p>
          <p className="text-sm font-medium text-slate/50 font-mono">{institution.slug}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-1">Member Since</p>
          <p className="text-sm font-medium text-slate">
            {new Date(institution.created_at).toLocaleDateString('en-ZA')}
          </p>
        </div>
      </div>

      {/* Editable fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Institution Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
          <Input
            label="Contact Phone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+27 xx xxx xxxx"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          {done ? (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Saved successfully
            </span>
          ) : (
            <span />
          )}
          <Button type="submit" loading={saving} variant="primary" size="sm">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
