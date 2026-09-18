'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NAV_LINKS } from '@/data/development';

export function Header() {
  const ref = useRef<HTMLElement>(null);

  // The header is translucent and sticky, and it wraps to two rows at phone
  // widths — so the height an anchored section has to clear is not a constant.
  // Publish the measured height and let scroll-margin-top read it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(6,34,58,.96)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(239,207,145,.22)',
      }}
    >
      <div
        className="wrap"
        style={{
          minHeight: 76,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <Link href="/#top" style={{ display: 'block', lineHeight: 0 }} aria-label="Walker Good Homes — back to top">
          <Image
            src="/assets/brand/logo.png"
            alt="Walker Good Homes — Yorkshire craftsmanship, exceptional homes"
            width={573}
            height={232}
            priority
            style={{ display: 'block', height: 'clamp(40px,4.6vw,52px)', width: 'auto' }}
          />
        </Link>
        <nav
          aria-label="Sections"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(12px,2vw,26px)',
            flexWrap: 'wrap',
            fontWeight: 600,
            fontSize: 9.5,
            letterSpacing: '.14em',
          }}
        >
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} style={{ color: 'var(--ink-on-navy)' }}>
              {l.label}
            </Link>
          ))}
          <Link href="/#enquire" className="btn-g" style={{ minHeight: 42 }}>
            Register interest
          </Link>
        </nav>
      </div>
    </header>
  );
}
