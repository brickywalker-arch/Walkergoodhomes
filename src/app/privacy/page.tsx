import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DEVELOPMENT } from '@/data/development';

export const metadata: Metadata = {
  title: 'Privacy notice',
  description: `How ${DEVELOPMENT.company} handles the details you send through this website.`,
  robots: { index: true, follow: true },
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'What we collect',
    body: [
      'When you register interest we collect your name, your email address, your phone number if you give us one, the plot you are interested in, the interior finishes you had selected, and anything you write in the message box.',
      'We also record the date and time, and the browser user-agent string the request arrived with, so we can tell genuine enquiries from automated ones.',
    ],
  },
  {
    title: 'Why we hold it',
    body: [
      'To reply to your enquiry and to talk to you about these two homes. That is the only reason.',
      'Our lawful basis is your consent, which you give by ticking the box on the form. You can withdraw it at any time.',
    ],
  },
  {
    title: 'What we do not do',
    body: [
      'We do not add you to a mailing list. We do not sell, rent or pass your details to anyone else, including other developers, agents or brokers.',
      'We do not use advertising or analytics cookies on this site, and there are no third-party trackers on it.',
    ],
  },
  {
    title: 'How long we keep it',
    body: [
      'We keep enquiry records while these two homes are being marketed and sold, and for twelve months afterwards in case a sale falls through and we need to come back to you. After that we delete them.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'You can ask us what we hold about you, ask us to correct it, ask us to delete it, or withdraw your consent. Email us and we will act on it — normally the same week, and within one month at the latest.',
      'If you are not happy with how we have handled your details you can complain to the Information Commissioner’s Office at ico.org.uk.',
    ],
  },
  {
    title: 'Who to contact',
    body: [
      `${DEVELOPMENT.company} is the data controller. Email ${DEVELOPMENT.email}.`,
    ],
  },
];

export default function Privacy() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="sec">
          <div className="wrap" style={{ maxWidth: 760 }}>
            <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
              Privacy notice
            </div>
            <h1 className="hd" style={{ fontSize: 'clamp(34px,5vw,60px)', margin: '12px 0 14px' }}>
              What we do with your details.
            </h1>
            <p className="lead">
              Short version: we use what you send us to reply to you about Plots 1 &amp; 2, Hoyle Ing, and for
              nothing else.
            </p>

            <div style={{ marginTop: 'clamp(26px,3.5vw,40px)', borderTop: '1px solid var(--rule-strong)' }}>
              {SECTIONS.map((s, i) => (
                <div key={s.title} style={{ borderBottom: '1px solid var(--rule)', padding: '22px 2px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                    <span style={{ fontWeight: 600, fontSize: 10, letterSpacing: '.16em', color: 'var(--gold-deep)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2
                      className="hd"
                      style={{ fontSize: 'clamp(22px,2.4vw,28px)', fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
                    >
                      {s.title}
                    </h2>
                  </div>
                  <div style={{ display: 'grid', gap: 10, marginTop: 12, paddingLeft: 32 }}>
                    {s.body.map((p) => (
                      <p key={p} style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--ink-body)' }}>
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ marginTop: 24, fontSize: 12.5, lineHeight: 1.7, color: 'var(--ink-muted-2)' }}>
              Last updated September 2026.
            </p>
            <Link href="/" className="btn-g" style={{ marginTop: 24 }}>
              Back to the development
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
