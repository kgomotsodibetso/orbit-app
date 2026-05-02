'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2, UserCheck, BookOpen } from 'lucide-react';
import Link from 'next/link';
import ISBNScanner from '@/components/scanner/ISBNScanner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

type Step = 'member' | 'book' | 'confirm' | 'done';

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('member');
  const [memberQuery, setMemberQuery] = useState('');
  const [member, setMember] = useState<{ id: string; full_name: string; member_number: string; grade?: string | null } | null>(null);
  const [book, setBook] = useState<{ id: string; title: string; authors: string[]; cover_url?: string | null; available_copies: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupMember = async () => {
    setLoading(true); setError('');
    const supabase = createClient();
    const { data } = await supabase
      .from('members')
      .select('id, full_name, member_number, grade')
      .or(`member_number.ilike.%${memberQuery}%,full_name.ilike.%${memberQuery}%`)
      .eq('is_active', true)
      .limit(1)
      .single();
    setLoading(false);
    if (data) { setMember(data); setStep('book'); }
    else setError('Learner not found. Check the member number.');
  };

  const handleBookScan = async (isbn: string) => {
    setLoading(true); setError('');
    const supabase = createClient();
    const { data } = await supabase
      .from('books')
      .select('id, title, authors, cover_url, available_copies')
      .eq('isbn_13', isbn)
      .gt('available_copies', 0)
      .single();
    setLoading(false);
    if (data) { setBook(data); setStep('confirm'); }
    else setError('Book not found or no copies available.');
  };

  const confirmCheckout = async () => {
    if (!member || !book) return;
    setLoading(true); setError('');
    const res = await fetch('/api/loans/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: book.id, member_id: member.id }),
    });
    setLoading(false);
    if (res.ok) setStep('done');
    else {
      const d = await res.json();
      setError(d.error ?? 'Checkout failed');
    }
  };

  const reset = () => { setStep('member'); setMember(null); setBook(null); setMemberQuery(''); setError(''); };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/loans" className="text-slate/40 hover:text-slate">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-slate">Check Out</h1>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {(['member', 'book', 'confirm'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s ? 'bg-steel text-white' :
              ['member', 'book', 'confirm'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-slate/10 text-slate/40'
            }`}>{i + 1}</div>
            {i < 2 && <div className="flex-1 h-0.5 bg-slate/10 w-8" />}
          </div>
        ))}
        <span className="text-xs text-slate/40 ml-2 capitalize">{step}</span>
      </div>

      {error && <p className="text-sm text-red-500 mb-4 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {/* Step 1: Member lookup */}
      {step === 'member' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-steel/5 rounded-2xl border border-steel/20 mb-2">
            <UserCheck className="w-5 h-5 text-steel" />
            <p className="text-sm font-medium text-slate">Search for learner by name or member number</p>
          </div>
          <Input
            label="Learner name or member number"
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookupMember()}
            placeholder="e.g. ORB-0042 or Lesedi"
          />
          <Button onClick={lookupMember} loading={loading} disabled={!memberQuery} className="w-full">
            Find Learner
          </Button>
        </div>
      )}

      {/* Step 2: Book scan */}
      {step === 'book' && member && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-semibold text-green-800">{member.full_name}</p>
              <p className="text-xs text-green-600">{member.member_number}{member.grade ? ` · Grade ${member.grade}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-steel/5 rounded-2xl border border-steel/20">
            <BookOpen className="w-5 h-5 text-steel" />
            <p className="text-sm font-medium text-slate">Now scan the book ISBN</p>
          </div>
          <ISBNScanner onScan={handleBookScan} />
          {loading && <p className="text-sm text-steel">Looking up book…</p>}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && member && book && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate/10 p-5 space-y-3">
            <p className="text-xs font-semibold text-slate/40 uppercase tracking-widest">Confirm Checkout</p>
            <div className="flex gap-3">
              {book.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.cover_url} alt={book.title} className="w-14 h-20 object-cover rounded-lg" />
              ) : (
                <div className="w-14 h-20 bg-steel/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-steel/40" />
                </div>
              )}
              <div>
                <p className="font-semibold text-slate">{book.title}</p>
                <p className="text-sm text-slate/50">{book.authors.join(', ')}</p>
              </div>
            </div>
            <div className="border-t border-slate/10 pt-3">
              <p className="text-sm text-slate">
                Checking out to <span className="font-semibold">{member.full_name}</span>
              </p>
              <p className="text-xs text-slate/40 mt-1">Due in 14 days</p>
            </div>
          </div>
          <Button onClick={confirmCheckout} loading={loading} className="w-full" size="lg">
            Confirm Checkout
          </Button>
          <Button variant="ghost" onClick={() => setStep('book')} className="w-full">
            ← Change Book
          </Button>
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate mb-2">Checked Out!</h2>
          <p className="text-sm text-slate/50 mb-6">
            <span className="font-medium text-slate">{book?.title}</span> is now with{' '}
            <span className="font-medium text-slate">{member?.full_name}</span>
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset}>Check Out Another</Button>
            <Link href="/loans"><Button variant="secondary">View Loans</Button></Link>
          </div>
        </div>
      )}
    </div>
  );
}
