import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { EditorMockupV2 } from '../components/EditorMockupV2'

const heroBadges = [
  { label: 'Swift 5.9+', tone: 'blue' as const },
  { label: 'macOS 13+ & iOS 16+', tone: 'default' as const },
  { label: 'Open Source MIT', tone: 'green' as const },
  { label: 'Local-First', tone: 'green' as const },
  { label: '43 MCP Tools', tone: 'purple' as const },
]

export function HeroV2() {
  return (
    <section className="relative pt-[120px] pb-[100px] text-center z-1 overflow-hidden">
      {/* Isolated Ambient Glow */}
      <div className="hero-glow-isolated" />
      
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--color-text-dim) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative max-w-[1160px] mx-auto px-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft/30 border border-accent-bright/30 text-xs font-semibold text-accent-bright mb-8 shadow-[0_2px_10px_rgba(10,132,255,0.15)]">
          <span className="w-2 h-2 rounded-full bg-accent-bright animate-pulse" />
          Introducing Cameraman 0.7.0 Beta &amp; iOS Takes
        </div>

        {/* Hero Headline 2.0 */}
        <h1 className="text-[68px] max-md:text-[42px] font-extrabold tracking-[-3px] max-md:tracking-[-1.5px] leading-[1.02] mb-6 max-w-[900px] mx-auto">
          Screen Recording &amp; Video Editing,{' '}
          <span className="bg-gradient-to-r from-accent-bright via-purple to-pink bg-clip-text text-transparent">
            Scripted by AI.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-[20px] max-md:text-[17px] text-text-muted max-w-[680px] mx-auto mb-10 leading-[1.6]">
          The local-first macOS editor with a built-in 43-tool MCP server — so Claude, Codex, or any agent can cut silences, caption, and export your videos automatically.
        </p>

        {/* Hero CTA Group */}
        <div className="flex justify-center items-center gap-4 flex-wrap mb-12">
          <Button href="#install" variant="primary" size="lg" className="shadow-[0_8px_25px_rgba(10,132,255,0.35)]">
            Download for macOS (.dmg)
          </Button>
          <Button href="#mobile" variant="ghost" size="lg" className="border border-border hover:border-text-dim">
            📱 Explore iOS Takes App
          </Button>
        </div>

        {/* Feature Badges pill row */}
        <div className="flex justify-center gap-2.5 mb-14 flex-wrap">
          {heroBadges.map((b) => (
            <Badge key={b.label} tone={b.tone}>
              {b.label}
            </Badge>
          ))}
        </div>

        {/* Interactive Editor Mockup V2 */}
        <EditorMockupV2 />
      </div>
    </section>
  )
}
