import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  once?: boolean
}

export function Reveal({
  children,
  className = '',
}: RevealProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface StaggerProps {
  children: ReactNode
  className?: string
  once?: boolean
}

export function Stagger({ children, className = '' }: StaggerProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
