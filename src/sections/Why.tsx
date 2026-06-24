const cards = [
  {
    icon: '\u{1F4B0}',
    title: 'Free & Open Source',
    body: 'MIT licensed. No subscriptions, no upsells, no telemetry. The whole engine is a Swift package you can reuse.',
  },
  {
    icon: '\u{1F512}',
    title: 'Local-First, Zero Cloud',
    body: 'Everything stays on your Mac. No accounts, no uploads. Your recordings and your data never leave your machine.',
  },
  {
    icon: '\u{1F916}',
    title: 'Edit With AI Agents',
    body: 'A built-in MCP server exposes 42 tools. Ask Claude or Codex to trim silences, add overlays, change speed — they drive the same editor you do.',
  },
  {
    icon: '\u{1F50D}',
    title: 'Smart Auto-Zoom',
    body: 'Cursor telemetry detects clicks and pauses, then suggests zoom points automatically. No manual keyframing.',
  },
]

export function Why() {
  return (
    <section id="why" className="py-[90px] relative z-1">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="text-[12px] font-bold uppercase tracking-[1px] text-accent-bright mb-3">
          Why Cameraman
        </div>
        <h2 className="text-[40px] font-extrabold tracking-[-1.5px] leading-[1.1] mb-3.5 max-md:text-[30px]">
          A recorder that doesn&apos;t cost $89
          <br />
          or need a PhD to use.
        </h2>
        <p className="text-[17px] text-text-muted mb-13 max-w-[620px]">
          Screen Studio is polished but paid and closed. OBS is free but has no
          editor. Cameraman is free, open source, and ships a full timeline editor
          — plus an MCP server so agents can help.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
          {cards.map((c) => (
            <div
              key={c.title}
              className="bg-bg-card border border-border rounded-[14px] p-[26px] transition-all duration-200 hover:border-text-dim hover:-translate-y-0.5"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-[11px] bg-accent-soft text-[26px] mb-3.5">
                {c.icon}
              </div>
              <h3 className="text-base font-bold mb-2">{c.title}</h3>
              <p className="text-sm text-text-muted leading-[1.55]">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
