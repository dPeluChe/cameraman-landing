import { SectionBackground } from '../components/SectionBackground'
import { SectionHeading } from '../components/SectionHeading'
import { Stagger, StaggerItem } from '../components/Reveal'

const cards = [
  {
    icon: '\u{1F4B0}',
    title: 'Free & Open Source',
    body: 'MIT licensed. No subscriptions, no upsells, no telemetry. The whole engine is a Swift package you can reuse.',
    gradient: 'linear-gradient(135deg, rgba(48,209,88,0.15), transparent)',
  },
  {
    icon: '\u{1F512}',
    title: 'Local-First, Zero Cloud',
    body: 'Everything stays on your Mac. No accounts, no uploads. Your recordings and your data never leave your machine.',
    gradient: 'linear-gradient(135deg, rgba(10,132,255,0.15), transparent)',
  },
  {
    icon: '\u{1F916}',
    title: 'Edit With AI Agents',
    body: 'A built-in MCP server exposes 42 tools. Ask Claude or Codex to trim silences, add overlays, change speed — they drive the same editor you do.',
    gradient: 'linear-gradient(135deg, rgba(191,90,242,0.15), transparent)',
  },
  {
    icon: '\u{1F50D}',
    title: 'Smart Auto-Zoom',
    body: 'Cursor telemetry detects clicks and pauses, then suggests zoom points automatically. No manual keyframing.',
    gradient: 'linear-gradient(135deg, rgba(255,159,10,0.15), transparent)',
  },
]

export function Why() {
  return (
    <section id="why" className="relative py-[100px] z-1 overflow-hidden">
      <SectionBackground variant="grid" />
      <div className="relative max-w-[1120px] mx-auto px-6">
        <SectionHeading
          eyebrow="Why Cameraman"
          title={<>A recorder that doesn&apos;t cost $89<br />or need a PhD to use.</>}
          subtitle="Screen Studio is polished but paid and closed. OBS is free but has no editor. Cameraman is free, open source, and ships a full timeline editor — plus an MCP server so agents can help."
        />
        <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
          {cards.map((c) => (
            <StaggerItem key={c.title}>
              <div
                className="h-full bg-bg-card border border-border rounded-[14px] p-[26px] transition-all duration-200 hover:border-text-dim hover:-translate-y-1 relative overflow-hidden"
                style={{ backgroundImage: c.gradient }}
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-[11px] bg-accent-soft text-[26px] mb-3.5 relative z-10">
                  {c.icon}
                </div>
                <h3 className="text-base font-bold mb-2 relative z-10">
                  {c.title}
                </h3>
                <p className="text-sm text-text-muted leading-[1.55] relative z-10">
                  {c.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
