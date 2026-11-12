# Contact form

The form is the conversion point of a landing, and it is the one place a static
site needs something behind it. There is **one component**; only the transport
changes.

- `src/components/islands/ContactForm.tsx` — the UI (the only React island here)
- `src/lib/contact.ts` — the transport adapters
- `src/content/site/<locale>.json → contactForm` — which adapter, and its knobs
- Section `contactForm` in page content — what the form asks

Separating *what it asks* from *how it sends* is what lets a client start on
`mailto` and move to a real endpoint without touching content.

## The three providers

### `mailto` — default

Opens the visitor's mail client with the fields pre-filled.

```jsonc
"contactForm": { "provider": "mailto", "honeypotField": "company_website" }
```

Zero infrastructure, zero cost, works the moment you deploy. It also converts
worse than anything else — some visitors have no mail client configured, and you
get no record of the attempt. Fine for a first launch; not where a client should
stay.

### `external` — third-party form service

POSTs JSON to a service like Formspree or Web3Forms.

```jsonc
"contactForm": { "provider": "external", "honeypotField": "company_website" }
```

```bash
PUBLIC_CONTACT_ENDPOINT="https://api.web3forms.com/submit"
PUBLIC_CONTACT_KEY="your-public-access-key"
```

The site stays fully static. `PUBLIC_CONTACT_KEY` is sent as `access_key` and is a
*public* key by design — do not put a private one there, it ships in the bundle.
Free tiers cap submissions per month; check the client's expected volume.

### `endpoint` — your own API

```jsonc
"contactForm": {
  "provider": "endpoint",
  "endpoint": "https://api.iteris.tech/v1/forms/nordika",
  "honeypotField": "company_website",
  "redirectTo": "/gracias"
}
```

POSTs JSON to whatever you point it at. This is the slot for the internal Iteris
form service: one API for every landing, one place to read submissions, no Resend
account per client.

`endpoint` without `endpoint` set fails the build — the schema enforces it, so the
form can never silently post nowhere. `redirectTo` is handed to
`location.assign` in the island, so it follows the same URL rule as every link:
http(s), mailto, tel, an `#anchor` or a relative path — a `javascript:` value
fails the schema.

## Payload

All non-`mailto` providers send:

```jsonc
{
  "name": "…",
  "email": "…",
  "message": "…",
  "company": "…",          // any extraFields declared in the section
  "reason": "…",
  "_subject": "Nordika — Escríbenos",
  "access_key": "…"        // only when PUBLIC_CONTACT_KEY is set
}
```

The honeypot field is stripped before sending. Headers are
`Content-Type: application/json` and `Accept: application/json`.

Any non-2xx response throws, and the component shows the section's `errorMessage`.
Status codes are deliberately not surfaced to the visitor.

## Fields

Base fields are always `name`, `email`, `message` — all required, labels from
`ui.json` so they stay translated. Anything else is declared per page:

```jsonc
"extraFields": [
  { "name": "company", "label": "Empresa", "type": "text", "required": true },
  { "name": "phone",   "label": "Teléfono", "type": "tel",  "required": false },
  {
    "name": "reason", "label": "Motivo", "type": "select", "required": true,
    "options": ["Diagnóstico en sitio", "Cotización", "Emergencia", "Otro"]
  }
]
```

Types: `text`, `tel`, `email`, `select`, `textarea`. `name` must be a valid
identifier — it becomes the payload key.

## Spam

A honeypot field, hidden from users and visible to bots. When it is filled the
submission is dropped and the form still reports success — a bot that gets an error
retries; one that gets a success moves on.

Change `honeypotField` per site. A field name that is identical across every
landing is the first thing a targeted scraper learns to skip.

No captcha is included. Adding one means third-party JS and an accessibility
liability; if a specific client genuinely needs it, add it in that clone.

## Accessibility

Already handled, and worth not breaking:

- Every input has a `<label>` bound by `htmlFor`
- Required state is announced in text, not by an asterisk alone
- The status message is `role="status"` `aria-live="polite"`
- The submit button disables while sending and shows `ui.sending`
- Native validation stays on — `type="email"` and `required` do real work

## Testing

`mailto` cannot be tested end-to-end in a browser automation run; it hands off to
the OS. Test it by hand.

For `external` / `endpoint`: submit from `npm run preview`, confirm the request in
the Network tab, and confirm the message actually arrived. "The form said success"
is not the same as "someone received it" — check the inbox.
