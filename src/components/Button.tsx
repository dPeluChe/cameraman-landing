import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

type Variant = 'primary' | 'ghost'
type Size = 'md' | 'lg'

interface ButtonProps {
  href: string
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
}

const base =
  'inline-flex items-center gap-2 font-semibold rounded-[10px] border border-transparent transition-all duration-200 ease-out no-underline'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-bright hover:shadow-[0_4px_24px_var(--color-accent-glow)] hover:-translate-y-px',
  ghost:
    'bg-transparent text-text border-border hover:border-text-dim hover:bg-bg-card',
}

const sizes: Record<Size, string> = {
  md: 'px-[18px] py-[10px] text-sm',
  lg: 'px-[26px] py-[14px] text-[15px] rounded-[12px]',
}

export function Button({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
}: ButtonProps) {
  return (
    <a href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </a>
  )
}
