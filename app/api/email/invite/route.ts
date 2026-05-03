import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email';
import { invitationEmail } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { email: inviteeEmail, role } = await request.json();
  if (!inviteeEmail || !role) {
    return NextResponse.json({ error: 'email and role are required' }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: profile } = await service
    .from('profiles')
    .select('full_name, institution_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.institution_id) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
  }

  const { data: institution } = await service
    .from('institutions')
    .select('name')
    .eq('id', profile.institution_id)
    .single();

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orbit.school';
  const signupUrl = `${appUrl}/register?invite=${encodeURIComponent(inviteeEmail)}&school=${encodeURIComponent(institution?.name ?? '')}`;

  const result = await sendEmail({
    to:       inviteeEmail,
    subject:  `You're invited to join ${institution?.name ?? 'the library'} on Orbit`,
    html:     invitationEmail({
      schoolName:   institution?.name ?? 'Your School',
      inviterName:  profile.full_name,
      inviteeEmail,
      role,
      signupUrl,
    }),
    replyTo: user.email,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Failed to send invitation' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
