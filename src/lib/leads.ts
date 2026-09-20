import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { DEVELOPMENT } from '@/data/development';
import { FINISHES, VISIT_SLOTS_SET } from '@/lib/constants';
import type { FinishGroupKey, Finishes } from '@/data/interior';

export type PlotChoice = 'Plot 1' | 'Plot 2' | 'Either';

export type Lead = {
  ref: string;
  receivedAt: string;
  name: string;
  email: string;
  phone: string;
  plot: PlotChoice;
  finishes: Finishes;
  message: string;
  source: string;
  userAgent: string;
};

export type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'plot' | 'consent' | 'form', string>>;

const PLOTS: PlotChoice[] = ['Plot 1', 'Plot 2', 'Either'];
const MAX = { name: 120, email: 254, phone: 40, message: 2000 };

function str(v: unknown, limit: number): string {
  return typeof v === 'string' ? v.trim().slice(0, limit) : '';
}

/**
 * Validates an enquiry server-side.
 *
 * The client validates too, for the immediate message, but nothing is trusted
 * until it has been through here.
 */
export function validateEnquiry(body: unknown): { lead: Omit<Lead, 'ref' | 'receivedAt' | 'source' | 'userAgent'> | null; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const b = (body ?? {}) as Record<string, unknown>;

  const name = str(b.name, MAX.name);
  const email = str(b.email, MAX.email);
  const phone = str(b.phone, MAX.phone);
  const message = str(b.message, MAX.message);

  if (!name) errors.name = 'Please add your name so we know who to reply to.';
  // Deliberately permissive: the same shape the client checks. Anything
  // stricter rejects valid addresses, and delivery is the real test.
  if (!/.+@.+\..+/.test(email)) errors.email = 'That email address doesn’t look right.';
  if (phone && !/^[\d\s+()-]{6,}$/.test(phone)) errors.phone = 'That phone number doesn’t look right.';

  const plot = PLOTS.includes(b.plot as PlotChoice) ? (b.plot as PlotChoice) : null;
  if (!plot) errors.plot = 'Please choose a plot, or Either.';

  if (b.consent !== true) errors.consent = 'Please confirm you’re happy for us to reply to your enquiry.';

  const finishes = {
    kitchen: pickFinish('kitchen', b.finishes),
    walls: pickFinish('walls', b.finishes),
    doors: pickFinish('doors', b.finishes),
    floors: pickFinish('floors', b.finishes),
    carpet: pickFinish('carpet', b.finishes),
    tiles: pickFinish('tiles', b.finishes),
    stairs: pickFinish('stairs', b.finishes),
  };

  if (Object.keys(errors).length || !plot) return { lead: null, errors };
  return { lead: { name, email, phone, plot, finishes, message }, errors: {} };
}

function pickFinish(group: FinishGroupKey, raw: unknown): string {
  const value = (raw as Record<string, unknown> | undefined)?.[group];
  const allowed = FINISHES[group];
  return typeof value === 'string' && allowed.includes(value) ? value : allowed[0];
}

export function validateSlot(raw: unknown): string | null {
  const slot = str(raw, 64);
  return VISIT_SLOTS_SET.has(slot) ? slot : null;
}

