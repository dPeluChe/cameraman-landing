import { Suspense, type ComponentType } from 'react'
import { motion } from 'framer-motion'

interface LazySectionProps {
  /** pre-created lazy component */
  component: ComponentType
  /** fallback height to prevent layout shift */
  minHeight?: number
}

/**
 * Wraps a lazy-loaded section with Suspense + fade-in.
 * The placeholder reserves vertical space to avoid CLS (layout shift).
 *
 * Usage:
 *   const LazyFeatures = lazy(() => import('./sections/Features').then(m => ({ default: m.Features })))
 *   <LazySection component={LazyFeatures} minHeight={800} />
 */
export function LazySection({ component: Component, minHeight = 400 }: LazySectionProps) {
  return (
    <Suspense
      fallback={
        <div
          style={{ minHeight }}
          className="flex items-center justify-center"
          aria-busy="true"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-6 rounded-full border-2 border-text-dim border-t-accent-bright"
          />
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Component />
      </motion.div>
    </Suspense>
  )
}
