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
    <section id="install" className="py-[90px] relative z-1">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="text-[12px] font-bold uppercase tracking-[1px] text-accent-bright mb-3">
          Get it
        </div>
        <h2 className="text-[40px] font-extrabold tracking-[-1.5px] leading-[1.1] mb-3.5 max-md:text-[30px]">
          Download or build from source.
        </h2>
        <p className="text-[17px] text-text-muted mb-11 max-w-[620px]">
          Grab the latest beta build for macOS, or clone and run in Xcode.
        </p>
        <div className="flex mb-11 flex-wrap gap-3.5">
          <Button href="https://github.com/dPeluChe/cameraman/releases/latest" variant="primary" size="lg">
            Download for macOS
          </Button>
          <Button href="https://github.com/dPeluChe/cameraman/releases" variant="ghost" size="lg">
            All releases
          </Button>
        </div>
        <h3 className="text-lg font-bold mb-3.5">Build from source</h3>
        <div className="bg-bg-card border border-border rounded-[10px] py-[22px] px-[26px] font-mono text-[13px] text-text-muted overflow-x-auto leading-[1.8]">
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
        <p className="text-text-dim text-[13px] mt-4.5 leading-[1.6]">
          Requires macOS 13 (Ventura) or later · Xcode 15+ · Swift 5.9+. Grant
          Screen Recording, Camera, and Microphone permissions when prompted. The
          beta DMG is unsigned — see the{' '}
          <a
            href="https://github.com/dPeluChe/cameraman#install-beta"
            className="text-text-muted"
          >
            README
          </a>{' '}
          for Gatekeeper bypass steps.
        </p>
      </div>
    </section>
  )
}
