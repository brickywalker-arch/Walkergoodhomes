import { NextResponse } from 'next/server';
import { DEVELOPMENT } from '@/data/development';
import { PARTNER_FORMS, type EnquiryKind } from '@/data/partners';
import { clientIp, newRef, rateLimit, recordPartnerEnquiry, type PartnerLead } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILES = 5;
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_TEXT = 4000;

/**
 * Every business-development enquiry on the site.
 *
 * Multipart rather than JSON, because these forms carry attachments. The
 * fields are validated against PARTNER_FORMS — the same schema the client
 * renders from — so an unknown field is dropped rather than trusted, and a
 * required field cannot be bypassed by posting straight at the endpoint.
 *
 * The buyer enquiry route is untouched and still speaks JSON.
 */
export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  if (!rateLimit(ip, 'partner', 6)) {
    return NextResponse.json(
      { ok: false, errors: { form: 'Too many enquiries from this connection. Please try again shortly.' } },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Could not read that request.' } }, { status: 400 });
  }

  const kind = String(form.get('kind') ?? '') as EnquiryKind;
  const schema = PARTNER_FORMS[kind];
  if (!schema) {
    return NextResponse.json({ ok: false, errors: { form: 'Unknown enquiry type.' } }, { status: 400 });
  }

  // Honeypot and time-to-submit, as on the buyer route: answer 200 so a bot
  // learns nothing, and record nothing.
  const honey = String(form.get('company') ?? '').trim();
  const elapsed = Number(form.get('elapsed') ?? 0);
  if (honey !== '' || !Number.isFinite(elapsed) || elapsed < 1000) {
    return NextResponse.json({ ok: true, ref: newRef(), firstName: 'there' });
  }

  const errors: Record<string, string> = {};
  const answers: { label: string; value: string }[] = [];
  let contactName = '';
  let email = '';

  for (const field of schema.fields) {
    if (field.kind === 'files') continue;

    const raw = String(form.get(field.name) ?? '').trim().slice(0, MAX_TEXT);

    if (field.required && !raw) {
      errors[field.name] = `Please add ${field.label.toLowerCase()}.`;
      continue;
    }
    if (!raw) continue;

    // A select can only be one of its own options; a bad value is dropped
    // rather than passed through into an email.
    if (field.kind === 'select' && field.options && !field.options.includes(raw)) continue;
    if (field.kind === 'email' && !/.+@.+\..+/.test(raw)) {
      errors[field.name] = 'That email address doesn’t look right.';
      continue;
    }
    if (field.kind === 'tel' && !/^[\d\s+()-]{6,}$/.test(raw)) {
      errors[field.name] = 'That phone number doesn’t look right.';
      continue;
    }
    if (field.kind === 'chips' && field.options) {
      const kept = raw
        .split(',')
        .map((s) => s.trim())
        .filter((s) => (field.options as readonly string[]).includes(s));
      if (!kept.length) continue;
      answers.push({ label: field.label, value: kept.join(', ') });
      continue;
    }

    if (field.name === 'contactName') contactName = raw;
    if (field.kind === 'email') email = raw;
    answers.push({ label: field.label, value: raw });
  }

  if (String(form.get('consent') ?? '') !== 'true') {
    errors.consent = 'Please confirm you’re happy for us to reply to your enquiry.';
  }
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const uploads = form
    .getAll('attachments')
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_FILES)
    .filter((f) => f.size <= MAX_BYTES);

  const record: PartnerLead = {
    ref: newRef(),
    receivedAt: new Date().toISOString(),
    kind,
    title: schema.title,
    contactName: contactName || 'Not given',
    email,
    answers,
    attachments: uploads.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    source: 'walker-good-homes-website',
    userAgent: (request.headers.get('user-agent') || '').slice(0, 300),
  };

  const { stored, emailed } = await recordPartnerEnquiry(record, uploads);
  if (!stored && !emailed) {
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form: `We couldn’t record that just now. Please email ${DEVELOPMENT.email} directly and we’ll come straight back to you.`,
        },
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    ref: record.ref,
    firstName: record.contactName.split(' ')[0] || 'there',
  });
}
