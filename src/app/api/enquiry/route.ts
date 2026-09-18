import { NextResponse } from 'next/server';
import { DEVELOPMENT } from '@/data/development';
import { clientIp, newRef, rateLimit, recordLead, validateEnquiry, type Lead } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  if (!rateLimit(ip, 'enquiry', 5)) {
    return NextResponse.json(
      { ok: false, errors: { form: 'Too many enquiries from this connection. Please try again shortly.' } },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Could not read that request.' } }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // Honeypot: a field no person sees, so anything in it is a bot. Answer 200
  // so the sender learns nothing, but record nothing.
  if (typeof b.company === 'string' && b.company.trim() !== '') {
    return NextResponse.json({ ok: true, ref: newRef(), firstName: 'there', plotLabel: 'both plots' });
  }

  // Anything submitted inside a second of the form mounting is not a person.
  const elapsed = typeof b.elapsed === 'number' ? b.elapsed : Number.POSITIVE_INFINITY;
  if (elapsed < 1000) {
    return NextResponse.json({ ok: true, ref: newRef(), firstName: 'there', plotLabel: 'both plots' });
  }

  const { lead, errors } = validateEnquiry(body);
  if (!lead) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const record: Lead = {
    ...lead,
    ref: newRef(),
    receivedAt: new Date().toISOString(),
    source: 'hoyle-ing-website',
    userAgent: (request.headers.get('user-agent') || '').slice(0, 300),
  };

  const { stored, emailed } = await recordLead(record);
  if (!stored && !emailed) {
    // Nothing accepted the lead, so do not tell the visitor it was sent.
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
    firstName: record.name.split(' ')[0],
    plotLabel: record.plot === 'Either' ? 'both plots' : record.plot,
  });
}
