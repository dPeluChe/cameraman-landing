import { motion } from 'framer-motion'
import { SectionBackground } from '../components/SectionBackground'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'

const toolCalls = [
  { label: 'suggest_silence_edits', args: null, delay: 0 },
  { label: 'split_clip', args: '{ at: 4.2s }', delay: 0.15 },
  { label: 'delete_clip', args: '{ clipId: "..." }', delay: 0.3 },
  { label: 'add_adjustment', args: '{ kind: "zoom" }', delay: 0.45 },
  { label: 'export_project', args: '{ preset: "animated_gif" }', delay: 0.6 },
]

const features = [
  { strong: '42 tools', rest: ' — projects, clips, tracks, overlays, effects, canvas, export, transcription.' },
  { strong: 'Non-destructive by design', rest: ' — agents edit project.json, never your source media.' },
  { strong: 'Async export & transcription', rest: ' — poll job status until done.' },
  { strong: 'Bundled & signed', rest: ' — the binary lives inside the app. Settings → Integrations auto-detects it.' },
]

const clients = ['Claude Desktop', 'Claude Code', 'Codex CLI', 'Any MCP client']

export function Agents() {
  return (
    <section
      id="agents"
      className="relative py-[100px] z-1 overflow-hidden"
    >
      <SectionBackground variant="orbs" />
      <SectionBackground variant="grid" />

      <div className="relative max-w-[1120px] mx-auto px-6 grid grid-cols-[1.1fr_1fr] gap-12 items-center max-md:grid-cols-1 max-md:gap-8">
        <div>
          <SectionHeading
            eyebrow="Edit with AI agents"
            title={<>Your editor,<br />scripted by an agent.</>}
            subtitle="Cameraman ships a built-in MCP server. Connect Claude Desktop, Claude Code, or Codex and they can inspect projects, split clips, add overlays, transcribe, and export — driving the exact same non-destructive engine as the app."
          />
          <Reveal delay={0.3}>
            <ul className="mt-6 space-y-3.5">
              {features.map((f) => (
                <li
                  key={f.strong}
                  className="flex items-start gap-2.5 text-[15px] text-text-muted"
                >
                  <span className="text-green flex-shrink-0 mt-0.5">✓</span>
                  <span>
                    <strong className="text-text font-semibold">
                      {f.strong}
                    </strong>
                    {f.rest}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="flex gap-2 flex-wrap mt-6">
              {clients.map((c) => (
                <span
                  key={c}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-bg-card border border-border text-text-muted"
                >
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Chat mock with sequential message reveals */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-bg-card border border-border rounded-[14px] p-5 text-[13px] leading-[1.7] shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        >
          {/* User message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-3.5"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-text-muted mb-1">
              You
            </div>
            <div className="text-text bg-bg-elev px-3.5 py-2.5 rounded-[9px] border border-border-soft">
              Trim the silent intro, add a zoom on the first click, then export
              to GIF.
            </div>
          </motion.div>

          {/* Agent thinking */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mb-3.5"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple mb-1">
              Agent
            </div>
            <div className="text-text bg-bg-elev px-3.5 py-2.5 rounded-[9px] border border-border-soft">
              On it. I&apos;ll detect silence, split the clip, add a zoom
              adjustment, and kick off a GIF export.
            </div>
          </motion.div>

          {/* Tool calls with stagger */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mb-3.5"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-accent-bright mb-1">
              Tool calls
            </div>
            <div className="text-text bg-bg-elev px-3.5 py-2.5 rounded-[9px] border border-border-soft space-y-1">
              {toolCalls.map((tc) => (
                <motion.div
                  key={tc.label}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + tc.delay, duration: 0.3 }}
                  className="flex items-center gap-2 text-text-muted font-mono text-xs"
                >
                  <span className="text-accent-bright">→</span>
                  {tc.label}
                  {tc.args && <code className="text-green">{tc.args}</code>}
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 + tc.delay, duration: 0.2 }}
                    className="text-green ml-auto text-[10px]"
                  >
                    ✓
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Final agent message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.8, duration: 0.4 }}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple mb-1">
              Agent
            </div>
            <div className="text-text bg-bg-elev px-3.5 py-2.5 rounded-[9px] border border-border-soft">
              Done. Silences trimmed, zoom added at 0:06, GIF rendering — jobId{' '}
              <code className="text-green font-mono">a1b2c3</code>. Polling
              status…
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
