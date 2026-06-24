import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

type Tone = 'default' | 'green' | 'blue' | 'orange' | 'purple'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  className?: string
}

const tones: Record<Tone, string> = {
  default: 'text-text-muted border-border bg-bg-card',
  green: 'text-green border-[rgba(48,209,88,0.3)] bg-[rgba(48,209,88,0.06)]',
  blue: 'text-accent-bright border-[rgba(10,132,255,0.3)] bg-accent-soft',
  orange: 'text-orange border-[rgba(255,159,10,0.3)] bg-[rgba(255,159,10,0.06)]',
  purple: 'text-purple border-[rgba(191,90,242,0.3)] bg-[rgba(191,90,242,0.06)]',
}

export function Badge({ children, tone = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-[11px] py-[5px] rounded-full text-[11px] font-semibold uppercase tracking-[0.6px] border',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
