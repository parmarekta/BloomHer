import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-2xl border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-lavender focus:ring-2 focus:ring-lavender/20',
        className,
      )}
      {...props}
    />
  )
}
