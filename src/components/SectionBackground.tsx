
type Variant = 'grid' | 'mesh' | 'orbs' | 'dots' | 'gradient'

interface SectionBackgroundProps {
  variant?: Variant
  className?: string
}

export function SectionBackground({
  variant = 'grid',
  className = '',
}: SectionBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      {variant === 'grid' && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      )}

      {variant === 'dots' && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(var(--color-text-dim) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      )}

      {variant === 'mesh' && (
        <>
          <div
            className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background:
                'radial-gradient(circle, var(--color-accent-glow) 0%, rgba(10,132,255,0.05) 50%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
            style={{
              background:
                'radial-gradient(circle, rgba(191,90,242,0.35) 0%, rgba(191,90,242,0.05) 50%, transparent 70%)',
            }}
          />
        </>
      )}

      {variant === 'orbs' && (
        <>
          <div
            className="absolute top-[10%] left-[5%] w-[300px] h-[300px] rounded-full opacity-20"
            style={{
              background:
                'radial-gradient(circle, var(--color-accent-glow) 0%, rgba(10,132,255,0.05) 50%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-[15%] right-[10%] w-[250px] h-[250px] rounded-full opacity-15"
            style={{
              background:
                'radial-gradient(circle, rgba(191,90,242,0.35) 0%, rgba(191,90,242,0.05) 50%, transparent 70%)',
            }}
          />
        </>
      )}
    </div>
  )
}
