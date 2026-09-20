'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * A dialog the keyboard can actually use.
 *
 * Escape closes it, Tab is trapped inside it, the page behind it cannot
 * scroll, and focus returns to whatever opened it. Those four are the whole
 * job — a modal that misses any of them is a trap rather than a dialog.
 *
 * Rendered inline rather than through a portal: the scrim is `position:fixed`
 * with its own stacking context, and nothing on this site creates a
 * transformed ancestor that would break that.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** id of the heading inside the panel. */
  labelledBy: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const keydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;

      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panel.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    opener.current = document.activeElement as HTMLElement | null;

    // Lock the page without the layout jumping as the scrollbar goes.
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    document.addEventListener('keydown', keydown);

    // Focus the first thing inside, after the panel has painted.
    const raf = requestAnimationFrame(() => {
      const target =
        panel.current?.querySelector<HTMLElement>('[data-autofocus]') ??
        panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', keydown);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      opener.current?.focus?.();
    };
  }, [open, keydown]);

  if (!open) return null;

  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        // Only a press that both starts and ends on the scrim closes it, so a
        // drag that began on the form does not dismiss what was being typed.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={{ marginBlock: 'auto' }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2,
            width: 44,
            height: 44,
            display: 'grid',
            placeItems: 'center',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            color: 'var(--ink-muted)',
            font: 'inherit',
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          <span aria-hidden="true">&times;</span>
        </button>
        {children}
      </div>
    </div>
  );
}
