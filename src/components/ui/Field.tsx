'use client';

import { useId, useRef, useState } from 'react';
import type { FormField } from '@/data/partners';

/** Bytes, for the attachment list. */
function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type FieldValue = string | string[] | File[];

/**
 * One form control, rendered from its schema entry.
 *
 * Every kind carries a real <label>, an id that ties them together, and
 * aria-describedby for the hint and the error. The error is announced rather
 * than only coloured, because colour alone is not a message.
 */
export function Field({
  field,
  value,
  onChange,
  error,
  tone = 'paper',
}: {
  field: FormField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  error?: string;
  tone?: 'paper' | 'navy';
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const [over, setOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const describedBy = [field.hint ? hintId : null, error ? errId : null].filter(Boolean).join(' ') || undefined;
  const navy = tone === 'navy';
  const labelColour = navy ? 'var(--ink-faint-navy-2)' : undefined;

  const common = {
    id,
    name: field.name,
    className: 'input',
    'aria-describedby': describedBy,
    'aria-invalid': error ? (true as const) : undefined,
    style: error ? { borderColor: 'var(--error-border)', background: 'var(--error-bg)' } : undefined,
  };

  return (
    <div style={{ gridColumn: field.span === 2 ? '1 / -1' : undefined }}>
      {field.kind === 'chips' ? (
        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="field-label" style={{ color: labelColour, padding: 0 }}>
            {field.label}
          </legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {(field.options ?? []).map((opt) => {
              const list = Array.isArray(value) ? (value as string[]) : [];
              const on = list.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  className={navy ? 'chip chip-on-navy' : 'chip'}
                  aria-pressed={on}
                  onClick={() => onChange(on ? list.filter((v) => v !== opt) : [...list, opt])}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <>
          <label htmlFor={id} className="field-label" style={{ color: labelColour }}>
            {field.label}
            {field.required ? <span aria-hidden="true"> *</span> : null}
            {field.required ? <span className="sr-only"> (required)</span> : null}
          </label>

          {field.kind === 'textarea' ? (
            <textarea
              {...common}
              rows={5}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => onChange(e.target.value)}
              style={{ ...common.style, resize: 'vertical', lineHeight: 1.6, paddingTop: 12 }}
            />
          ) : field.kind === 'select' ? (
            <select {...common} value={value as string} onChange={(e) => onChange(e.target.value)}>
              <option value="">Please choose…</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.kind === 'files' ? (
            <>
              <input
                ref={fileInput}
                id={id}
                name={field.name}
                type="file"
                multiple
                accept={field.accept}
                className="sr-only"
                aria-describedby={describedBy}
                onChange={(e) => onChange(Array.from(e.target.files ?? []))}
              />
              {/*
                The dropzone is a label, so a click and a keyboard activation
                both reach the input above — no custom key handling, and the
                input keeps its own focus ring.
              */}
              <label
                htmlFor={id}
                className="dropzone"
                data-over={over || undefined}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(false);
                  onChange(Array.from(e.dataTransfer.files ?? []));
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: 'var(--navy-mid)',
                  }}
                >
                  Choose files or drop them here
                </span>
                <span style={{ display: 'block', marginTop: 6, fontSize: 12.5, color: 'var(--ink-muted)' }}>
                  Up to 5 files, 8&nbsp;MB each. They are sent with your enquiry.
                </span>
              </label>
              {Array.isArray(value) && value.length ? (
                <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'grid', gap: 6 }}>
                  {(value as File[]).map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '8px 12px',
                        background: 'var(--white)',
                        border: '1px solid var(--rule-light)',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.name}{' '}
                        <span style={{ color: 'var(--ink-muted)' }}>· {size(f.size)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = (value as File[]).filter((_, j) => j !== i);
                          onChange(next);
                          if (!next.length && fileInput.current) fileInput.current.value = '';
                        }}
                        style={{
                          flex: 'none',
                          minHeight: 32,
                          padding: '0 10px',
                          background: 'transparent',
                          border: '1px solid var(--rule)',
                          cursor: 'pointer',
                          font: 'inherit',
                          fontSize: 11,
                          color: 'var(--ink-body)',
                        }}
                      >
                        Remove<span className="sr-only"> {f.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <input
              {...common}
              type={field.kind}
              inputMode={field.kind === 'tel' ? 'tel' : undefined}
              autoComplete={
                field.kind === 'email'
                  ? 'email'
                  : field.kind === 'tel'
                    ? 'tel'
                    : field.name === 'contactName'
                      ? 'name'
                      : field.name === 'organisation'
                        ? 'organization'
                        : undefined
              }
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </>
      )}

      {field.hint ? (
        <p id={hintId} style={{ margin: '7px 0 0', fontSize: 12, lineHeight: 1.6, color: 'var(--ink-muted)' }}>
          {field.hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} style={{ margin: '7px 0 0', fontSize: 12.5, fontWeight: 600, color: 'var(--error-ink)' }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
