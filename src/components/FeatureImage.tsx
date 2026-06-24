import { motion } from 'framer-motion'

interface FeatureImageProps {
  /** Label shown in the placeholder */
  label: string
  /** Optional gradient for the placeholder background */
  gradient?: string
  /** Icon/emoji shown large in the placeholder */
  icon?: string
  /** When a real screenshot path becomes available, set this */
  src?: string
  alt?: string
}

const defaultGradients: Record<string, string> = {
  blue: 'linear-gradient(135deg, #0a84ff 0%, #3a9bff 100%)',
  purple: 'linear-gradient(135deg, #bf5af2 0%, #ff375f 100%)',
  green: 'linear-gradient(135deg, #30d158 0%, #28c840 100%)',
  orange: 'linear-gradient(135deg, #ff9f0a 0%, #ff5f57 100%)',
  dark: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
}

export function FeatureImage({
  label,
  gradient = 'dark',
  icon,
  src,
  alt = '',
}: FeatureImageProps) {
  if (src) {
    return (
      <motion.img
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 1.05 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full h-full object-cover"
      />
    )
  }

  const bg =
    defaultGradients[gradient] ?? defaultGradients.dark

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3 relative overflow-hidden"
      style={{ background: bg }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      {icon && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 0.9, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-[40px] relative z-10"
        >
          {icon}
        </motion.span>
      )}
      <span className="text-[11px] text-white/50 uppercase tracking-[0.5px] font-semibold relative z-10">
        {label}
      </span>
    </div>
  )
}