export function newRef(): string {
  // Short, human-quotable and unguessable enough to gate the visit booking.
  return `WGH-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

/* --------------------------------------------------------------- sinks */

const LEADS_DIR = process.env.LEADS_DIR || path.join(process.cwd(), '.data');

/** Appends the lead to a JSONL log. Returns false if the disk is read-only. */
async function persist(record: object, file: string): Promise<boolean> {
  try {
    await fs.mkdir(LEADS_DIR, { recursive: true });
    await fs.appendFile(path.join(LEADS_DIR, file), `${JSON.stringify(record)}\n`, 'utf8');
    return true;
  } catch (err) {
    console.error('[leads] could not write to disk:', (err as Error).message);
    return false;
  }
}

/**
 * Durable store, where the host provides one.
 *
 * Most hosts give a route handler an ephemeral filesystem, so the JSONL log
 * does not survive a redeploy. On Netlify, Blobs does — and it needs no extra
 * account or secret, so a deployed enquiry form captures leads whether or not
 * email has been configured. Everywhere else this is a no-op and the disk log
 * and email carry the lead.
 */
async function persistToStore(record: { ref: string }, store: string): Promise<boolean> {
  if (!process.env.NETLIFY) return false;
  try {
    const { getStore } = await import('@netlify/blobs');
    await getStore(store).setJSON(`${record.ref}-${Date.now()}`, record);
    return true;
  } catch (err) {
    console.error('[leads] could not write to the blob store:', (err as Error).message);
    return false;
  }
}

/** Sends via Resend's HTTP API when RESEND_API_KEY is configured. */
async function sendEmail(subject: string, text: string, replyTo?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM_EMAIL;
  const to = process.env.LEAD_TO_EMAIL || DEVELOPMENT.email;
  if (!key || !from) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('[leads] email rejected:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[leads] email failed:', (err as Error).message);
    return false;
  }
}

export async function recordLead(lead: Lead): Promise<{ stored: boolean; emailed: boolean }> {
  const body = [
    `New enquiry — ${DEVELOPMENT.addressLines.join(', ')}`,
    '',
    `Reference:  ${lead.ref}`,
    `Name:       ${lead.name}`,
    `Email:      ${lead.email}`,
    `Phone:      ${lead.phone || '—'}`,
    `Plot:       ${lead.plot}`,
    `Finishes:   ${lead.finishes.kitchen} kitchen / ${lead.finishes.walls} walls / ${lead.finishes.doors} doors`,
    `            ${lead.finishes.floors} boards / ${lead.finishes.carpet} carpet`,
    `            ${lead.finishes.tiles} tiles / ${lead.finishes.stairs} staircase`,
    `Received:   ${lead.receivedAt}`,
    '',
    lead.message ? `Message:\n${lead.message}` : 'No message.',
  ].join('\n');

  const [onDisk, inStore, emailed] = await Promise.all([
    persist(lead, 'enquiries.jsonl'),
    persistToStore(lead, 'wgh-enquiries'),
    sendEmail(`Hoyle Ing enquiry — ${lead.name} (${lead.plot})`, body, lead.email),
  ]);
  return { stored: onDisk || inStore, emailed };
}

/**
 * Whether an enquiry with this reference was recorded.
 *
 * Volumes here are two houses' worth of enquiries, so a scan of the log is
 * cheaper than anything it could be replaced with. When the log cannot be read
 * — an email-only deployment, or a filesystem that did not persist — this
 * answers `null` for "cannot tell", and the caller accepts a well-formed
 * reference rather than turning away a real buyer.
 */
export async function refExists(ref: string): Promise<boolean | null> {
  if (process.env.NETLIFY) {
    try {
      const { getStore } = await import('@netlify/blobs');
      const { blobs } = await getStore('wgh-enquiries').list({ prefix: `${ref}-` });
      return blobs.length > 0;
    } catch (err) {
      console.error('[leads] could not read the blob store:', (err as Error).message);
      return null;
    }
  }
  try {
    const body = await fs.readFile(path.join(LEADS_DIR, 'enquiries.jsonl'), 'utf8');
    return body.split('\n').some((line) => {
      if (!line) return false;
      try {
        return (JSON.parse(line) as { ref?: string }).ref === ref;
      } catch {
        return false;
      }
    });
  } catch {
    return null;
  }
}

export async function recordVisit(ref: string, slot: string): Promise<{ stored: boolean; emailed: boolean }> {
  const record = { ref, slot, bookedAt: new Date().toISOString() };
  const body = [
    'Site visit booked',
    '',
    `Reference: ${ref}`,
    `Slot:      ${slot}`,
    `Booked:    ${record.bookedAt}`,
  ].join('\n');

  const [onDisk, inStore, emailed] = await Promise.all([
    persist(record, 'visits.jsonl'),
    persistToStore(record, 'wgh-visits'),
    sendEmail(`Hoyle Ing site visit — ${slot}`, body),
  ]);
  return { stored: onDisk || inStore, emailed };
}

/* ------------------------------------------------------------ rate limit */

const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

/**
 * Per-IP sliding window, bucketed per action so that sending an enquiry does
 * not eat the allowance for booking a visit afterwards.
 *
 * This is in-process, so it holds for a single instance; behind several
 * instances put a shared limiter at the edge.
 */
export function rateLimit(ip: string, action = 'default', max = 8): boolean {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return true;
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown';
}

/* ------------------------------------------- business-development enquiries */

export type PartnerLead = {
  ref: string;
  receivedAt: string;
  kind: string;
  title: string;
  contactName: string;
  email: string;
  /** Label/value pairs in the order the form asked them. */
  answers: { label: string; value: string }[];
  attachments: { name: string; size: number; type: string }[];
  source: string;
  userAgent: string;
};

/**
 * Stores uploaded files where the host gives us somewhere to put them.
 *
 * Netlify Blobs is the same store the enquiries go to, so there is no extra
 * account or secret. Everywhere else this is a no-op and the enquiry still
 * lands — the filenames are in the email either way, and Michael can ask for
 * anything he needs. A dropped attachment must never lose the enquiry.
 */
async function persistAttachments(ref: string, files: File[]): Promise<number> {
  if (!files.length || !process.env.NETLIFY) return 0;
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('wgh-attachments');
    let saved = 0;
    for (const [i, file] of files.entries()) {
      const safe = file.name.replace(/[^\w.\- ]+/g, '_').slice(-120);
      await store.set(`${ref}/${i + 1}-${safe}`, await file.arrayBuffer(), {
        metadata: { ref, name: file.name, type: file.type },
      });
      saved += 1;
    }
    return saved;
  } catch (err) {
    console.error('[leads] could not store attachments:', (err as Error).message);
    return 0;
  }
}

export async function recordPartnerEnquiry(
  lead: PartnerLead,
  files: File[] = [],
): Promise<{ stored: boolean; emailed: boolean }> {
  const savedCount = await persistAttachments(lead.ref, files);

  const width = Math.max(...lead.answers.map((a) => a.label.length), 12);
  const body = [
    `${lead.title} — ${DEVELOPMENT.company}`,
    '',
    `Reference:  ${lead.ref}`,
    `Enquiry:    ${lead.kind}`,
    `Received:   ${lead.receivedAt}`,
    '',
    ...lead.answers.map((a) => `${`${a.label}:`.padEnd(width + 2)}${a.value}`),
    '',
    lead.attachments.length
      ? [
          `Attachments (${lead.attachments.length}):`,
          ...lead.attachments.map((a) => `  · ${a.name} (${Math.round(a.size / 1024)} KB)`),
          savedCount
            ? `  Stored under ${lead.ref}/ in the wgh-attachments store.`
            : '  Not stored on this host — reply to the sender to ask for them.',
        ].join('\n')
      : 'No attachments.',
  ].join('\n');

  const [onDisk, inStore, emailed] = await Promise.all([
    persist(lead, 'partner-enquiries.jsonl'),
    persistToStore(lead, 'wgh-partner-enquiries'),
    sendEmail(`${lead.title} — ${lead.contactName}`, body, lead.email || undefined),
  ]);
  return { stored: onDisk || inStore, emailed };
}
