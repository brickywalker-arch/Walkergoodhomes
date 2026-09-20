'use client';

import { useId, useState } from 'react';
import { Modal } from './Modal';
import { PartnerForm } from '@/components/forms/PartnerForm';
import type { EnquiryKind } from '@/data/partners';

/**
 * A call to action that opens its enquiry in a dialog.
 *
 * The modal is only mounted once it is open, so six of these on a page cost
 * nothing until one is used. The button carries aria-haspopup="dialog" so a
 * screen reader announces what activating it will do.
 */
export function EnquiryButton({
  kind,
  label,
  variant = 'gold',
  className,
  style,
}: {
  kind: EnquiryKind;
  label: string;
  variant?: 'gold' | 'outline' | 'plain';
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  const cls = className ?? (variant === 'gold' ? 'btn-g' : variant === 'outline' ? 'btn-o' : 'link-arrow');

  return (
    <>
      <button type="button" className={cls} style={style} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        {label}
        <span className="arrow" aria-hidden="true" style={{ marginLeft: 10 }}>
          &rarr;
        </span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} labelledBy={headingId}>
        <PartnerForm kind={kind} headingId={headingId} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
