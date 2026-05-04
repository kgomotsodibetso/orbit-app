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

  const service = createServiceClient();

  // Resolve institution_id from the user's profile
  const { data: profile } = await service
    .from('profiles')
    .select('institution_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.institution_id) {
    return NextResponse.json({ error: 'Institution not found' }, { status: 403 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = (file.name.split('.').pop() ?? 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${profile.institution_id}/logo.${ext}`;

  // Create bucket if needed
  await service.storage.createBucket('school-logos', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'],
    fileSizeLimit: 5 * 1024 * 1024,
  }).catch(() => { /* already exists */ });

  const { error: uploadError } = await service.storage
    .from('school-logos')
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error('[SchoolLogo] upload error:', uploadError.message);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = service.storage.from('school-logos').getPublicUrl(path);

  // Merge the logo_url into institution.settings JSONB
  const { data: inst } = await service
    .from('institutions')
    .select('settings')
    .eq('id', profile.institution_id)
    .single();

  const settings = { ...(inst?.settings as Record<string, unknown> ?? {}), logo_url: publicUrl };

  await service
    .from('institutions')
    .update({ settings })
    .eq('id', profile.institution_id);

  return NextResponse.json({ url: publicUrl });
}
