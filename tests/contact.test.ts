// The form is the conversion point and the honeypot is a silent code path, so
// both the happy case and the drop case are asserted.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactError, submitContact, type ContactTransport } from '../src/lib/contact';
import { renderMarkdown } from '../src/lib/markdown';

const transport = (over: Partial<ContactTransport> = {}): ContactTransport => ({
  provider: 'endpoint',
  target: 'https://api.test/forms/acme',
  honeypotField: 'company_website',
  recipient: 'hi@acme.test',
  subject: 'Acme — Contact',
  ...over,
});

const values = { name: 'Ada', email: 'ada@test.dev', message: 'Hello' };

afterEach(() => vi.unstubAllGlobals());

describe('submitContact', () => {
  it('posts the payload with the subject', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await submitContact(transport(), values);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.test/forms/acme');
    expect(JSON.parse(init.body as string)).toMatchObject({ ...values, _subject: 'Acme — Contact' });
  });

  it('drops a submission whose honeypot is filled, without reporting an error', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitContact(transport(), { ...values, company_website: 'spam.test' })).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never sends the honeypot field itself', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await submitContact(transport(), { ...values, company_website: '' });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).not.toHaveProperty('company_website');
  });

  it('attaches the public key only when one is configured', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await submitContact(transport({ provider: 'external', publicKey: 'pk_123' }), values);

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string).access_key).toBe('pk_123');
  });

  it('throws ContactError on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })));
    await expect(submitContact(transport(), values)).rejects.toBeInstanceOf(ContactError);
  });

  it('throws rather than posting nowhere when the target is empty', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitContact(transport({ target: '' }), values)).rejects.toBeInstanceOf(ContactError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('renderMarkdown', () => {
  it('renders markdown', () => {
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
  });

  it('escapes HTML so a CMS cannot inject markup', () => {
    const html = renderMarkdown('<img src=x onerror="alert(1)"> and <script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onerror="alert(1)"');
    expect(html).toContain('&lt;script&gt;');
  });
});
