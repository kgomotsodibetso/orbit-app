interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SMS via Panacea Mobile (South African SMS gateway).
 * Docs: https://www.panaceamobile.com/
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  const apiKey = process.env.PANACEA_API_KEY;
  const senderId = process.env.PANACEA_SENDER_ID ?? 'OrbitTech';

  if (!apiKey) {
    console.warn('[Panacea] PANACEA_API_KEY not set — SMS skipped');
    return { success: false, error: 'API key not configured' };
  }

  // Normalise SA mobile number: 0821234567 → +27821234567
  const normalised = to.startsWith('0') ? `+27${to.slice(1)}` : to;

  if (!/^\+\d{10,15}$/.test(normalised)) {
    console.warn('[Panacea] Invalid phone number — SMS skipped:', to);
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const res = await fetch('https://api.panaceamobile.com/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: normalised,
        from: senderId,
        body: message,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[Panacea] Error response:', text);
      return { success: false, error: text };
    }

    const data = await res.json();
    return { success: true, messageId: data.message_id ?? data.id };
  } catch (err) {
    console.error('[Panacea] Network error:', err);
    return { success: false, error: String(err) };
  }
}
