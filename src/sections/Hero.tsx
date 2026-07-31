import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { EditorMockup } from '../components/EditorMockup'
import { SectionBackground } from '../components/SectionBackground'

const heroBadges = [
  { label: 'Swift Native', tone: 'blue' as const },
  { label: 'macOS 13+', tone: 'default' as const },
  { label: 'Open Source', tone: 'green' as const },
  { label: 'Free', tone: 'green' as const },
  { label: 'MCP', tone: 'purple' as const },
  { label: 'v0.7.0 Beta', tone: 'orange' as const },
]

export function Hero() {
  return (
    <section className="relative pt-[100px] pb-[80px] text-center z-1 overflow-hidden">
      {/* Layered backgrounds */}
      <SectionBackground variant="orbs" />
      <SectionBackground variant="grid" />
      {/* Top gradient fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(10,132,255,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-[1120px] mx-auto px-6">
        <div className="flex justify-center gap-2 mb-7 flex-wrap">
          {heroBadges.map((b) => (
            <Badge key={b.label} tone={b.tone}>
              {b.label}
            </Badge>
          ))}
        </div>

        <h1 className="text-[62px] font-extrabold tracking-[-2.5px] leading-[1.05] mb-5 max-md:text-[38px] max-md:tracking-[-1.5px]">
          <span className="gradient-text">Record. Edit. Export.</span>
          <br />
          <span className="gradient-accent inline-block">
            Let AI do the cuts.
          </span>
        </h1>

        <p className="text-[21px] text-text-muted max-w-[620px] mx-auto mb-9 leading-[1.5] max-md:text-[17px]">
          A local-first screen recorder &amp; editor for macOS — with a built-in
          MCP server so Claude, Codex, or any agent can edit your videos for you.
        </p>

        <div className="flex justify-center gap-3.5 flex-wrap">
          <Button href="#install" variant="primary" size="lg">
            Download for macOS
          </Button>
          <Button
            href="https://github.com/dPeluChe/cameraman"
            variant="ghost"
            size="lg"
          >
            View Source
          </Button>
        </div>

        {/* Scroll hint */}
        <div className="mt-12 flex justify-center">
          <div className="text-text-dim text-xs flex flex-col items-center gap-1">
            <span className="uppercase tracking-[1px]">Scroll</span>
            <span className="text-[16px]">↓</span>
          </div>
        </div>

        <EditorMockup />
      </div>
    </section>
  )
}
