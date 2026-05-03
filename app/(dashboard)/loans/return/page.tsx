'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import ISBNScanner from '@/components/scanner/ISBNScanner';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

type Condition = 'good' | 'damaged' | 'lost';
type Step = 'scan' | 'condition' | 'done';

interface ActiveLoan {
  id: string;
  due_date: string;
  status: string;
  books: { title: string; cover_url?: string | null; authors: string[] } | null;
  members: { full_name: string } | null;
}

export default function ReturnPage() {
  const [step, setStep] = useState<Step>('scan');
  const [loan, setLoan] = useState<ActiveLoan | null>(null);
  const [condition, setCondition] = useState<Condition>('good');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (isbn: string) => {
    setLoading(true); setError('');
    const supabase = createClient();

    // Step 1: resolve ISBN → book_id. Filtering loans by books.isbn_13 without
    // !inner embedding is an outer join and won't constrain the parent rows.
    const { data: book } = await supabase
      .from('books')
      .select('id')
      .eq('isbn_13', isbn)
      .single();

    if (!book) {
      setLoading(false);
      setError('Book not found in catalogue.');
      return;
    }

    // Step 2: find the most recent active loan for that book
    const { data } = await supabase
      .from('loans')
      .select('id, due_date, status, books(title, cover_url, authors), members(full_name)')
      .eq('book_id', book.id)
      .in('status', ['active', 'overdue'])
      .order('checked_out_at', { ascending: false })
      .limit(1)
      .single();

    setLoading(false);
    if (data) { setLoan(data as unknown as ActiveLoan); setStep('condition'); }
    else setError('No active loan found for this book.');
  };

  const confirmReturn = async () => {
    if (!loan) return;
    setLoading(true); setError('');
    const res = await fetch('/api/loans/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loan_id: loan.id, condition_on_return: condition }),
    });
    setLoading(false);
    if (res.ok) setStep('done');
    else {
      const d = await res.json();
      setError(d.error ?? 'Return failed');
    }
  };

  const reset = () => { setStep('scan'); setLoan(null); setCondition('good'); setError(''); };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/loans" className="text-slate/40 hover:text-slate">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-slate">Return Book</h1>
      </div>

      {error && <p className="text-sm text-red-500 mb-4 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {step === 'scan' && (
        <div className="space-y-4">
          <p className="text-sm text-slate/60">Scan the book barcode to find its active loan.</p>
          <ISBNScanner onScan={handleScan} />
          {loading && <p className="text-sm text-steel">Looking up loan…</p>}
        </div>
      )}

      {step === 'condition' && loan && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate/10 p-5">
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest mb-3">Book Being Returned</p>
            <p className="font-semibold text-slate">{loan.books?.title}</p>
            <p className="text-sm text-slate/50">{loan.members?.full_name} · Due {loan.due_date}</p>
            {loan.status === 'overdue' && (
              <span className="inline-block mt-2 text-xs font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate mb-2">Book condition on return:</p>
            <div className="grid grid-cols-3 gap-2">
              {(['good', 'damaged', 'lost'] as Condition[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-colors capitalize cursor-pointer ${
                    condition === c ? 'btn-primary' : 'border border-slate/20 bg-white text-slate hover:bg-cream/60'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={confirmReturn} loading={loading} className="w-full" size="lg">
            {condition === 'lost' ? 'Mark as Lost' : 'Confirm Return'}
          </Button>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate mb-2">
            {condition === 'lost' ? 'Marked as Lost' : 'Returned!'}
          </h2>
          <p className="text-sm text-slate/50 mb-6">{loan?.books?.title}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset}>Return Another</Button>
            <Link href="/loans"><Button variant="secondary">View Loans</Button></Link>
          </div>
        </div>
      )}
    </div>
  );
}
