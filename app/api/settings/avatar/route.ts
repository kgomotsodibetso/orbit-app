import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 413 });
  }

  const service = createServiceClient();

  // Create bucket if it doesn't exist yet (safe to call even if it already exists)
  await service.storage.createBucket('avatars', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    fileSizeLimit: 5 * 1024 * 1024,
  }).catch(() => { /* already exists — ignore */ });

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await service.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = service.storage.from('avatars').getPublicUrl(path);

  // Persist the URL on the profile row immediately
  await service.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

  return NextResponse.json({ url: publicUrl });
}
