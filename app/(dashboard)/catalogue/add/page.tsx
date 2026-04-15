'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import ISBNScanner from '@/components/scanner/ISBNScanner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

interface BookForm {
  isbn_13: string;
  title: string;
  authors: string;
  publisher: string;
  published_year: string;
  subject_area: string;
  location_shelf: string;
  total_copies: string;
  acquisition_source: string;
  acquisition_cost: string;
  cover_url: string;
  description: string;
}

const emptyForm: BookForm = {
  isbn_13: '', title: '', authors: '', publisher: '',
  published_year: '', subject_area: '', location_shelf: '',
  total_copies: '1', acquisition_source: '', acquisition_cost: '',
  cover_url: '', description: '',
};

export default function AddBookPage() {
  const router = useRouter();
  const [form, setForm] = useState<BookForm>(emptyForm);
  const [lookingUp, setLookingUp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (isbn: string) => {
    setLookingUp(true);
    setError('');
    try {
      const res = await fetch(`/api/isbn/${isbn}`);
      if (!res.ok) throw new Error('Book not found in Open Library');
      const data = await res.json();
      setForm((f) => ({
        ...f,
        isbn_13: isbn,
        title: data.title ?? '',
        authors: (data.authors ?? []).join(', '),
        publisher: data.publisher ?? '',
        published_year: data.published_year ? String(data.published_year) : '',
        cover_url: data.cover_url ?? '',
        description: data.description ?? '',
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ISBN lookup failed');
      setForm((f) => ({ ...f, isbn_13: isbn }));
    } finally {
      setLookingUp(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const copies = parseInt(form.total_copies) || 1;

      const { error: insertError } = await supabase.from('books').insert({
        institution_id: profile.institution_id,
        isbn_13: form.isbn_13,
        title: form.title,
        authors: form.authors.split(',').map((a) => a.trim()).filter(Boolean),
        publisher: form.publisher || null,
        published_year: form.published_year ? parseInt(form.published_year) : null,
        subject_area: form.subject_area || null,
        location_shelf: form.location_shelf || null,
        total_copies: copies,
        available_copies: copies,
        acquisition_source: form.acquisition_source || null,
        acquisition_cost: form.acquisition_cost ? parseFloat(form.acquisition_cost) : null,
        cover_url: form.cover_url || null,
        description: form.description || null,
        created_by: user.id,
      });

      if (insertError) throw new Error(insertError.message);
      router.push('/catalogue');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof BookForm, label: string, opts?: { type?: string; placeholder?: string }) => (
    <Input
      label={label}
      value={form[key]}
      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      type={opts?.type ?? 'text'}
      placeholder={opts?.placeholder}
    />
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/catalogue" className="text-slate/40 hover:text-slate transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate">Add Book</h1>
          <p className="text-slate/50 text-sm mt-0.5">Scan ISBN to auto-fill details</p>
        </div>
      </div>

      {/* Scanner */}
      <div className="mb-6">
        <ISBNScanner onScan={handleScan} />
        {lookingUp && (
          <p className="text-sm text-steel mt-2 flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-steel/30 border-t-steel rounded-full animate-spin inline-block" />
            Looking up ISBN…
          </p>
        )}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Book Details</p>
          {field('isbn_13', 'ISBN-13', { placeholder: '9780000000000' })}
          {field('title', 'Title')}
          {field('authors', 'Authors', { placeholder: 'Comma-separated' })}
          <div className="grid grid-cols-2 gap-4">
            {field('publisher', 'Publisher')}
            {field('published_year', 'Year', { type: 'number', placeholder: '2024' })}
          </div>
          {field('subject_area', 'Subject Area', { placeholder: 'e.g. Mathematics, Fiction' })}
        </div>

        <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Library Details</p>
          <div className="grid grid-cols-2 gap-4">
            {field('location_shelf', 'Shelf Location', { placeholder: 'e.g. A-12' })}
            {field('total_copies', 'Copies', { type: 'number' })}
          </div>
          {field('acquisition_source', 'Source', { placeholder: 'donation / purchased / DBE_supply' })}
          {field('acquisition_cost', 'Cost (ZAR)', { type: 'number', placeholder: '0.00' })}
        </div>

        {/* Cover preview */}
        {form.cover_url && (
          <div className="flex items-center gap-4 bg-cream rounded-2xl p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.cover_url} alt="Cover" className="h-20 rounded-lg shadow" />
            <div>
              <p className="font-semibold text-slate text-sm">{form.title}</p>
              <p className="text-xs text-slate/50">{form.authors}</p>
            </div>
          </div>
        )}

        {!form.cover_url && form.title && (
          <div className="flex items-center gap-4 bg-cream rounded-2xl p-4">
            <div className="w-14 h-20 bg-steel/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-steel/40" />
            </div>
            <div>
              <p className="font-semibold text-slate text-sm">{form.title}</p>
              <p className="text-xs text-slate/50">{form.authors}</p>
            </div>
          </div>
        )}

        <Button type="submit" loading={saving} disabled={!form.isbn_13 || !form.title} className="w-full" size="lg">
          Add to Catalogue
        </Button>
      </form>
    </div>
  );
}
