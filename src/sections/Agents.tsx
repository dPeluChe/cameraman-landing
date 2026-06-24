import { motion } from 'framer-motion'

const toolCalls = [
  { label: 'suggest_silence_edits', args: null },
  { label: 'split_clip', args: '{ at: 4.2s }' },
  { label: 'delete_clip', args: '{ clipId: "..." }' },
  { label: 'add_adjustment', args: '{ kind: "zoom" }' },
  { label: 'export_project', args: '{ preset: "animated_gif" }' },
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
    <section id="agents" className="py-[90px] relative z-1">
      <div className="max-w-[1120px] mx-auto px-6 grid grid-cols-[1.1fr_1fr] gap-12 items-center max-md:grid-cols-1 max-md:gap-8">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-[1px] text-accent-bright mb-3">
            Edit with AI agents
          </div>
          <h2 className="text-[40px] font-extrabold tracking-[-1.5px] leading-[1.1] mb-3.5 max-md:text-[30px]">
            Your editor,
            <br />
            scripted by an agent.
          </h2>
          <p className="text-[17px] text-text-muted mb-5 leading-[1.5]">
            Cameraman ships a built-in MCP server. Connect Claude Desktop, Claude
            Code, or Codex and they can inspect projects, split clips, add
            overlays, transcribe, and export — driving the exact same
            non-destructive engine as the app.
          </p>
          <ul className="mt-6 space-y-3.5">
            {features.map((f) => (
              <li
                key={f.strong}
                className="flex items-start gap-2.5 text-[15px] text-text-muted"
              >
                <span className="text-green flex-shrink-0 mt-0.5">✓</span>
                <span>
                  <strong className="text-text font-semibold">{f.strong}</strong>
                  {f.rest}
                </span>
              </li>
            ))}
          </ul>
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
        </div>

        {/* Chat mock */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-bg-card border border-border rounded-[14px] p-5 text-[13px] leading-[1.7]"
        >
          <div className="mb-3.5 last:mb-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-text-muted mb-1">
              You
            </div>
            <div className="text-text bg-bg-elev px-3.5 py-2.5 rounded-[9px] border border-border-soft">
              Trim the silent intro, add a zoom on the first click, then export to
              GIF.
            </div>
          </div>
          <div className="mb-3.5">
            <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple mb-1">
              Agent
            </div>
            <div className="text-text bg-bg-elev px-3.5 py-2.5 rounded-[9px] border border-border-soft">
              On it. I&apos;ll detect silence, split the clip, add a zoom
              adjustment, and kick off a GIF export.
            </div>
          </div>
          <div className="mb-3.5">
            <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-accent-bright mb-1">
              Tool calls
            </div>
            <div className="text-text bg-bg-elev px-3.5 py-2.5 rounded-[9px] border border-border-soft space-y-1">
              {toolCalls.map((tc) => (
                <div
                  key={tc.label}
                  className="flex items-center gap-2 text-text-muted font-mono text-xs"
                >
                  <span className="text-accent-bright">→</span>
                  {tc.label}
                  {tc.args && (
                    <code className="text-green">{tc.args}</code>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple mb-1">
              Agent
            </div>
            <div className="text-text bg-bg-elev px-3.5 py-2.5 rounded-[9px] border border-border-soft">
              Done. Silences trimmed, zoom added at 0:06, GIF rendering — jobId{' '}
              <code className="text-green font-mono">a1b2c3</code>. Polling
              status…
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
