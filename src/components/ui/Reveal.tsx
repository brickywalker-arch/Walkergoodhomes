'use client';

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

/**
 * Scroll-triggered reveal.
 *
 * The element is only put into its hidden state once the observer has claimed
 * it, which matters more than it sounds: if the script never runs — an older
 * browser, a failed chunk, a crawler — the content is simply visible. Nothing
 * on this site is behind an animation.
 *
 * It fires once and then disconnects. A section that re-animates every time it
 * scrolls past reads as a gimmick, and this is a housebuilder's site.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className,
  style,
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  /** Stagger, in milliseconds. Keep runs under ~240ms in total. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Honour the OS setting here as well as in CSS, so the observer does not
    // even arm and there is no transition to interrupt.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) {
      el.dataset.reveal = 'in';
      return;
    }

    el.dataset.reveal = 'armed';
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = 'in';
          observer.unobserve(entry.target);
        }
      },
      // Fire a little before the element's top edge reaches the fold, so the
      // motion has finished by the time it is properly in view.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      style={delay ? ({ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties) : style}
    >
      {children}
    </Tag>
  );
}
