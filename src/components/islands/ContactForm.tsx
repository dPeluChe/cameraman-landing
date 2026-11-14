// The one genuine React island: local form state, async submit and inline status
// need a component runtime. Everything else on the page renders to static HTML.
import { useState, type ComponentProps } from 'react';
import { submitContact, type ContactTransport } from '../../lib/contact';

export interface ExtraField {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
}

// Derived from the element instead of naming FormEvent: React 19 deprecates that
// type and FormEventHandler alongside it. Inference keeps working when they go.
type FormSubmit = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

export interface ContactFormProps {
  transport: ContactTransport;
  extraFields: ExtraField[];
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
  privacyNote?: string;
  labels: { name: string; email: string; message: string; required: string; optional: string; sending: string };
}

type Status = 'idle' | 'sending' | 'success' | 'error';

const inputClass =
  'w-full rounded-md border border-border bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none';

export default function ContactForm(props: ContactFormProps) {
  const { transport, extraFields, submitLabel, successMessage, errorMessage, privacyNote, labels } = props;
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormSubmit) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;

    setStatus('sending');
    try {
      await submitContact(transport, values);
      setStatus('success');
      form.reset();
      if (transport.redirectTo) window.location.assign(transport.redirectTo);
    } catch {
      setStatus('error');
    }
  }

  const requiredMark = (required: boolean) => (
    <span className="ml-1 text-xs font-normal text-fg-subtle">
      ({required ? labels.required : labels.optional})
    </span>
  );

  return (
    <form onSubmit={handleSubmit} noValidate={false} className="space-y-5">
      {/* Honeypot: hidden from users, irresistible to bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name={transport.honeypotField} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-fg">
            {labels.name}
            {requiredMark(true)}
          </span>
          <input name="name" type="text" required autoComplete="name" className={inputClass} />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-fg">
            {labels.email}
            {requiredMark(true)}
          </span>
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>

        {extraFields.map((field) => (
          <label
            key={field.name}
            className={field.type === 'textarea' ? 'block sm:col-span-2' : 'block'}
          >
            <span className="mb-1.5 block text-sm font-medium text-fg">
              {field.label}
              {requiredMark(field.required)}
            </span>

            {field.type === 'select' ? (
              <select name={field.name} required={field.required} className={inputClass}>
                <option value="">—</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea name={field.name} required={field.required} rows={3} className={inputClass} />
            ) : (
              <input name={field.name} type={field.type} required={field.required} className={inputClass} />
            )}
          </label>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-fg">
          {labels.message}
          {requiredMark(true)}
        </span>
        <textarea name="message" required rows={5} className={inputClass} />
      </label>

      {privacyNote && <p className="text-xs leading-relaxed text-fg-subtle">{privacyNote}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-md bg-brand-solid px-6 py-3 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-solid-hover disabled:opacity-60 sm:w-auto"
      >
        {status === 'sending' ? labels.sending : submitLabel}
      </button>

      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {status === 'success' && <span className="text-success">{successMessage}</span>}
        {status === 'error' && <span className="text-danger">{errorMessage}</span>}
      </p>
    </form>
  );
}
