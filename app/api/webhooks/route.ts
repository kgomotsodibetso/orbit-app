import { NextRequest, NextResponse } from 'next/server';

// Supabase and Panacea webhooks
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  console.log('[Webhook]', body);
  return NextResponse.json({ received: true });
}
