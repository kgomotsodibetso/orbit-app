import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Super-admin only: onboard a new institution
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from('institutions')
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data } = await supabase.from('institutions').select('*').order('name');
  return NextResponse.json(data ?? []);
}
