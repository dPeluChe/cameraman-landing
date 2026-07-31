
type Variant = 'grid' | 'mesh' | 'orbs' | 'dots' | 'gradient'

interface SectionBackgroundProps {
  variant?: Variant
  className?: string
}

export function SectionBackground(props: SectionBackgroundProps) {
  return props.variant ? null : null
}
