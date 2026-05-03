import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BookEditForm from './BookEditForm';

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (!book) notFound();

  return <BookEditForm book={book} />;
}
