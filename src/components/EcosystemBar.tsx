export function EcosystemBar() {
  const items = [
    {
      badge: 'macOS Native',
      title: 'Multitrack Desktop App',
      desc: 'ScreenCaptureKit 4K recording, camera PiP, system audio & mic in separate tracks. Non-destructive timeline editor.',
      icon: '🖥️',
      color: 'border-accent-bright/30 bg-accent-soft/20 text-accent-bright',
    },
    {
      badge: 'iOS Companion',
      title: 'Mobile Takes App',
      desc: 'Capture dual-cam iPhone takes with EXIF GPS metadata. Organize in sequences and sync directly to your Mac.',
      icon: '📱',
      color: 'border-green/30 bg-[rgba(48,209,88,0.1)] text-green',
    },
    {
      badge: 'AI Automation',
      title: '43-Tool MCP Server',
      desc: 'Bundled stdio JSON-RPC server so Claude, Codex, or any agent can cut silences, caption, apply effects, and export.',
      icon: '🤖',
      color: 'border-purple/30 bg-[rgba(191,90,242,0.1)] text-purple',
    },
  ]

  return (
    <section className="py-12 bg-bg-alt border-y border-border-soft relative z-1">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold uppercase tracking-[1px] text-accent-bright">
            The Complete Ecosystem
          </span>
          <h2 className="text-2xl font-extrabold tracking-[-0.8px] mt-1">
            Three pillars. One unified video workflow.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-bg-card border border-border rounded-[14px] p-6 hover:border-text-dim transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{item.icon}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.5px] px-2.5 py-1 rounded-full border ${item.color}`}
                >
                  {item.badge}
                </span>
              </div>
              <h3 className="text-base font-bold mb-2">{item.title}</h3>
              <p className="text-xs text-text-muted leading-[1.6]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
