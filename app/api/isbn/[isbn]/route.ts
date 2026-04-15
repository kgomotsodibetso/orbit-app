import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await params;

  if (!/^\d{13}$/.test(isbn)) {
    return NextResponse.json({ error: 'ISBN must be 13 digits' }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Check isbn_cache first
  const { data: cached } = await supabase
    .from('isbn_cache')
    .select('*')
    .eq('isbn_13', isbn)
    .single();

  if (cached) {
    return NextResponse.json(cached);
  }

  // 2. Fetch from Open Library
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      { next: { revalidate: 86400 } } // cache for 24h at CDN level
    );

    if (!res.ok) throw new Error('Open Library fetch failed');

    const raw = await res.json();
    const entry = raw[`ISBN:${isbn}`];

    if (!entry) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const record = {
      isbn_13: isbn,
      title: entry.title ?? 'Unknown Title',
      authors: (entry.authors ?? []).map((a: { name: string }) => a.name),
      publisher: entry.publishers?.[0]?.name ?? null,
      published_year: entry.publish_date
        ? parseInt(entry.publish_date.slice(-4))
        : null,
      cover_url: entry.cover?.large ?? entry.cover?.medium ?? null,
      description:
        typeof entry.description === 'string'
          ? entry.description
          : entry.description?.value ?? null,
      raw_data: raw,
    };

    // 3. Store in cache (use service role via server client)
    await supabase.from('isbn_cache').upsert(record);

    return NextResponse.json(record);
  } catch (err) {
    console.error('[ISBN API]', err);
    return NextResponse.json({ error: 'Failed to fetch book data' }, { status: 502 });
  }
}
