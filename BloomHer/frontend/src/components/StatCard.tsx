import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="mt-2 font-display text-3xl text-ink">{value}</p>
          {hint ? <p className="mt-2 text-xs leading-relaxed text-ink-muted">{hint}</p> : null}
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lavender-mist text-lavender">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </Card>
  )
}
