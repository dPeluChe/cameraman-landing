import { motion } from 'framer-motion'

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
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
      )}

      {variant === 'dots' && (
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(var(--color-text-dim) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage:
              'radial-gradient(ellipse at center, black 20%, transparent 70%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          }}
        />
      )}

      {variant === 'mesh' && (
        <>
          <div
            className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background:
                'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
            style={{
              background:
                'radial-gradient(circle, rgba(191,90,242,0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </>
      )}

      {variant === 'orbs' && (
        <>
          <motion.div
            animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[10%] left-[5%] w-[300px] h-[300px] rounded-full opacity-20"
            style={{
              background:
                'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          <motion.div
            animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[15%] right-[10%] w-[250px] h-[250px] rounded-full opacity-15"
            style={{
              background:
                'radial-gradient(circle, rgba(191,90,242,0.35) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[40%] right-[30%] w-[200px] h-[200px] rounded-full opacity-10"
            style={{
              background:
                'radial-gradient(circle, rgba(255,159,10,0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </>
      )}

      {variant === 'gradient' && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, var(--color-bg-alt) 50%, transparent 100%)',
          }}
        />
      )}
    </div>
  )
}
