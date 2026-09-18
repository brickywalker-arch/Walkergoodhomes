import Image from 'next/image';
import { QUICK_LINKS } from '@/data/development';
import { exteriorImage } from '@/lib/cgi';

/**
 * Opens on the brand, then the coming-soon development — the order the client
 * set. The banner image is a render of the pair from the architect's drawings,
 * so it needs none of the cropping the original supplied artwork did.
 */
export function Hero() {
  const hero = exteriorImage('hero');

  return (
    <section style={{ position: 'relative', background: 'var(--navy-deep)' }}>
      <div
        className="wrap"
        style={{
          paddingTop: 'clamp(34px,5vw,64px)',
          paddingBottom: 'clamp(26px,3.5vw,44px)',
          textAlign: 'center',
        }}
      >
        <Image
          src="/assets/brand/logo.png"
          alt="Walker Good Homes — established 2024"
          width={573}
          height={232}
          priority
          style={{ display: 'block', margin: '0 auto', width: 'min(100%,540px)', height: 'auto', maxWidth: 'none' }}
        />
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg,transparent,rgba(239,207,145,.65),transparent)',
            margin: 'clamp(22px,3vw,34px) auto clamp(18px,2.4vw,26px)',
            maxWidth: 640,
          }}
        />
        <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>
          Coming soon
        </div>
        <h1 className="hd" style={{ fontSize: 'clamp(34px,5.2vw,64px)', color: '#fff', marginTop: 12 }}>
          Plots 1 &amp; 2, Hoyle Ing
          <br />
          Linthwaite, Huddersfield
        </h1>
        <p className="lead" style={{ color: 'var(--ink-on-navy-2)', maxWidth: '56ch', margin: '16px auto 0' }}>
          Two attached Yorkshire-stone homes, the same plan handed. Three bedrooms over three storeys, two en-suites
          and a family bathroom in each.
        </p>
      </div>

      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', maxHeight: 620, overflow: 'hidden' }}>
        <Image
          src={hero.src}
          alt="Plots 1 and 2, Hoyle Ing — computer-generated image of the pair of Yorkshire stone homes from the approach"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg,rgba(4,26,45,.18) 0%,rgba(4,26,45,0) 42%,rgba(4,26,45,.9) 100%)',
          }}
        />
        <div className="wrap" style={{ position: 'absolute', left: 0, right: 0, bottom: 'clamp(16px,2.5vw,28px)' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>
            Coming soon · Plots 1 &amp; 2 · Hoyle Ing, Linthwaite
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 'clamp(28px,4vw,52px)', paddingBottom: 'clamp(30px,4.5vw,60px)' }}>
        <div className="two" style={{ alignItems: 'end' }}>
          <h2 className="hd" style={{ fontSize: 'clamp(40px,5.8vw,76px)', color: '#fff' }}>
            Beautiful homes.
            <br />
            Built with purpose.
          </h2>
          <div>
            <p className="lead" style={{ color: '#d3dde2' }}>
              Register early and you can personalise selected interior finishes before completion — and see every
              architect&rsquo;s sheet the homes are being built from.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <a href="#enquire" className="btn-g">
                Register your interest
              </a>
              <a href="#drawings" className="btn-o">
                View the drawings
              </a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--navy)', borderTop: '1px solid rgba(255,255,255,.12)' }}>
        <div
          className="wrap"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))',
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          {QUICK_LINKS.map((q) => (
            <a
              key={q.href}
              href={q.href}
              className="quick"
              style={{
                display: 'block',
                padding: '22px clamp(18px,3vw,30px)',
                borderRight: '1px solid rgba(255,255,255,.12)',
                borderBottom: '1px solid rgba(255,255,255,.12)',
              }}
            >
              <b
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-barlow-condensed), sans-serif',
                  fontSize: 26,
                  color: 'var(--gold-light)',
                  marginBottom: 6,
                }}
              >
                {q.num}
              </b>
              <span style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: '.14em', color: 'var(--ink-on-navy)' }}>
                {q.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
