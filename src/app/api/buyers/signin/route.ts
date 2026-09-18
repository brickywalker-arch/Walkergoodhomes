import { NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/leads';
import { SESSION_COOKIE, codeMatches, issueToken, portalConfigured, secureCookie } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Redirects with a relative Location rather than an absolute URL.
 *
 * `new URL(path, request.url)` resolves against the host the server thinks it
 * is on, which is not necessarily the host the browser asked for — and a
 * redirect that changes host drops the cookie we just set, leaving the visitor
 * back at the sign-in form with no explanation. A relative Location is valid
 * per RFC 7231 and keeps the browser on the host it came from.
 */
function redirect(to: string) {
  return new NextResponse(null, { status: 303, headers: { Location: to } });
}

export async function POST(request: Request) {
  if (!rateLimit(clientIp(request.headers), 'buyer-signin', 10)) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }
  if (!portalConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'The buyer area is not switched on for this site yet.' },
      { status: 503 },
    );
  }

  const form = await request.formData().catch(() => null);
  const code = String(form?.get('code') ?? '');
  const plot = Number(form?.get('plot') ?? 1);

  if (!codeMatches(code)) return redirect('/buyers?error=1');

  const token = issueToken(plot === 2 ? 2 : 1);
  if (!token) {
    return NextResponse.json({ ok: false, error: 'The buyer area is not configured.' }, { status: 503 });
  }

  const res = redirect('/buyers');
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookie(request),
    path: '/',
    maxAge: 12 * 60 * 60,
  });
  return res;
}
