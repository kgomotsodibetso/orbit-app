'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Database } from '@/types/database';

type BookRow = Database['public']['Tables']['books']['Row'];

const CONDITIONS = ['new', 'good', 'fair', 'poor', 'damaged', 'lost'] as const;

interface Props { book: BookRow }

export default function BookEditForm({ book }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    title:              book.title,
    subtitle:           book.subtitle ?? '',
    authors:            (book.authors as string[]).join(', '),
    publisher:          book.publisher ?? '',
    published_year:     book.published_year ? String(book.published_year) : '',
    language:           book.language ?? '',
    cover_url:          book.cover_url ?? '',
    description:        book.description ?? '',
    subject_area:       book.subject_area ?? '',
    grade_level:        ((book.grade_level ?? []) as string[]).join(', '),
    dewey_decimal:      book.dewey_decimal ?? '',
    location_shelf:     book.location_shelf ?? '',
    condition:          book.condition,
    total_copies:       String(book.total_copies),
    is_reference_only:  book.is_reference_only,
    acquisition_date:   book.acquisition_date ?? '',
    acquisition_source: book.acquisition_source ?? '',
    acquisition_cost:   book.acquisition_cost != null ? String(book.acquisition_cost) : '',
    barcode:            book.barcode ?? '',
    tags:               ((book.tags ?? []) as string[]).join(', '),
  });

  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    const payload = {
      title:              form.title.trim(),
      subtitle:           form.subtitle.trim() || null,
      authors:            form.authors.split(',').map(a => a.trim()).filter(Boolean),
      publisher:          form.publisher.trim() || null,
      published_year:     form.published_year ? parseInt(form.published_year) : null,
      language:           form.language.trim() || 'en',
      cover_url:          form.cover_url.trim() || null,
      description:        form.description.trim() || null,
      subject_area:       form.subject_area.trim() || null,
      grade_level:        form.grade_level.split(',').map(g => g.trim()).filter(Boolean),
      dewey_decimal:      form.dewey_decimal.trim() || null,
      location_shelf:     form.location_shelf.trim() || null,
      condition:          form.condition,
      total_copies:       parseInt(form.total_copies) || 1,
      is_reference_only:  form.is_reference_only,
      acquisition_date:   form.acquisition_date || null,
      acquisition_source: form.acquisition_source.trim() || null,
      acquisition_cost:   form.acquisition_cost ? parseFloat(form.acquisition_cost) : null,
      barcode:            form.barcode.trim() || null,
      tags:               form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(`/api/books/${book.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      router.push(`/catalogue/${book.id}`);
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Delete failed');
      router.push('/catalogue');
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/catalogue/${book.id}`} className="text-slate/40 hover:text-slate transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate">Edit Book</h1>
          <p className="text-slate/50 text-sm mt-0.5 line-clamp-1">{book.title}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">

        {/* Core details */}
        <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Core Details</p>

          <Input label="Title *" value={form.title} onChange={set('title')} required />
          <Input label="Subtitle" value={form.subtitle} onChange={set('subtitle')} />
          <Input label="Authors" value={form.authors} onChange={set('authors')} placeholder="Comma-separated" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Publisher" value={form.publisher} onChange={set('publisher')} />
            <Input label="Year" type="number" value={form.published_year} onChange={set('published_year')} placeholder="2024" />
          </div>
          <Input label="Language" value={form.language} onChange={set('language')} placeholder="en" />
          <Input label="Cover URL" value={form.cover_url} onChange={set('cover_url')} placeholder="https://…" />

          {form.cover_url && (
            <div className="flex items-center gap-4 bg-cream rounded-xl p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.cover_url} alt="Cover preview" className="h-16 rounded-lg shadow object-cover" />
              <p className="text-sm text-slate/60 italic">Cover preview</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-3">
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Description</p>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={4}
            placeholder="Book synopsis or notes…"
            className="w-full px-4 py-2.5 rounded-xl border border-slate/20 bg-cream/40 text-sm text-slate placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-steel resize-none"
          />
        </div>

        {/* Library details */}
        <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Library Details</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Subject Area" value={form.subject_area} onChange={set('subject_area')} placeholder="e.g. Mathematics" />
            <Input label="Grade Level" value={form.grade_level} onChange={set('grade_level')} placeholder="e.g. 7, 8, 9" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Dewey Decimal" value={form.dewey_decimal} onChange={set('dewey_decimal')} placeholder="e.g. 823.914" />
            <Input label="Shelf Location" value={form.location_shelf} onChange={set('location_shelf')} placeholder="e.g. A-12" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Condition select */}
            <div>
              <label className="text-sm font-semibold text-slate block mb-1.5">Condition</label>
              <select
                value={form.condition}
                onChange={set('condition')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate/20 bg-white text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel capitalize"
              >
                {CONDITIONS.map(c => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <Input
              label="Total Copies"
              type="number"
              value={form.total_copies}
              onChange={set('total_copies')}
              placeholder="1"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_reference_only}
              onChange={e => setForm(f => ({ ...f, is_reference_only: e.target.checked }))}
              className="w-4 h-4 accent-steel"
            />
            <span className="text-sm font-medium text-slate">Reference only (cannot be borrowed)</span>
          </label>
        </div>

        {/* Acquisition */}
        <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-4">
          <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Acquisition</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Acquisition Date" type="date" value={form.acquisition_date} onChange={set('acquisition_date')} />
            <Input label="Source" value={form.acquisition_source} onChange={set('acquisition_source')} placeholder="e.g. DBE supply" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Cost (ZAR)" type="number" value={form.acquisition_cost} onChange={set('acquisition_cost')} placeholder="0.00" />
            <Input label="Barcode" value={form.barcode} onChange={set('barcode')} />
          </div>
          <Input label="Tags" value={form.tags} onChange={set('tags')} placeholder="Comma-separated tags" />
        </div>

        {/* Save error */}
        {saveError && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" loading={saving} disabled={!form.title.trim()} size="lg" className="flex-1">
            Save Changes
          </Button>
          <Link href={`/catalogue/${book.id}`}>
            <Button type="button" variant="secondary" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-8 bg-white rounded-2xl border border-red-100 p-5">
        <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-3">Danger Zone</p>

        {!confirmDelete ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate">Delete this book</p>
              <p className="text-xs text-slate/50 mt-0.5">
                Permanently removes the book and all loan history. Cannot be undone.
              </p>
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">
                Are you sure? This will permanently delete <strong>{book.title}</strong> and all its loan records.
              </p>
            </div>

            {deleteError && (
              <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
                size="sm"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Yes, Delete Book
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => { setConfirmDelete(false); setDeleteError(''); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ISBN / cover info footer */}
      <div className="mt-4 flex items-center gap-3 text-xs text-slate/40 px-1">
        <BookOpen className="w-3.5 h-3.5 shrink-0" />
        <span>ISBN-13: <span className="font-mono">{book.isbn_13}</span></span>
      </div>
    </div>
  );
}
