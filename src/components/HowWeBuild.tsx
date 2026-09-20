'use client';

import { useEffect, useRef, useState } from 'react';
import { BUILD_STEPS, type BuildStep } from '@/data/journal';
import { DEFAULT_FINISHES } from '@/data/interior';
import { photoImage, roomImage, sheetImage } from '@/lib/cgi';
import { SectionHead } from './ui/SectionHead';
import { CornerMarks } from './CornerMarks';

type Resolved = { src: string; srcSet?: string };

/** One resolver per image source, so the data file stays free of asset paths. */
function resolve(step: BuildStep): Resolved | null {
  if (step.image.from === 'photo') {
    const img = photoImage(step.image.key);
    return { src: img.src, srcSet: img.srcSet };
  }
  if (step.image.from === 'room') {
    const img = roomImage(step.image.room, DEFAULT_FINISHES);
    return { src: img.src, srcSet: img.srcSet };
  }
  const sheet = sheetImage(step.image.slug);
  return sheet ? { src: sheet.src, srcSet: sheet.srcSet } : null;
}

/**
 * Behind every finished home — the build sequence.
 *
 * Sticky storytelling: the image holds on the left while the six steps scroll
 * past on the right, and the active step swaps the image under it. The
 * sequence deliberately moves from the architect's drawings into the modelled
 * interiors, so the transition from drawing to finished room happens in front
 * of the visitor rather than being described to them.
 *
 * Below 900px the grid collapses, `position: sticky` has nothing to stick
 * against, and each step simply carries its own image — which is the right
 * shape for a phone anyway.
 */
export function HowWeBuild({ id = 'how-we-build' }: { id?: string }) {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const nodes = steps.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The step nearest the middle of the viewport wins, so the image never
        // flickers between two that are both technically on screen.
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const best = visible.reduce((a, b) => (a.intersectionRatio >= b.intersectionRatio ? a : b));
        const i = nodes.indexOf(best.target as HTMLDivElement);
        if (i >= 0) setActive(i);
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const images = BUILD_STEPS.map(resolve);

  return (
    <section className="sec" id={id} style={{ background: 'var(--navy)', color: 'var(--ink-on-navy)' }}>
      <div className="wrap">
        <SectionHead
          tone="navy"
          eyebrow="How we build"
          title="Behind every finished home."
          lead="Six stages, in the order they happen. Every image here is either the architect's issued drawing or a visual built from it — there is no stock photography on this page."
          maxWidth={660}
        />

        <div
          className="build-grid"
          style={{
            marginTop: 'clamp(34px,5vw,64px)',
            display: 'grid',
            gap: 'clamp(20px,3.5vw,54px)',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))',
            alignItems: 'start',
          }}
        >
          {/* The held image. Hidden from assistive tech: each step below names
              its own drawing, so announcing this too would just repeat it. */}
          <div className="sticky-pane" aria-hidden="true">
            <div className="plate" style={{ position: 'relative', aspectRatio: '4 / 3', background: 'var(--navy-deep)', border: '1px solid rgba(239,207,145,.25)' }}>
              {images.map((img, i) =>
                img ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={BUILD_STEPS[i].key}
                    src={img.src}
                    srcSet={img.srcSet}
                    sizes="(max-width: 860px) 100vw, 46vw"
                    alt=""
                    loading={i === 0 ? undefined : 'lazy'}
                    decoding="async"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      background: BUILD_STEPS[i].image.from === 'sheet' ? 'var(--white)' : 'transparent',
                      opacity: active === i ? 1 : 0,
                      transform: active === i ? 'scale(1)' : 'scale(1.02)',
                      transition: 'opacity .6s cubic-bezier(.22,.61,.36,1), transform .9s cubic-bezier(.22,.61,.36,1)',
                    }}
                  />
                ) : null,
              )}
              <CornerMarks tone="gold" />
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 11.5,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-faint-navy)',
              }}
            >
              {BUILD_STEPS[active].caption}
            </div>
          </div>

          {/* The steps. */}
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {BUILD_STEPS.map((step, i) => {
              const on = active === i;
              const img = images[i];
              return (
                <li key={step.key}>
                  <div
                    ref={(el) => {
                      steps.current[i] = el;
                    }}
                    style={{
                      padding: 'clamp(20px,3vw,34px) 0',
                      borderTop: i === 0 ? '1px solid rgba(239,207,145,.22)' : undefined,
                      borderBottom: '1px solid rgba(239,207,145,.22)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                      <span
                        className="hd"
                        aria-hidden="true"
                        style={{
                          fontSize: 13,
                          letterSpacing: '.14em',
                          color: on ? 'var(--gold)' : 'rgba(143,162,177,.7)',
                          transition: 'color .4s',
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3
                        className="hd"
                        style={{
                          fontSize: 'clamp(30px,4.4vw,56px)',
                          lineHeight: 1,
                          color: on ? '#fff' : 'rgba(219,228,234,.44)',
                          transition: 'color .45s',
                        }}
                      >
                        {step.title}
                      </h3>
                    </div>
                    <p
                      style={{
                        margin: '12px 0 0',
                        maxWidth: 460,
                        fontSize: 14.5,
                        lineHeight: 1.75,
                        color: on ? 'var(--ink-on-navy-2)' : 'rgba(143,162,177,.62)',
                        transition: 'color .45s',
                      }}
                    >
                      {step.line}
                    </p>

                    {/* The phone layout: the sticky pane is off-screen above,
                        so each step carries its own image inline. Hidden on
                        wide screens by the container query below. */}
                    {img ? (
                      <div data-inline-figure style={{ marginTop: 16 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          srcSet={img.srcSet}
                          sizes="100vw"
                          alt={step.caption}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: '100%',
                            aspectRatio: '4 / 3',
                            objectFit: 'contain',
                            background: step.image.from === 'sheet' ? 'var(--white)' : 'var(--navy-deep)',
                            border: '1px solid rgba(239,207,145,.25)',
                            display: 'block',
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
