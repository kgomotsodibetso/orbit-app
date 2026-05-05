'use client';

import { BookOpen, ArrowsLeftRight, Clock, User, MagnifyingGlass } from '@phosphor-icons/react';
import { useState } from 'react';

interface Member {
  id: string;
  full_name: string;
  member_number: string | null;
  grade: string | null;
  class_name: string | null;
  max_loans: number;
}

interface Loan {
  id: string;
  status: string;
  due_date: string | null;
  checked_out_at: string;
  returned_at: string | null;
  books: { id: string; title: string; cover_url: string | null; authors: string[] } | null;
}

interface Book {
  id: string;
  title: string;
  authors: string[];
  subject_area: string | null;
  available_copies: number;
}

interface Props {
  member: Member;
  loans: Loan[];
  books: Book[];
}

export default function LearnerPortalClient({ member, loans, books }: Props) {
  const [search, setSearch] = useState('');

  const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'overdue');
  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.authors.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  const isOverdue = (loan: Loan) => {
    if (!loan.due_date) return false;
    return new Date(loan.due_date) < new Date() && loan.status === 'active';
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-slate text-cream px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-lavender/20 flex items-center justify-center">
            <User weight="light" className="w-5 h-5 text-lavender" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">{member.full_name}</p>
            <p className="text-cream/50 text-xs">
              {member.grade ? `Grade ${member.grade}` : 'Learner'}
              {member.class_name ? ` · ${member.class_name}` : ''}
            </p>
          </div>
        </div>
        <form action="/api/learner/logout" method="POST">
          <button
            type="submit"
            className="text-xs text-cream/50 hover:text-cream transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Active loans */}
        <section>
          <h2 className="flex items-center gap-2 text-xs font-semibold text-slate/40 uppercase tracking-widest mb-3">
            <ArrowsLeftRight weight="light" className="w-3.5 h-3.5" />
            My Books ({activeLoans.length})
          </h2>

          {activeLoans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate/10 p-8 text-center">
              <BookOpen weight="light" className="w-10 h-10 text-slate/20 mx-auto mb-2" />
              <p className="text-sm text-slate/50">No books checked out</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeLoans.map((loan) => (
                <div
                  key={loan.id}
                  className={`bg-white rounded-2xl border p-4 flex items-center gap-3 ${
                    isOverdue(loan) ? 'border-red-200 bg-red-50/50' : 'border-slate/10'
                  }`}
                >
                  <div className="w-10 h-14 rounded-lg bg-steel/10 flex items-center justify-center shrink-0">
                    {loan.books?.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={loan.books.cover_url}
                        alt={loan.books.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <BookOpen weight="light" className="w-5 h-5 text-steel/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate truncate">{loan.books?.title ?? 'Unknown'}</p>
                    <p className="text-xs text-slate/50 truncate">{loan.books?.authors.join(', ')}</p>
                    {loan.due_date && (
                      <p className={`text-xs mt-1 flex items-center gap-1 ${isOverdue(loan) ? 'text-red-500' : 'text-slate/40'}`}>
                        <Clock weight="light" className="w-3 h-3" />
                        {isOverdue(loan) ? 'Overdue — ' : 'Due '}
                        {new Date(loan.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Browse books */}
        <section>
          <h2 className="flex items-center gap-2 text-xs font-semibold text-slate/40 uppercase tracking-widest mb-3">
            <BookOpen weight="light" className="w-3.5 h-3.5" />
            Browse Books
          </h2>

          <div className="relative mb-3">
            <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate/20 bg-white text-sm text-slate focus:outline-none focus:ring-2 focus:ring-steel"
            />
          </div>

          {filteredBooks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate/10 p-8 text-center">
              <p className="text-sm text-slate/50">No books found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-2xl border border-slate/10 p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-steel/10 flex items-center justify-center shrink-0">
                    <BookOpen weight="light" className="w-4 h-4 text-steel/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate truncate">{book.title}</p>
                    <p className="text-xs text-slate/50 truncate">{book.authors.join(', ')}</p>
                  </div>
                  <span className="text-xs text-green-600 font-semibold shrink-0">
                    {book.available_copies} avail
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
