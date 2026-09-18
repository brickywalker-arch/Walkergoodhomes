/**
 * The one Industry idiom used verbatim: four `+` registration marks at the
 * corners of a framed plate. `tone` picks the ink for the ground it sits on.
 */
export function CornerMarks({ tone = 'ink' }: { tone?: 'ink' | 'gold' | 'white' }) {
  const cls = tone === 'gold' ? 'mk mk-gold' : tone === 'white' ? 'mk mk-white' : 'mk';
  return (
    <>
      <span className={cls} aria-hidden="true">+</span>
      <span className={cls} aria-hidden="true">+</span>
      <span className={cls} aria-hidden="true">+</span>
      <span className={cls} aria-hidden="true">+</span>
    </>
  );
}
