import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const projects = [
  { name: 'demo-recording', active: true },
  { name: 'onboarding-walkthrough', active: false },
  { name: 'feature-preview', active: false },
  { name: 'release-0.7.0', active: false },
]

export function EditorMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -4])

  return (
    <motion.div
      ref={ref}
      style={{ y, rotateX, transformPerspective: 1200 }}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className="mt-16 bg-bg-card border border-border rounded-[18px] p-2.5 shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03),0_0_80px_rgba(10,132,255,0.08)] text-left overflow-hidden"
    >
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border-soft">
        <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
        <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
        <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-text-dim font-medium">
          Cameraman — demo-recording
        </span>
        {/* Fake toolbar */}
        <div className="ml-auto flex items-center gap-2 text-text-dim text-[10px]">
          <span className="px-2 py-0.5 rounded bg-bg-elev">⌘R Record</span>
          <span className="px-2 py-0.5 rounded bg-bg-elev">⌘E Export</span>
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-[200px_1fr] gap-px bg-border-soft rounded-[10px] overflow-hidden mt-px max-sm:grid-cols-1 max-sm:[&>.sidebar]:hidden">
        {/* Sidebar */}
        <div className="sidebar bg-bg-alt p-3.5 row-span-2">
          <div className="text-[10px] uppercase tracking-[0.5px] text-text-dim font-semibold mb-2.5">
            Projects
          </div>
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-[7px] mb-1 text-xs ${
                p.active ? 'bg-accent-soft text-text' : 'text-text-muted'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-[3px] flex-shrink-0 ${
                  p.active ? 'bg-accent' : 'bg-border'
                }`}
              />
              {p.name}
            </motion.div>
          ))}

          {/* Fake inspector */}
          <div className="mt-5 pt-4 border-t border-border-soft">
            <div className="text-[10px] uppercase tracking-[0.5px] text-text-dim font-semibold mb-2.5">
              Inspector
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-text-dim">
                <span>Speed</span>
                <span className="text-text-muted">1.0×</span>
              </div>
              <div className="h-1 bg-bg-elev rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-text-dim">
                <span>Volume</span>
                <span className="text-text-muted">120%</span>
              </div>
              <div className="h-1 bg-bg-elev rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ delay: 1.7, duration: 0.6 }}
                  className="h-full bg-green rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-black aspect-video relative flex items-center justify-center min-h-[240px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
          />
          {/* Fake code editor content */}
          <div className="absolute top-[20%] left-[15%] w-[45%] space-y-1.5 opacity-30">
            {[80, 60, 70, 45, 65].map((w, i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
                className="h-1.5 bg-white/20 rounded-full origin-left"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>

          {/* Overlay arrow */}
          <motion.span
            initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 1.4, type: 'spring', stiffness: 200 }}
            className="absolute top-[32%] left-[38%] text-accent-bright text-[28px] font-bold z-10"
            style={{ textShadow: '0 0 16px var(--color-accent-glow)' }}
          >
            &#x2197;
          </motion.span>

          {/* Zoom cursor with pulsing frame */}
          <div className="absolute top-[48%] left-[58%] w-3 h-3 z-10">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-6 border-2 border-accent-bright rounded-[6px]"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute -inset-8 border border-accent-bright rounded-[8px]"
            />
          </div>

          {/* Camera PiP */}
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 1.1, type: 'spring', stiffness: 180 }}
            className="absolute bottom-4 right-4 w-16 h-16 rounded-full border-2 border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-10 flex items-center justify-center text-[10px] text-white/60 font-semibold"
            style={{ background: 'linear-gradient(135deg, #ff9f0a, #ff375f)' }}
          >
            REC
          </motion.div>

          {/* Fake caption from transcription */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="absolute bottom-4 left-4 px-2.5 py-1 rounded bg-black/60 backdrop-blur text-[10px] text-white/80 z-10"
          >
            &ldquo;So first, open the project...&rdquo;
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="bg-bg-alt p-3 min-h-[130px]">
          <div className="flex mb-2.5 border-b border-border-soft pb-1">
            {['0:00', '0:05', '0:10', '0:15', '0:20', '0:25'].map((t) => (
              <span key={t} className="flex-1 text-[9px] text-text-dim text-left">
                {t}
              </span>
            ))}
          </div>

          {/* Screen track with split + zoom badge */}
          <div className="flex gap-[3px] mb-[5px] items-center">
            <span className="text-[9px] text-text-dim w-[50px] flex-shrink-0 uppercase tracking-[0.3px]">
              Screen
            </span>
            <div className="h-[22px] rounded-[4px] flex-1 relative bg-[linear-gradient(90deg,#0a84ff_0%,#0a84ff_48%,#16161a_48%,#16161a_52%,#3a9bff_52%)]">
              <motion.div
                initial={{ left: '0%' }}
                animate={{ left: '42%' }}
                transition={{ delay: 1.6, duration: 1.2, ease: 'easeInOut' }}
                className="absolute -top-1.5 -bottom-1.5 w-0.5 bg-pink shadow-[0_0_6px_var(--color-pink)]"
              />
              <div className="absolute -top-0.5 right-1 text-[8px] bg-purple text-white px-1 py-px rounded-[3px] font-semibold">
                ZOOM
              </div>
            </div>
          </div>

          {/* Camera track */}
          <div className="flex gap-[3px] mb-[5px] items-center">
            <span className="text-[9px] text-text-dim w-[50px] flex-shrink-0 uppercase tracking-[0.3px]">
              Camera
            </span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '30%' }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="h-[22px] rounded-[4px] flex-shrink-0 bg-[linear-gradient(90deg,#ff9f0a,#ff375f)]"
            />
          </div>

          {/* Audio track with waveform-like bars */}
          <div className="flex gap-[3px] items-center">
            <span className="text-[9px] text-text-dim w-[50px] flex-shrink-0 uppercase tracking-[0.3px]">
              Audio
            </span>
            <div className="h-[16px] rounded-[4px] flex-1 bg-[linear-gradient(90deg,#30d158,#28c840)] relative overflow-hidden">
              <div className="absolute inset-0 flex items-center gap-px px-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${30 + Math.sin(i * 0.5) * 40 + 30}%` }}
                    transition={{ delay: 1.4 + i * 0.01, duration: 0.3 }}
                    className="flex-1 bg-black/20 rounded-px"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
