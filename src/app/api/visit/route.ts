import { NextResponse } from 'next/server';
import { clientIp, rateLimit, recordVisit, refExists, validateSlot } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Books one of the published site-visit slots against an existing enquiry. */
export async function POST(request: Request) {
  if (!rateLimit(clientIp(request.headers), 'visit', 8)) {
    return NextResponse.json({ ok: false, error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not read that request.' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const ref = typeof b.ref === 'string' ? b.ref.trim().slice(0, 32) : '';
  const slot = validateSlot(b.slot);

  if (!/^WGH-[0-9A-F]{10}$/.test(ref)) {
    return NextResponse.json({ ok: false, error: 'That enquiry reference is not valid.' }, { status: 422 });
  }
  if (!slot) {
    return NextResponse.json({ ok: false, error: 'That slot is no longer available.' }, { status: 422 });
  }

  // A well-formed reference is not enough on its own; check it belongs to an
  // enquiry we actually recorded, where we can tell.
  if ((await refExists(ref)) === false) {
    return NextResponse.json(
      { ok: false, error: 'We can’t find that enquiry. Please send your enquiry again and we’ll book the visit in.' },
      { status: 422 },
    );
  }

  const { stored, emailed } = await recordVisit(ref, slot);
  if (!stored && !emailed) {
    return NextResponse.json(
      { ok: false, error: 'We couldn’t confirm that slot just now. Please reply to our email and we’ll book it in.' },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, slot });
}
