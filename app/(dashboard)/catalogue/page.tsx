import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subject?: string }>;
}) {
  const { q, subject } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('books')
    .select('id, isbn_13, title, authors, subject_area, available_copies, total_copies, cover_url, condition')
    .order('title');

  if (q) {
    query = query.or(`title.ilike.%${q}%,isbn_13.eq.${q}`);
  }
  if (subject) {
    query = query.eq('subject_area', subject);
  }

  const { data: books } = await query.limit(60);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate">Book Catalogue</h1>
          <p className="text-slate/50 text-sm mt-1">{books?.length ?? 0} titles</p>
        </div>
        <Link href="/catalogue/add">
          <Button>
            <Plus className="w-4 h-4" />
            Add Book
          </Button>
        </Link>
      </div>

      {/* Search bar */}
      <form className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/40" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title or scan ISBN…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate/20 bg-white text-sm text-slate placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-steel"
        />
      </form>

      {/* Book grid */}
      {!books?.length ? (
        <div className="text-center py-20">
          <p className="text-slate/40 mb-4">No books found.</p>
          <Link href="/catalogue/add">
            <Button>Add your first book</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => {
            const available = book.available_copies > 0;
            return (
              <Link key={book.id} href={`/catalogue/${book.id}`}>
                <div className="bg-white rounded-2xl border border-slate/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  {/* Cover */}
                  <div className="h-36 bg-cream flex items-center justify-center overflow-hidden">
                    {book.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="h-full w-auto object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-steel/10 flex items-center justify-center">
                        <span className="text-steel/40 text-3xl font-bold">
                          {book.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="font-semibold text-slate text-sm line-clamp-2 mb-1">{book.title}</p>
                    <p className="text-xs text-slate/50 mb-3 truncate">{book.authors.join(', ')}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={available ? 'success' : 'danger'}>
                        {available ? `${book.available_copies} available` : 'All out'}
                      </Badge>
                      {book.subject_area && (
                        <span className="text-xs text-slate/40">{book.subject_area}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
