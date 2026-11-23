import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      tone: {
        lavender: 'bg-lavender-mist text-lavender-deep',
        blush: 'bg-blush-soft text-[#7A5752]',
        sage: 'bg-sage-soft text-sage',
        neutral: 'bg-canvas text-ink-muted',
      },
    },
    defaultVariants: {
      tone: 'lavender',
    },
  },
)

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
