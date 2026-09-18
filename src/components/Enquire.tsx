'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DEVELOPMENT, VISIT_SLOTS } from '@/data/development';
import { DEFAULT_FINISHES, type Finishes } from '@/data/interior';
import { CornerMarks } from './CornerMarks';

type PlotChoice = 'Plot 1' | 'Plot 2' | 'Either';
type Errors = Partial<Record<'name' | 'email' | 'phone' | 'plot' | 'consent' | 'form', string>>;

/**
 * Register interest.
 *
 * The visitor's finish selections come in from the interior explorer and are
 * submitted with the enquiry, so Michael knows what they were looking at.
 * Validation runs on submit here for the immediate message, and again on the
 * server, which is what actually decides.
 */
export function Enquire({ finishes = DEFAULT_FINISHES }: { finishes?: Finishes }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [plot, setPlot] = useState<PlotChoice>('Either');
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(''); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  const [sent, setSent] = useState<{ ref: string; firstName: string; plotLabel: string } | null>(null);
  const [booked, setBooked] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');

  const mountedAt = useRef(Date.now());

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;

    const next: Errors = {};
    if (!name.trim()) next.name = 'Please add your name so we know who to reply to.';
    if (!/.+@.+\..+/.test(email)) next.email = 'That email address doesn’t look right.';
    if (!consent) next.consent = 'Please confirm you’re happy for us to reply to your enquiry.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setErrors({});
    setSending(true);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, message, plot, consent, company,
          finishes,
          elapsed: Date.now() - mountedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrors(
          data.errors ?? { form: 'Something went wrong sending that. Please try again in a moment.' },
        );
        return;
      }
      setSent({ ref: data.ref, firstName: data.firstName, plotLabel: data.plotLabel });
    } catch {
      setErrors({
        form: `We couldn’t reach the server. Please email ${DEVELOPMENT.email} and we’ll come straight back to you.`,
      });
    } finally {
      setSending(false);
    }
  }

  async function book(slot: string) {
    if (!sent || booking) return;
    setBooking(true);
    setBookError('');
    try {
      const res = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: sent.ref, slot }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setBookError(data.error ?? 'We couldn’t confirm that slot. Please try another.');
        return;
      }
      setBooked(slot);
    } catch {
      setBookError('We couldn’t reach the server to confirm that slot.');
    } finally {
      setBooking(false);
    }
  }

  const errorList = Object.entries(errors).filter(([, v]) => v);

  return (
    <section className="sec" id="enquire" style={{ background: 'var(--paper)' }}>
      <div className="wrap">
        <div className="two" style={{ alignItems: 'start' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
              Register your interest
            </div>
            <h2 className="hd" style={{ fontSize: 'clamp(38px,5.4vw,70px)', marginTop: 12 }}>
              Get in touch early.
            </h2>
            <p className="lead" style={{ marginTop: 18 }}>
              Early registrations get first choice of plot and can personalise selected interior finishes before
              completion. We reply personally, usually the same day — no mailing list.
            </p>
            <div style={{ marginTop: 26, fontSize: 15, lineHeight: 1.9, color: 'var(--ink-body)' }}>
              <a href={`mailto:${DEVELOPMENT.email}`}>{DEVELOPMENT.email}</a>
              <br />
              {DEVELOPMENT.addressLines.join(', ').replace('Plots 1 & 2, ', '')}
            </div>
            <p style={{ margin: '22px 0 0', font: 'italic 400 16px/1.5 inherit', color: 'var(--gold-deep)' }}>
              {DEVELOPMENT.strapline}
            </p>
          </div>

          <div
            className="plate"
            style={{
              background: 'var(--paper-warm)',
              border: '1px solid var(--rule)',
              padding: 'clamp(22px,3vw,34px)',
            }}
          >
            {!sent ? (
              <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 16 }}>
                <label style={{ display: 'block' }}>
                  <span className="field-label">Your name</span>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    required
                    aria-invalid={Boolean(errors.name)}
                  />
                </label>
                <label style={{ display: 'block' }}>
                  <span className="field-label">Email</span>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                    required
                    aria-invalid={Boolean(errors.email)}
                  />
                </label>
                <label style={{ display: 'block' }}>
                  <span className="field-label">Phone (optional)</span>
                  <input
                    className="input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07…"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </label>
                <label style={{ display: 'block' }}>
                  <span className="field-label">Anything you’d like to ask (optional)</span>
                  <textarea
                    className="input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Timescales, finishes, a site visit…"
                    style={{ minHeight: 84, resize: 'vertical' }}
                  />
                </label>

                <div>
                  <span className="field-label">Plot of interest</span>
                  <div style={{ display: 'flex', gap: 9, marginTop: 8, flexWrap: 'wrap' }}>
                    {(['Plot 1', 'Plot 2', 'Either'] as PlotChoice[]).map((c) => {
                      const on = plot === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setPlot(c)}
                          style={{
                            flex: '1 1 90px',
                            minHeight: 48,
                            fontWeight: 700,
                            fontSize: 10,
                            letterSpacing: '.1em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            border: `1px solid ${on ? 'var(--navy)' : 'var(--input-border)'}`,
                            background: on ? 'var(--navy)' : '#fff',
                            color: on ? 'var(--gold-light)' : '#183045',
                            fontFamily: 'inherit',
                            borderRadius: 0,
                          }}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Honeypot — hidden from people and from assistive tech. */}
                <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                  <label>
                    Company
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </label>
                </div>

                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    style={{ marginTop: 3, width: 18, height: 18, accentColor: '#06223a', flex: 'none' }}
                    aria-invalid={Boolean(errors.consent)}
                  />
                  <span style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink-body)' }}>
                    I’m happy for {DEVELOPMENT.company} to hold these details and contact me about this development.
                    We don’t add you to a mailing list and we don’t pass your details on.{' '}
                    <Link href="/privacy">Privacy notice</Link>.
                  </span>
                </label>

                {errorList.length > 0 && (
                  <div
                    role="alert"
                    style={{
                      border: '1px solid var(--error-border)',
                      background: 'var(--error-bg)',
                      padding: '12px 14px',
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: 'var(--error-ink)',
                    }}
                  >
                    {errorList.map(([k, v]) => (
                      <div key={k}>{v}</div>
                    ))}
                  </div>
                )}

                <button type="submit" className="btn-g" style={{ minHeight: 54 }} disabled={sending}>
                  {sending ? 'Sending…' : 'Send my enquiry'}
                </button>
              </form>
            ) : (
              <div>
                <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
                  Enquiry sent
                </div>
                <h3 className="hd" style={{ fontSize: 'clamp(28px,3.4vw,40px)', margin: '10px 0 12px' }}>
                  Thank you, {sent.firstName}.
                </h3>
                <p className="lead">
                  We&rsquo;ve noted your interest in {sent.plotLabel}. {DEVELOPMENT.contactName} will be in touch from{' '}
                  {DEVELOPMENT.email} — usually within a few hours. Your reference is{' '}
                  <strong style={{ color: 'var(--ink)' }}>{sent.ref}</strong>.
                </p>
                <div style={{ marginTop: 22, borderTop: '1px solid var(--rule)', paddingTop: 20 }}>
                  <div className="field-label" style={{ marginBottom: 12 }}>
                    Book a site visit while you&rsquo;re here
                  </div>
                  <div style={{ display: 'grid', gap: 9 }}>
                    {VISIT_SLOTS.map((slot, i) => {
                      const on = booked === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          aria-pressed={on}
                          disabled={booking || Boolean(booked)}
                          onClick={() => book(slot)}
                          style={{
                            minHeight: 52,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 16px',
                            fontSize: 15,
                            cursor: booked ? 'default' : 'pointer',
                            border: `1px solid ${on ? 'var(--navy)' : 'var(--input-border)'}`,
                            background: on ? 'var(--navy)' : '#fff',
                            color: on ? 'var(--gold-light)' : 'var(--ink)',
                            fontFamily: 'inherit',
                            borderRadius: 0,
                            opacity: booked && !on ? 0.5 : 1,
                          }}
                        >
                          <span>{slot}</span>
                          <span style={{ fontWeight: 700, fontSize: 9, letterSpacing: '.12em' }}>
                            {on ? 'CONFIRMED' : i === 1 ? 'POPULAR' : 'AVAILABLE'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {bookError && (
                    <p role="alert" style={{ margin: '14px 0 0', fontSize: 13.5, color: 'var(--error-ink)' }}>
                      {bookError}
                    </p>
                  )}
                  {booked && (
                    <p style={{ margin: '16px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>
                      {booked} confirmed — meet at the site gate on Hoyle Ing. Hard hats and boots provided.
                    </p>
                  )}
                </div>
              </div>
            )}
            <CornerMarks />
          </div>
        </div>
      </div>
    </section>
  );
}
