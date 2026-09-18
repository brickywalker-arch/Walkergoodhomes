import crypto from 'node:crypto';

/**
 * Buyer-portal sessions.
 *
 * A short HMAC-signed token in an httpOnly cookie. This gates a page of build
 * progress and links to already-public drawings — it is deliberately not a
 * general-purpose identity system, and it will not let anyone in unless the
 * site operator has configured an access code and a secret.
 */
const COOKIE = 'wgh_buyer';
const TTL_MS = 12 * 60 * 60 * 1000;

export const SESSION_COOKIE = COOKIE;

function secret(): string | null {
  const s = process.env.BUYER_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

export function portalConfigured(): boolean {
  return Boolean(process.env.BUYER_ACCESS_CODE && secret());
}

function sign(payload: string, key: string): string {
  return crypto.createHmac('sha256', key).update(payload).digest('base64url');
}

/**
 * Constant-time comparison. Both sides are hashed first so the comparison is
 * over two fixed-length digests — otherwise a length mismatch would answer
 * early and leak the code's length by timing.
 */
export function codeMatches(input: string): boolean {
  const expected = process.env.BUYER_ACCESS_CODE;
  if (!expected) return false;
  const digest = (v: string) => crypto.createHash('sha256').update(v).digest();
  return crypto.timingSafeEqual(digest(input.trim()), digest(expected));
}

export function issueToken(plot: number): string | null {
  const key = secret();
  if (!key) return null;
  const payload = `${plot}.${Date.now() + TTL_MS}`;
  return `${payload}.${sign(payload, key)}`;
}

/**
 * Whether the session cookie should carry `Secure`.
 *
 * Keyed to how the request actually arrived rather than to NODE_ENV: a browser
 * silently drops a Secure cookie sent over plain HTTP, which would leave the
 * buyer area impossible to sign into with nothing on screen to say why.
 */
export function secureCookie(request: Request): boolean {
  const forwarded = request.headers.get('x-forwarded-proto');
  if (forwarded) return forwarded.split(',')[0].trim() === 'https';
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return true;
  }
}

export function readToken(token: string | undefined): { plot: number } | null {
  const key = secret();
  if (!key || !token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [plotRaw, expiresRaw, mac] = parts;
  const payload = `${plotRaw}.${expiresRaw}`;
  const expected = sign(payload, key);
  if (expected.length !== mac.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return null;
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  const plot = Number(plotRaw);
  if (plot !== 1 && plot !== 2) return null;
  return { plot };
}
