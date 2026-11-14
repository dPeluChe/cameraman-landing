// Contact form transport adapters. The form component is one; only the way the
// payload leaves the browser changes. Providers: docs/GUIDES/CONTACT_FORM.md

export type ContactProvider = 'mailto' | 'external' | 'endpoint';

export interface ContactTransport {
  provider: ContactProvider;
  /** Resolved at build time from site config + env. */
  target: string;
  publicKey?: string;
  honeypotField: string;
  recipient: string;
  subject: string;
  redirectTo?: string;
}

export type ContactValues = Record<string, string>;

export class ContactError extends Error {}

function mailtoHref(transport: ContactTransport, values: ContactValues): string {
  const lines = [];
  for (const [key, value] of Object.entries(values)) {
    if (key !== transport.honeypotField) lines.push(`${key}: ${value}`);
  }
  const body = lines.join('\n');
  const params = new URLSearchParams({ subject: transport.subject, body });
  return `mailto:${transport.recipient}?${params.toString()}`;
}

/**
 * Resolves once the message is accepted. Throws ContactError otherwise so the
 * caller can show `errorMessage` from content without inspecting status codes.
 */
export async function submitContact(transport: ContactTransport, values: ContactValues): Promise<void> {
  // Honeypot filled means a bot: report success and drop the payload silently.
  if (values[transport.honeypotField]) return;

  if (transport.provider === 'mailto') {
    if (typeof window === 'undefined') throw new ContactError('mailto requires a browser');
    window.location.href = mailtoHref(transport, values);
    return;
  }

  if (!transport.target) throw new ContactError(`Missing endpoint for provider "${transport.provider}"`);

  const payload: Record<string, unknown> = { ...values, _subject: transport.subject };
  delete payload[transport.honeypotField];
  if (transport.publicKey) payload.access_key = transport.publicKey;

  const response = await fetch(transport.target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new ContactError(`Contact endpoint responded ${response.status}`);
}
