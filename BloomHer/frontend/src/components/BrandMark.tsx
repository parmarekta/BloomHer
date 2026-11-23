import { Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function BrandMark({ compact = false, to = '/' }: { compact?: boolean; to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5 text-ink">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lavender text-white shadow-sm">
        <Sprout className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className={cn(compact && 'sr-only')}>
        <span className="block font-display text-lg leading-none">BloomHer</span>
        <span className="mt-0.5 block text-xs text-ink-muted">Maternal wellbeing support</span>
      </span>
    </Link>
  )
}
