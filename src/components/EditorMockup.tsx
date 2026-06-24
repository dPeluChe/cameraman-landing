import { motion } from 'framer-motion'

const projects = [
  { name: 'demo-recording', active: true },
  { name: 'onboarding-walkthrough', active: false },
  { name: 'feature-preview', active: false },
  { name: 'release-0.7.0', active: false },
]

export function EditorMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="mt-16 bg-bg-card border border-border rounded-[18px] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.02)] text-left overflow-hidden"
    >
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border-soft">
        <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
        <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
        <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-text-dim font-medium">
          Cameraman — demo-recording
        </span>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-[200px_1fr] gap-px bg-border-soft rounded-[10px] overflow-hidden mt-px max-sm:grid-cols-1 max-sm:[&>.sidebar]:hidden">
        {/* Sidebar */}
        <div className="sidebar bg-bg-alt p-3.5 row-span-2">
          <div className="text-[10px] uppercase tracking-[0.5px] text-text-dim font-semibold mb-2.5">
            Projects
          </div>
          {projects.map((p) => (
            <div
              key={p.name}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-[7px] mb-1 text-xs ${
                p.active
                  ? 'bg-accent-soft text-text'
                  : 'text-text-muted'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-[3px] flex-shrink-0 ${
                  p.active ? 'bg-accent' : 'bg-border'
                }`}
              />
              {p.name}
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="bg-black aspect-video relative flex items-center justify-center min-h-[220px]">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
          />
          <div className="absolute top-[30%] left-[25%] w-1/2 h-[40%] bg-white/[0.04] rounded-lg border border-white/[0.06]" />

          {/* Overlay arrow */}
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute top-[35%] left-[40%] text-accent-bright text-[22px] font-bold"
            style={{ textShadow: '0 0 12px var(--color-accent-glow)' }}
          >
            &#x2197;
          </motion.span>

          {/* Zoom cursor */}
          <div className="absolute top-[45%] left-[55%] w-3 h-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-5 border-2 border-accent-bright rounded-[4px]"
            />
          </div>

          {/* Camera PiP */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
            className="absolute bottom-4 right-4 w-16 h-16 rounded-full border-2 border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            style={{
              background: 'linear-gradient(135deg, #ff9f0a, #ff375f)',
            }}
          />
        </div>

        {/* Timeline */}
        <div className="bg-bg-alt p-3 min-h-[120px]">
          <div className="flex mb-2.5 border-b border-border-soft pb-1">
            {['0:00', '0:05', '0:10', '0:15', '0:20', '0:25'].map((t) => (
              <span key={t} className="flex-1 text-[9px] text-text-dim text-left">
                {t}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px] mb-[5px] items-center">
            <span className="text-[9px] text-text-dim w-[50px] flex-shrink-0 uppercase tracking-[0.3px]">
              Screen
            </span>
            <div className="h-[22px] rounded-[4px] flex-1 relative bg-[linear-gradient(90deg,#0a84ff_0%,#0a84ff_48%,#16161a_48%,#16161a_52%,#3a9bff_52%)]">
              <div className="absolute -top-1.5 -bottom-1.5 left-[42%] w-0.5 bg-pink shadow-[0_0_6px_var(--color-pink)]" />
              <div className="absolute -top-0.5 right-1 text-[8px] bg-purple text-white px-1 py-px rounded-[3px] font-semibold">
                ZOOM
              </div>
            </div>
          </div>

          <div className="flex gap-[3px] mb-[5px] items-center">
            <span className="text-[9px] text-text-dim w-[50px] flex-shrink-0 uppercase tracking-[0.3px]">
              Camera
            </span>
            <div className="h-[22px] rounded-[4px] w-[30%] flex-shrink-0 bg-[linear-gradient(90deg,#ff9f0a,#ff375f)]" />
          </div>

          <div className="flex gap-[3px] items-center">
            <span className="text-[9px] text-text-dim w-[50px] flex-shrink-0 uppercase tracking-[0.3px]">
              Audio
            </span>
            <div className="h-[16px] rounded-[4px] flex-1 bg-[linear-gradient(90deg,#30d158,#28c840)]" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
