export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={
        compact
          ? 'rounded-2xl border border-line bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-muted'
          : 'rounded-3xl border border-blush/40 bg-blush-soft/60 px-5 py-4 text-sm leading-relaxed text-ink'
      }
    >
      <p className="font-medium text-ink">BloomHer is not a diagnostic tool.</p>
      <p className={compact ? 'mt-1' : 'mt-1.5 text-ink-muted'}>
        It does not decide whether someone has depression, anxiety, or any other condition. It
        never replaces doctors, therapists, psychologists, psychiatrists, nurses, or ASHA workers.
      </p>
    </aside>
  )
}
