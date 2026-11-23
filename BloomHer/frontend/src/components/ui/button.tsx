import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-lavender text-white shadow-sm hover:bg-lavender-deep',
        secondary:
          'bg-white text-ink border border-line hover:bg-blush-soft/60',
        ghost: 'text-ink-muted hover:bg-lavender-mist/70 hover:text-ink',
        sage: 'bg-sage text-white hover:bg-sage/90',
      },
      size: {
        sm: 'h-9 px-3.5',
        md: 'h-11 px-5',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
