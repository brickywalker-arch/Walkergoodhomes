import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  // Relative Location, for the same reason as sign-in: it keeps the browser on
  // the host it came from rather than on whichever host the server thinks it is.
  const res = new NextResponse(null, { status: 303, headers: { Location: '/buyers' } });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
