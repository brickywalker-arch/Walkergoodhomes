'use client';

import { useEffect, useRef, useState } from 'react';
import { DEVELOPMENT } from '@/data/development';
import { PARTNER_FORMS, type EnquiryKind } from '@/data/partners';
import { Field, type FieldValue } from '@/components/ui/Field';

const MAX_FILES = 5;
const MAX_BYTES = 8 * 1024 * 1024;

type Errors = Record<string, string>;

/**
 * Every partner enquiry on the site, rendered from its schema.
 *
 * Six audiences, one form: the shape comes from PARTNER_FORMS, which the API
 * route validates against as well, so a field cannot appear here without the
 * server understanding it. Submitted as multipart because these forms carry
 * attachments; the JSON enquiry route the buyer form uses is untouched.
 *
 * Validation runs here for the immediate message and again on the server,
 * which is what actually decides.
 */
export function PartnerForm({
  kind,
  tone = 'paper',
  headingId,
  onDone,
}: {
  kind: EnquiryKind;
  tone?: 'paper' | 'navy';
  /** id of the heading this form is labelled by, when it sits in a dialog. */
  headingId?: string;
  onDone?: () => void;
}) {
  const schema = PARTNER_FORMS[kind];
  const [values, setValues] = useState<Record<string, FieldValue>>(() =>
    Object.fromEntries(schema.fields.map((f) => [f.name, f.kind === 'chips' ? [] : f.kind === 'files' ? [] : ''])),
  );
  const [consent, setConsent] = useState(false);
  const [honey, setHoney] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ ref: string; firstName: string } | null>(null);

  const mountedAt = useRef(Date.now());
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  function set(name: string, v: FieldValue) {
    setValues((prev) => ({ ...prev, [name]: v }));
    // Clear the error as soon as the visitor engages with the field again.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
  }

  function validate(): Errors {
    const next: Errors = {};
    for (const f of schema.fields) {
      const v = values[f.name];
      if (f.required && (typeof v === 'string' ? !v.trim() : !v?.length)) {
        next[f.name] = `Please add ${f.label.toLowerCase()}.`;
      }
      if (f.kind === 'email' && typeof v === 'string' && v && !/.+@.+\..+/.test(v)) {
        next[f.name] = 'That email address doesn’t look right.';
      }
      if (f.kind === 'tel' && typeof v === 'string' && v && !/^[\d\s+()-]{6,}$/.test(v)) {
        next[f.name] = 'That phone number doesn’t look right.';
      }
      if (f.kind === 'files' && Array.isArray(v) && v.length) {
        const list = v as File[];
        if (list.length > MAX_FILES) next[f.name] = `Please attach no more than ${MAX_FILES} files.`;
        else {
          const big = list.find((file) => file.size > MAX_BYTES);
          if (big) next[f.name] = `“${big.name}” is over 8 MB. Please send that one by email instead.`;
        }
      }
    }
    if (!consent) next.consent = 'Please confirm you’re happy for us to reply to your enquiry.';
    return next;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    const next = validate();
    if (Object.values(next).some(Boolean)) {
      setErrors(next);
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }

    setErrors({});
    setSending(true);
    try {
      const body = new FormData();
      body.set('kind', kind);
      body.set('consent', 'true');
      body.set('company', honey);
      body.set('elapsed', String(Date.now() - mountedAt.current));
      for (const f of schema.fields) {
        const v = values[f.name];
        if (f.kind === 'files') for (const file of v as File[]) body.append('attachments', file);
        else if (Array.isArray(v)) body.set(f.name, v.join(', '));
        else body.set(f.name, v as string);
      }

      const res = await fetch('/api/partner-enquiry', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? { form: 'Something went wrong sending that. Please try again in a moment.' });
        requestAnimationFrame(() => summary.current?.focus());
        return;
      }
      setSent({ ref: data.ref, firstName: data.firstName });
    } catch {
      setErrors({
        form: `We couldn’t reach the server. Please email ${DEVELOPMENT.email} and we’ll come straight back to you.`,
      });
      requestAnimationFrame(() => summary.current?.focus());
    } finally {
      setSending(false);
    }
  }

  const navy = tone === 'navy';

  if (sent) {
    return (
      <div role="status" style={{ padding: 'clamp(22px,3vw,34px)' }}>
        <div className="eyebrow" style={{ color: navy ? 'var(--gold-light)' : 'var(--gold-deep)' }}>
          Thank you
        </div>
        <h3
          className="hd"
          id={headingId}
          style={{ fontSize: 'clamp(26px,3.4vw,40px)', marginTop: 12, color: navy ? '#fff' : 'var(--ink)' }}
        >
          That’s with us, {sent.firstName}.
        </h3>
        <p className="lead" style={{ marginTop: 14, color: navy ? 'var(--ink-on-navy-2)' : undefined }}>
          Your reference is <strong style={{ color: navy ? 'var(--gold-light)' : 'var(--ink)' }}>{sent.ref}</strong>.{' '}
          {DEVELOPMENT.contactName} reads these himself and will come back to you directly. If it is urgent,{' '}
          <a href={`mailto:${DEVELOPMENT.email}`} style={{ color: navy ? 'var(--gold-light)' : undefined }}>
            {DEVELOPMENT.email}
          </a>{' '}
          reaches the same place.
        </p>
        {onDone ? (
          <button type="button" className="btn-g" style={{ marginTop: 22 }} onClick={onDone}>
            Close
          </button>
        ) : null}
      </div>
    );
  }

  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <form onSubmit={submit} noValidate style={{ padding: 'clamp(22px,3vw,34px)' }}>
      <h3
        className="hd"
        id={headingId}
        style={{ fontSize: 'clamp(24px,3.1vw,36px)', color: navy ? '#fff' : 'var(--ink)' }}
      >
        {schema.title}
      </h3>
      <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.7, color: navy ? 'var(--ink-on-navy-2)' : 'var(--ink-body)' }}>
        {schema.intro}
      </p>

      {/* Announced on failure and focused, so the reason is never only visual. */}
      <div ref={summary} tabIndex={-1} role="alert" style={{ outline: 'none' }}>
        {errorList.length ? (
          <div
            style={{
              marginTop: 18,
              padding: '12px 14px',
              border: '1px solid var(--error-border)',
              background: 'var(--error-bg)',
              color: 'var(--error-ink)',
              fontSize: 13.5,
              lineHeight: 1.65,
            }}
          >
            {errors.form ? errors.form : `Please check ${errorList.length} ${errorList.length === 1 ? 'field' : 'fields'} below.`}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))',
          gap: 'clamp(14px,2vw,20px)',
          marginTop: 22,
        }}
      >
        {schema.fields.map((f) => (
          <Field
            key={f.name}
            field={f}
            tone={tone}
            value={values[f.name]}
            error={errors[f.name] || undefined}
            onChange={(v) => set(f.name, v)}
          />
        ))}
      </div>

      {/* Honeypot: no person sees this, so anything in it is a bot. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor={`hp-${kind}`}>Company</label>
        <input id={`hp-${kind}`} name="company" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 11,
          marginTop: 22,
          fontSize: 13.5,
          lineHeight: 1.65,
          color: navy ? 'var(--ink-on-navy-2)' : 'var(--ink-body)',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            setErrors((prev) => (prev.consent ? { ...prev, consent: '' } : prev));
          }}
          aria-invalid={errors.consent ? true : undefined}
          style={{ width: 20, height: 20, marginTop: 1, flex: 'none', accentColor: 'var(--gold-deep)' }}
        />
        <span>
          I’m happy for {DEVELOPMENT.company} to hold these details and reply to this enquiry. See the{' '}
          <a href="/privacy" style={{ color: navy ? 'var(--gold-light)' : undefined }}>
            privacy notice
          </a>
          .
        </span>
      </label>
      {errors.consent ? (
        <p style={{ margin: '7px 0 0', fontSize: 12.5, fontWeight: 600, color: navy ? '#f0b9aa' : 'var(--error-ink)' }}>
          {errors.consent}
        </p>
      ) : null}

      <button type="submit" className="btn-g" disabled={sending} style={{ marginTop: 24, opacity: sending ? 0.72 : 1 }}>
        {sending ? 'Sending…' : schema.submitLabel}
      </button>
    </form>
  );
}
