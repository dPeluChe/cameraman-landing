import { SectionBackground } from '../components/SectionBackground'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/Reveal'
import { Button } from '../components/Button'

const codeLines = [
  { type: 'comment', text: '# Clone the repo' },
  { type: 'cmd', text: 'git clone', rest: ' https://github.com/dPeluChe/cameraman.git' },
  { type: 'cmd', text: 'cd', rest: ' cameraman' },
  { type: 'empty', text: '' },
  { type: 'comment', text: '# Open in Xcode — scheme "CameramanApp" → Run on "My Mac"' },
  { type: 'cmd', text: 'open', rest: ' CameramanApp/CameramanApp.xcodeproj' },
  { type: 'empty', text: '' },
  { type: 'comment', text: '# Or build the engine standalone' },
  { type: 'cmd', text: 'cd', rest: ' EngineKit && swift build' },
  { type: 'empty', text: '' },
  { type: 'comment', text: '# Build the MCP server standalone' },
  { type: 'cmd', text: 'cd', rest: ' MCPServer && swift build -c release' },
]

export function Install() {
  return (
    <section
      id="install"
      className="relative py-[100px] z-1 overflow-hidden"
    >
      <SectionBackground variant="grid" />
      <SectionBackground variant="mesh" />
      <div className="relative max-w-[1120px] mx-auto px-6">
        <SectionHeading
          eyebrow="Get it"
          title="Download or build from source."
          subtitle="Grab the latest beta build for macOS, or clone and run in Xcode."
        />
        <Reveal delay={0.2}>
          <div className="flex mb-11 flex-wrap gap-3.5">
            <Button
              href="https://github.com/dPeluChe/cameraman/releases/latest"
              variant="primary"
              size="lg"
            >
              Download for macOS
            </Button>
            <Button
              href="https://github.com/dPeluChe/cameraman/releases"
              variant="ghost"
              size="lg"
            >
              All releases
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <h3 className="text-lg font-bold mb-3.5">Build from source</h3>
        </Reveal>
        <Reveal delay={0.35}>
          <div className="bg-bg-card border border-border rounded-[10px] py-[22px] px-[26px] font-mono text-[13px] text-text-muted overflow-x-auto leading-[1.8] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            {codeLines.map((line, i) => (
              <div key={i}>
                {line.type === 'comment' && (
                  <span className="text-text-dim">{line.text}</span>
                )}
                {line.type === 'cmd' && (
                  <>
                    <span className="text-green">{line.text}</span>
                    <span className="text-accent-bright">{line.rest}</span>
                  </>
                )}
                {line.type === 'empty' && <br />}
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="text-text-dim text-[13px] mt-4.5 leading-[1.6]">
            Requires macOS 13 (Ventura) or later · Xcode 15+ · Swift 5.9+. Grant
            Screen Recording, Camera, and Microphone permissions when prompted.
            The beta DMG is unsigned — see the{' '}
            <a
              href="https://github.com/dPeluChe/cameraman#install-beta"
              className="text-text-muted"
            >
              README
            </a>{' '}
            for Gatekeeper bypass steps.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
