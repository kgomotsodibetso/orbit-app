import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const service = createServiceClient();

  // Look up institution_id via service client — bypasses RLS JWT-claim requirement
  const { data: profile } = await service
    .from('profiles')
    .select('institution_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.institution_id) {
    return NextResponse.json(
      { error: 'Profile not found — your account may not be fully set up. Contact support.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    isbn_13, title, authors, publisher, published_year,
    subject_area, location_shelf, total_copies,
    acquisition_source, acquisition_cost, cover_url, description,
  } = body;

  if (!isbn_13 || !title) {
    return NextResponse.json({ error: 'isbn_13 and title are required' }, { status: 400 });
  }

  const copies = Math.max(1, parseInt(total_copies) || 1);

  const { data: book, error } = await service
    .from('books')
    .insert({
      institution_id:     profile.institution_id,
      isbn_13,
      title,
      authors:            Array.isArray(authors) ? authors : (authors ?? '').split(',').map((a: string) => a.trim()).filter(Boolean),
      publisher:          publisher || null,
      published_year:     published_year ? parseInt(published_year) : null,
      subject_area:       subject_area || null,
      location_shelf:     location_shelf || null,
      total_copies:       copies,
      available_copies:   copies,
      acquisition_source: acquisition_source || null,
      acquisition_cost:   acquisition_cost ? parseFloat(acquisition_cost) : null,
      cover_url:          cover_url || null,
      description:        description || null,
      created_by:         user.id,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(book, { status: 201 });
}
