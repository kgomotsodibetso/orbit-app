import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 413 });
  }

  // Convert Web File → ArrayBuffer → Buffer so Supabase Storage SDK
  // receives a type it handles reliably in Node.js server context
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const mimeType = file.type || 'image/jpeg';
  const path = `${user.id}/avatar.${ext}`;

  const service = createServiceClient();

  // Create bucket if it doesn't exist (error "already exists" is ignored)
  const { error: bucketError } = await service.storage.createBucket('avatars', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    fileSizeLimit: 5 * 1024 * 1024,
  });
  // 23505 = unique_violation means the bucket already exists — safe to continue
  if (bucketError && !bucketError.message.includes('already exists') && !bucketError.message.includes('23505')) {
    console.error('[Avatar] bucket create error:', bucketError.message);
    // Non-fatal: attempt the upload anyway in case bucket was created manually
  }

  const { error: uploadError } = await service.storage
    .from('avatars')
    .upload(path, buffer, { upsert: true, contentType: mimeType });

  if (uploadError) {
    console.error('[Avatar] upload error:', uploadError.message);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = service.storage.from('avatars').getPublicUrl(path);

  // Immediately persist URL to the profile row
  await service.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

  return NextResponse.json({ url: publicUrl });
}
