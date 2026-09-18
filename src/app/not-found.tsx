import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="sec">
          <div className="wrap" style={{ maxWidth: 620 }}>
            <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
              Not found
            </div>
            <h1 className="hd" style={{ fontSize: 'clamp(34px,5vw,60px)', margin: '12px 0 14px' }}>
              That page isn&rsquo;t here.
            </h1>
            <p className="lead">
              The development, the drawings and the interior are all on one page. Head back and you&rsquo;ll find
              what you were after.
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
