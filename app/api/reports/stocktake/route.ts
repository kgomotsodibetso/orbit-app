import { createClient } from '@/lib/supabase/server';

type BookRow = {
  title: string;
  authors: string[];
  isbn_13: string | null;
  isbn_10: string | null;
  condition: string;
  location_shelf: string | null;
  subject_area: string | null;
  grade_level: string[] | null;
  total_copies: number;
  available_copies: number;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  barcode: string | null;
  publisher: string | null;
  published_year: number | null;
};

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const { data: rawBooks, error } = await supabase
    .from('books')
    .select(
      'title, authors, isbn_13, isbn_10, condition, location_shelf, subject_area, grade_level, ' +
        'total_copies, available_copies, acquisition_date, acquisition_cost, barcode, publisher, published_year'
    )
    .order('title', { ascending: true })
    .limit(10000);

  if (error || !rawBooks) {
    return Response.json({ error: 'Failed to fetch books' }, { status: 500 });
  }

  const books = rawBooks as unknown as BookRow[];

  const csvHeaders = [
    'Title',
    'Authors',
    'ISBN-13',
    'ISBN-10',
    'Condition',
    'Subject Area',
    'Grade Level',
    'Location (Shelf)',
    'Total Copies',
    'Available',
    'On Loan',
    'Publisher',
    'Year',
    'Acquisition Date',
    'Cost (R)',
    'Barcode',
  ];

  const rows = books.map((b) => [
    esc(b.title ?? ''),
    esc((b.authors ?? []).join('; ')),
    esc(b.isbn_13 ?? ''),
    esc(b.isbn_10 ?? ''),
    esc(b.condition),
    esc(b.subject_area ?? ''),
    esc((b.grade_level ?? []).join('; ')),
    esc(b.location_shelf ?? ''),
    b.total_copies,
    b.available_copies,
    b.total_copies - b.available_copies,
    esc(b.publisher ?? ''),
    b.published_year ?? '',
    esc(
      b.acquisition_date
        ? new Date(b.acquisition_date).toLocaleDateString('en-ZA')
        : ''
    ),
    b.acquisition_cost != null ? Number(b.acquisition_cost).toFixed(2) : '',
    esc(b.barcode ?? ''),
  ]);

  // UTF-8 BOM so Excel opens with correct encoding on Windows
  const csv =
    '\uFEFF' +
    [csvHeaders, ...rows].map((r) => r.join(',')).join('\r\n');

  const date = new Date().toISOString().split('T')[0];

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="stocktake-${date}.csv"`,
    },
  });
}

function esc(val: string): string {
  if (/[,"\n\r]/.test(val)) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
