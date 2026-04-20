interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SMS via Twilio REST API.
 * Docs: https://www.twilio.com/docs/sms/api
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID  — from Twilio Console dashboard
 *   TWILIO_AUTH_TOKEN   — from Twilio Console dashboard
 *   TWILIO_FROM_NUMBER  — your Twilio phone number e.g. +12015551234
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[Twilio] SMS env vars not set — SMS skipped');
    return { success: false, error: 'SMS not configured' };
  }

  // Normalise SA mobile number: 0821234567 → +27821234567
  const normalised = to.startsWith('0') ? `+27${to.slice(1)}` : to;

  if (!/^\+\d{10,15}$/.test(normalised)) {
    console.warn('[Twilio] Invalid phone number — SMS skipped:', to);
    return { success: false, error: 'Invalid phone number' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  // Twilio uses form-encoded bodies, not JSON
  const body = new URLSearchParams({
    To: normalised,
    From: fromNumber,
    Body: message,
  });

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[Twilio] Error response:', data);
      return { success: false, error: data.message ?? 'Unknown error' };
    }

    return { success: true, messageId: data.sid };
  } catch (err) {
    console.error('[Twilio] Network error:', err);
    return { success: false, error: String(err) };
  }
}
