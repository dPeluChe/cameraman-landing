import { motion } from 'framer-motion'
import { SectionBackground } from '../components/SectionBackground'
import { SectionHeading } from '../components/SectionHeading'
import { Stagger, StaggerItem } from '../components/Reveal'

const stats = [
  { num: '48.8K', label: 'Lines of Code' },
  { num: '22.6K', label: 'Lines of Tests' },
  { num: '42', label: 'MCP Tools' },
  { num: '5', label: 'Export Presets' },
  { num: 'v0.7.0', label: 'Current Version' },
]

const tags = [
  'Swift 5.9+',
  'SwiftUI',
  'ScreenCaptureKit',
  'AVFoundation',
  'CoreImage',
  'WhisperKit',
  'MCP (JSON-RPC)',
  'macOS 13+ Ventura',
  'App Sandbox',
]

export function Tech() {
  return (
    <section
      id="tech"
      className="relative py-[100px] z-1 text-center overflow-hidden"
    >
      <SectionBackground variant="mesh" />
      <SectionBackground variant="grid" />
      <div className="relative max-w-[1120px] mx-auto px-6">
        <SectionHeading
          eyebrow="Under the hood"
          title="Built in Swift, on Apple frameworks."
          subtitle="A modular engine (EngineKit) plus a SwiftUI app and a standalone MCP server — all sharing the same non-destructive editing core."
          center
        />
        <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-5 mb-9">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="text-center bg-bg-card border border-border rounded-[14px] py-6 px-4 hover:border-accent transition-colors"
              >
                <div className="text-[34px] font-extrabold tracking-[-1.5px] gradient-accent">
                  {s.num}
                </div>
                <div className="text-[11px] text-text-muted uppercase tracking-[0.6px] mt-1 font-semibold">
                  {s.label}
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
        <Stagger className="flex gap-2.5 flex-wrap justify-center">
          {tags.map((t) => (
            <StaggerItem key={t}>
              <span className="inline-block text-[13px] px-3.5 py-1.5 rounded-lg bg-bg-card border border-border text-text-muted hover:border-text-dim transition-colors">
                {t}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
