import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Default from address — override with EMAIL_FROM env var once you have a
// verified domain in Resend. Until then, onboarding@resend.dev works for
// testing but can only send to your own Resend account email.
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? 'Orbit Library <onboarding@resend.dev>';

interface SendOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(opts: SendOptions): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set — email skipped');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from:     EMAIL_FROM,
      to:       Array.isArray(opts.to) ? opts.to : [opts.to],
      subject:  opts.subject,
      html:     opts.html,
      ...(opts.replyTo && { reply_to: opts.replyTo }),
    });

    if (error) {
      console.error('[Email] send error:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Email] unexpected error:', msg);
    return { ok: false, error: msg };
  }
}
