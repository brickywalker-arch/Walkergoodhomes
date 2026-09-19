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
 * Three coupled controls over one selection: floor tabs, an interactive plan
 * drawn to the real millimetre geometry off sheet 26/1362/03, and a room list.
 * The finishes switcher resolves the visitor's exact combination against the
 * rendered-variant manifest, so what they see is a render of their own choice
 * rather than a stand-in.
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
            pick below are rendered as drawn.
          </p>
        </div>

        {/* Floor tabs */}
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', margin: '28px 0 18px' }} role="tablist" aria-label="Floor">
          {PLAN.map((p, i) => (
            <button
              key={p.tag}
              type="button"
              role="tab"
              aria-selected={i === floorIdx}
              className="ctl"
              data-on={i === floorIdx}
              onClick={() => selectFloor(i)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))',
            gap: 'clamp(18px,2.5vw,28px)',
            alignItems: 'start',
            marginBottom: 'clamp(20px,3vw,30px)',
          }}
        >
          {/* Interactive plan, drawn to the real mm geometry */}
          <div
            style={{
              border: '1px solid rgba(239,207,145,.35)',
              padding: 'clamp(14px,2vw,20px)',
              background: 'rgba(255,255,255,.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 12,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: '.16em', color: 'var(--gold-light)' }}>
                {plan.name} · TAP A ROOM
              </span>
              <span style={{ fontSize: 11, color: 'var(--ink-faint-navy)' }}>{plan.note}</span>
            </div>
            <div
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
                    onClick={() => idx >= 0 && setRoomIndex(idx)}
                    style={{
                      position: 'absolute',
                      left: pct(cell.x, ENVELOPE.width),
                      top: pct(cell.y, ENVELOPE.depth),
                      width: pct(cell.w, ENVELOPE.width),
                      height: pct(cell.h, ENVELOPE.depth),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      padding: 4,
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
                        fontSize: 'clamp(8px,1.05vw,12px)',
                        letterSpacing: '.09em',
                        lineHeight: 1.1,
                        textAlign: 'center',
                      }}
                    >
                      {cell.short}
                    </span>
                    <span style={{ fontSize: 'clamp(7px,0.85vw,10.5px)', lineHeight: 1.1, opacity: 0.72 }}>
                      {cell.dims}
                    </span>
                  </button>
                );
              })}
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 8.5,
                letterSpacing: '.14em',
                color: 'var(--ink-faint-navy)',
                textAlign: 'center',
                paddingTop: 10,
              }}
            >
              {plan.foot}
            </div>
          </div>

          {/* Room list — the plan's text equivalent, kept adjacent to it */}
          <div>
            <div
              style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: '.16em', color: 'var(--gold-light)', marginBottom: 12 }}
            >
              ROOMS ON THIS FLOOR
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {roomsOnThisFloor.map(({ r, i }) => (
                <button
                  key={r.key}
                  type="button"
                  aria-pressed={i === roomIndex}
                  onClick={() => setRoomIndex(i)}
                  className="ctl"
                  style={{
                    minHeight: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    padding: '0 16px',
                    textAlign: 'left',
                    fontSize: 10.5,
                    letterSpacing: '.12em',
                  }}
                >
                  <span>{r.label}</span>
                  <span style={{ fontWeight: 400, fontSize: 11.5, letterSpacing: '.03em', opacity: 0.75 }}>
                    {r.size}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Room detail */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))',
            gap: 'clamp(18px,2.5vw,28px)',
            alignItems: 'start',
          }}
        >
          <div
            style={{
              position: 'relative',
              alignSelf: 'start',
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
              sizes="(max-width: 800px) 100vw, 580px"
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

          <div style={{ background: '#fff', padding: 'clamp(24px,3.4vw,42px)' }}>
            <div className="eyebrow" style={{ color: 'var(--gold-deep)' }}>
              {room.level}
            </div>
            <h3 className="hd" style={{ fontSize: 'clamp(30px,3.8vw,46px)', margin: '10px 0 12px' }}>
              {roomTitle(room.label)}
            </h3>
            <p className="lead">{room.desc}</p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                background: '#d9d0c3',
                marginTop: 24,
              }}
            >
              <div style={{ background: '#f7f3ec', padding: 16 }}>
                <b
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-barlow-condensed), sans-serif',
                    fontSize: 22,
                    color: '#173047',
                  }}
                >
                  {room.size}
                </b>
                <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>off dwg 26/1362/03</span>
              </div>
              <div style={{ background: '#f7f3ec', padding: 16 }}>
                <b
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-barlow-condensed), sans-serif',
                    fontSize: 22,
                    color: '#173047',
                    lineHeight: 1.15,
                  }}
                >
                  {room.openings}
                </b>
                <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>openings on the plan</span>
              </div>
            </div>

            {/* Finishes switcher */}
            <div style={{ marginTop: 24, borderTop: '1px solid var(--rule)', paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span className="field-label" style={{ display: 'inline' }}>
                  Choose your finishes
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--ink-muted-2)' }}>{summary}</span>
              </div>
              <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
                {FINISH_GROUP_KEYS.map((gk) => {
                  const live = liveAxes.includes(gk);
                  return (
                  <fieldset key={gk} style={{ border: 0, margin: 0, padding: 0, opacity: live ? 1 : 0.62 }}>
                    <legend
                      style={{
                        fontWeight: 600,
                        fontSize: 9,
                        letterSpacing: '.16em',
                        color: 'var(--gold-deep)',
                        textTransform: 'uppercase',
                        marginBottom: 9,
                        padding: 0,
                      }}
                    >
                      {FINISHES[gk].name}
                      <span
                        style={{
                          marginLeft: 8,
                          fontWeight: 500,
                          letterSpacing: '.04em',
                          textTransform: 'none',
                          color: 'var(--ink-muted-2)',
                        }}
                      >
                        {live
                          ? (FINISHES[gk].hint ?? '')
                          : `not shown in the ${roomTitle(room.label).toLowerCase()}`}
                      </span>
                    </legend>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                              gap: 9,
                              minHeight: 44,
                              padding: '0 13px 0 9px',
                              cursor: 'pointer',
                              background: on ? 'var(--navy)' : '#fff',
                              border: `1px solid ${on ? 'var(--navy)' : 'var(--input-border)'}`,
                              color: on ? 'var(--gold-light)' : '#183045',
                              fontWeight: 600,
                              fontSize: 10,
                              letterSpacing: '.08em',
                              fontFamily: 'inherit',
                              borderRadius: 0,
                            }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: 20,
                                height: 20,
                                flex: 'none',
                                background: o.swatch,
                                border: '1px solid rgba(6,34,58,.35)',
                              }}
                            />
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                    {live && finishOption(gk, finishes[gk]).note ? (
                      <p style={{ margin: '7px 0 0', fontSize: 11.5, color: 'var(--ink-muted-2)' }}>
                        {finishOption(gk, finishes[gk]).note}
                      </p>
                    ) : null}
                  </fieldset>
                  );
                })}
              </div>
              <p style={{ margin: '16px 0 0', fontSize: 12.5, lineHeight: 1.65, color: 'var(--ink-muted-2)' }}>
                {image.exact
                  ? 'This combination is rendered from the drawings — shown above. Your selection carries through the plan and is sent with your enquiry.'
                  : 'This combination does not have its own render yet, so the room’s base render stays on screen. Your selection still carries through the plan and is sent with your enquiry.'}
              </p>
              <p style={{ margin: '12px 0 0', fontSize: 12.5, lineHeight: 1.65, color: 'var(--ink-muted-2)' }}>
                Images are computer-generated from the architect&rsquo;s issued drawings. Room shapes, sizes and
                openings are as drawn; furniture and styling are illustrative.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
