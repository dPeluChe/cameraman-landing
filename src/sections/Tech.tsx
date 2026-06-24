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
    <section id="tech" className="py-[90px] relative z-1 text-center">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="text-[12px] font-bold uppercase tracking-[1px] text-accent-bright mb-3">
          Under the hood
        </div>
        <h2 className="text-[40px] font-extrabold tracking-[-1.5px] leading-[1.1] mb-3.5 max-md:text-[30px]">
          Built in Swift, on Apple frameworks.
        </h2>
        <p className="text-[17px] text-text-muted mb-13 max-w-[620px] mx-auto">
          A modular engine (EngineKit) plus a SwiftUI app and a standalone MCP
          server — all sharing the same non-destructive editing core.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-5 mb-9">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center bg-bg-card border border-border rounded-[14px] py-6 px-4"
            >
              <div className="text-[34px] font-extrabold tracking-[-1.5px] gradient-accent">
                {s.num}
              </div>
              <div className="text-[11px] text-text-muted uppercase tracking-[0.6px] mt-1 font-semibold">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2.5 flex-wrap justify-center">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[13px] px-3.5 py-1.5 rounded-lg bg-bg-card border border-border text-text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
