'use client';

import { useMemo, useState } from 'react';
import {
  DEFAULT_FINISHES, ENVELOPE, FINISHES, FINISH_GROUP_KEYS, FLOOR_TAGS, PLAN, ROOMS,
  finishOption, finishSummary, planFloor, roomTitle,
  type FinishGroupKey, type Finishes,
} from '@/data/interior';
import { roomAxes, roomImage } from '@/lib/cgi';
import { CornerMarks } from './CornerMarks';

/**
 * The interior explorer.
 *
 * The picture is the point of this section, so it takes the wide column and
 * everything that drives it sits beside it in one rail: the floor, the room,
 * and the finishes. A visitor changing a wall colour should never have to
 * scroll to see what it did.
 *
 * A room is chosen either way round — by its area on the plan or by its name
 * in the list next to it. The plan is a locator at this size rather than a
 * drawing to read, so its cells carry the room's name and the list beside it
 * carries the dimension; the selected room's own figures are under the image.
 * Both controls drive the same `roomIndex`, so they cannot disagree.
 *
 * The finishes switcher resolves the visitor's exact combination against the
 * image manifests, so what they see is their own choice rather than a stand-in.
 */
export function Inside({ onFinishes }: { onFinishes?: (f: Finishes) => void }) {
  const [roomIndex, setRoomIndex] = useState(0);
  const [finishes, setFinishes] = useState<Finishes>(DEFAULT_FINISHES);

  const room = ROOMS[roomIndex];
  const floor = room.floor;
  const plan = planFloor(floor);
  const floorIdx = Math.max(0, FLOOR_TAGS.indexOf(floor));

  // Which of the six choices this room's image actually varies on. A bedroom
  // does not change when the tiles do, and saying so is better than letting a
  // visitor click through four tile ranges watching nothing happen.
  const liveAxes = useMemo(() => roomAxes(room.key) as FinishGroupKey[], [room.key]);
  const summary = useMemo(() => finishSummary(finishes, liveAxes), [finishes, liveAxes]);
  const image = useMemo(() => roomImage(room.key, finishes), [room.key, finishes]);

  const kitchenSwatch = finishOption('kitchen', finishes.kitchen).swatch;
  const kitchenTint = `color-mix(in oklab, ${kitchenSwatch} 34%, #0b3454)`;

  const setFinish = (group: FinishGroupKey, id: string) => {
    const next = { ...finishes, [group]: id };
    setFinishes(next);
    onFinishes?.(next);
  };

  const selectFloor = (idx: number) => {
    const first = ROOMS.findIndex((r) => r.floor === FLOOR_TAGS[idx]);
    if (first >= 0) setRoomIndex(first);
  };

  const roomsOnThisFloor = ROOMS.map((r, i) => ({ r, i })).filter(({ r }) => r.floor === floor);
  const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;

  return (
    <section className="sec" id="inside" style={{ background: 'var(--navy)' }}>
      <div className="wrap">
        <div className="two" style={{ alignItems: 'end' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>
              Inside the home
            </div>
            <h2 className="hd" style={{ fontSize: 'clamp(38px,5.4vw,70px)', color: '#fff', marginTop: 12 }}>
              A home you can picture yourself in.
            </h2>
          </div>
          <p className="lead" style={{ color: 'var(--ink-on-navy-2)' }}>
            Room locations and dimensions come straight from the plan. Furniture is illustrative; the finishes you
            pick beside the picture are rendered as drawn.
          </p>
        </div>

        <div className="inside-grid" style={{ marginTop: 'clamp(26px,3.6vw,44px)' }}>
          {/* ------------------------------------------------------ the stage */}
          <div className="inside-stage">
            <div
              style={{
                position: 'relative',
                aspectRatio: '3 / 2',
                background: '#e7e2d8',
                overflow: 'hidden',
                border: '1px solid rgba(239,207,145,.4)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                srcSet={image.srcSet}
                sizes="(max-width: 899px) 100vw, 60vw"
                alt={`Computer-generated image of the ${room.label.toLowerCase()}, ${room.level.toLowerCase()}, shown with ${summary}`}
                width={1600}
                height={1067}
                decoding="async"
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(4,24,43,.82)',
                  padding: '10px 14px',
                  fontWeight: 600,
                  fontSize: 9,
                  letterSpacing: '.14em',
                  color: 'var(--gold-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span>{image.exact ? `Shown in ${summary}` : `Base render · ${summary}`}</span>
                <span style={{ color: '#b9c8d2' }}>{room.floor} FLOOR · CGI FROM DWG 26/1362/03</span>
              </div>
              <CornerMarks tone="white" />
            </div>

            {/* The room the picture is of, directly beneath it. */}
            <div style={{ background: '#fff', padding: 'clamp(18px,2.4vw,28px)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 'clamp(12px,2vw,24px)',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
                    {room.level}
                  </div>
                  <h3 className="hd" style={{ fontSize: 'clamp(28px,3.4vw,42px)', margin: '8px 0 0' }}>
                    {roomTitle(room.label)}
                  </h3>
                </div>
                <div className="inside-facts">
                  {[
                    { v: room.size, k: 'off dwg 26/1362/03' },
                    { v: room.openings, k: 'openings on the plan' },
                  ].map((f) => (
                    <div key={f.k}>
                      <b
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-barlow-condensed), sans-serif',
                          fontSize: 'clamp(17px,1.5vw,21px)',
                          lineHeight: 1.15,
                          color: '#173047',
                        }}
                      >
                        {f.v}
                      </b>
                      <span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>{f.k}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 14.5, lineHeight: 1.72, color: 'var(--ink-body)' }}>
                {room.desc}
              </p>
            </div>
          </div>

          {/* --------------------------------------------------- the controls */}
          <aside className="inside-rail">
            <div className="inside-panel">
              <div className="inside-panel-head">Choose a room</div>

              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }} role="tablist" aria-label="Floor">
                {PLAN.map((p, i) => (
                  <button
                    key={p.tag}
                    type="button"
                    role="tab"
                    aria-selected={i === floorIdx}
                    className="ctl"
                    data-on={i === floorIdx}
                    style={{ minHeight: 40, padding: '0 12px', fontSize: 9.5 }}
                    onClick={() => selectFloor(i)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="inside-picker">
                {/* The plan, drawn to the real mm geometry off sheet 03 — a
                    locator at this size, so the cells carry names only. */}
                <div>
                  <div
                    className="inside-plan"
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: `${ENVELOPE.width} / ${ENVELOPE.depth}`,
                      border: '2px solid rgba(239,207,145,.6)',
                      background: 'rgba(255,255,255,.03)',
                    }}
                  >
                    {plan.rooms.map((cell) => {
                      const idx = ROOMS.findIndex((r) => r.key === cell.key);
                      const live = idx >= 0 && idx === roomIndex;
                      const isKitchen = cell.key === 'kitchen';
                      return (
                        <button
                          key={cell.key}
                          type="button"
                          aria-pressed={live}
                          title={`${cell.short} — ${cell.dims}`}
                          onClick={() => idx >= 0 && setRoomIndex(idx)}
                          style={{
                            position: 'absolute',
                            left: pct(cell.x, ENVELOPE.width),
                            top: pct(cell.y, ENVELOPE.depth),
                            width: pct(cell.w, ENVELOPE.width),
                            height: pct(cell.h, ENVELOPE.depth),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 2,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            background: live ? 'var(--gold)' : isKitchen ? kitchenTint : 'rgba(255,255,255,.05)',
                            border: `1px solid ${live ? 'var(--gold)' : isKitchen ? kitchenSwatch : 'rgba(239,207,145,.45)'}`,
                            color: live ? 'var(--navy)' : '#eef3f6',
                            font: 'inherit',
                            borderRadius: 0,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 7.5,
                              letterSpacing: '.06em',
                              lineHeight: 1.05,
                              textAlign: 'center',
                            }}
                          >
                            {cell.short}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* The same choice by name — the plan's text equivalent. */}
                <div style={{ display: 'grid', gap: 6, alignContent: 'start' }}>
                  {roomsOnThisFloor.map(({ r, i }) => (
                    <button
                      key={r.key}
                      type="button"
                      aria-pressed={i === roomIndex}
                      onClick={() => setRoomIndex(i)}
                      className="ctl"
                      style={{
                        minHeight: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '0 12px',
                        textAlign: 'left',
                        fontSize: 9.5,
                        letterSpacing: '.1em',
                      }}
                    >
                      <span>{r.label}</span>
                      <span style={{ fontWeight: 400, fontSize: 11, letterSpacing: '.02em', opacity: 0.75 }}>
                        {r.size}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  paddingTop: 12,
                  fontWeight: 600,
                  fontSize: 8,
                  letterSpacing: '.12em',
                  color: 'var(--ink-faint-navy)',
                }}
              >
                {plan.foot}
              </div>
            </div>

            <div className="inside-panel">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div className="inside-panel-head" style={{ marginBottom: 0 }}>
                  Choose your finishes
                </div>
                <span style={{ fontSize: 11, color: 'var(--ink-faint-navy)' }}>{summary}</span>
              </div>

              <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
                {FINISH_GROUP_KEYS.map((gk) => {
                  const live = liveAxes.includes(gk);
                  return (
                    <fieldset key={gk} style={{ border: 0, margin: 0, padding: 0, opacity: live ? 1 : 0.55 }}>
                      <legend
                        style={{
                          fontWeight: 600,
                          fontSize: 8.5,
                          letterSpacing: '.16em',
                          color: 'var(--gold-light)',
                          textTransform: 'uppercase',
                          marginBottom: 8,
                          padding: 0,
                        }}
                      >
                        {FINISHES[gk].name}
                        <span
                          style={{
                            marginLeft: 8,
                            fontWeight: 500,
                            letterSpacing: '.03em',
                            textTransform: 'none',
                            color: 'var(--ink-faint-navy)',
                          }}
                        >
                          {live
                            ? (FINISHES[gk].hint ?? '')
                            : `not shown in the ${roomTitle(room.label).toLowerCase()}`}
                        </span>
                      </legend>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {FINISHES[gk].options.map((o) => {
                          const on = finishes[gk] === o.id;
                          return (
                            <button
                              key={o.id}
                              type="button"
                              aria-pressed={on}
                              title={o.note ?? o.label}
                              onClick={() => setFinish(gk, o.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                                minHeight: 44,
                                padding: '0 11px 0 8px',
                                cursor: 'pointer',
                                background: on && live ? 'var(--gold)' : 'rgba(255,255,255,.06)',
                                border: `1px solid ${on ? 'var(--gold)' : 'rgba(239,207,145,.4)'}`,
                                color: on && live ? 'var(--navy)' : '#eef3f6',
                                fontWeight: 600,
                                fontSize: 9.5,
                                letterSpacing: '.07em',
                                fontFamily: 'inherit',
                                borderRadius: 0,
                              }}
                            >
                              <span
                                aria-hidden="true"
                                style={{
                                  width: 16,
                                  height: 16,
                                  flex: 'none',
                                  background: o.swatch,
                                  border: '1px solid rgba(6,34,58,.45)',
                                }}
                              />
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                      {live && finishOption(gk, finishes[gk]).note ? (
                        <p style={{ margin: '7px 0 0', fontSize: 11, lineHeight: 1.6, color: 'var(--ink-faint-navy)' }}>
                          {finishOption(gk, finishes[gk]).note}
                        </p>
                      ) : null}
                    </fieldset>
                  );
                })}
              </div>

              <p style={{ margin: '16px 0 0', fontSize: 11.5, lineHeight: 1.65, color: 'var(--ink-faint-navy)' }}>
                {image.exact
                  ? 'This combination is imaged from the drawings — shown beside. Your selection carries through the plan and is sent with your enquiry.'
                  : 'This combination does not have its own image yet, so the room’s base render stays on screen. Your selection still carries through the plan and is sent with your enquiry.'}{' '}
                Images are computer-generated from the architect&rsquo;s issued drawings. Room shapes, sizes and
                openings are as drawn; furniture and styling are illustrative.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
