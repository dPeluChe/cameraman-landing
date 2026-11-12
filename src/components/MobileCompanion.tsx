export function MobileCompanion() {
  const highlights = [
    {
      title: 'Dual Cam / MultiCam PiP',
      desc: 'Record simultaneous front selfie + back ultra-wide lens streams directly on your iPhone.',
      icon: '🎥',
    },
    {
      title: 'GPS Location & EXIF Metadata',
      desc: 'View your recorded takes on an interactive map grouped by date and location.',
      icon: '🗺️',
    },
    {
      title: 'Lossless Mac Sync',
      desc: 'Organize non-destructive sequence cuts and export directly to Cameraman Desktop.',
      icon: '⚡',
    },
  ]

  return (
    <section id="mobile" className="py-[100px] bg-bg-alt border-t border-border-soft relative z-1 overflow-hidden">
      <div className="max-w-[1120px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[1px] text-green border border-green/30 bg-[rgba(48,209,88,0.1)] px-3 py-1 rounded-full">
            iOS Companion App
          </span>
          <h2 className="text-4xl font-extrabold tracking-[-1.5px] mt-4 mb-4">
            Capture on iPhone.<br />Edit on Mac.
          </h2>
          <p className="text-text-muted text-base leading-[1.6] mb-8 max-w-[500px]">
            Cameraman Mobile lets you record high-framerate mobile takes with dual-camera support, organize sequences on the go, and pass raw media directly to your Mac.
          </p>

          <div className="space-y-4">
            {highlights.map((h) => (
              <div key={h.title} className="flex gap-4 p-4 rounded-[12px] bg-bg-card border border-border">
                <span className="text-2xl flex-shrink-0">{h.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-text mb-1">{h.title}</h4>
                  <p className="text-xs text-text-muted leading-[1.5]">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual iPhone Mockup */}
        <div className="flex justify-center">
          <div className="w-[300px] h-[580px] bg-bg-card border-4 border-border rounded-[40px] p-4 relative shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden">
            {/* Notch */}
            <div className="w-32 h-4 bg-border rounded-full mx-auto mb-4" />
            
            {/* Mock Camera Viewfinder */}
            <div className="flex-1 rounded-[24px] bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] relative flex items-center justify-center p-4">
              <span className="text-xs text-white/60 font-mono">4K 60FPS · DUAL CAM</span>
              
              {/* Selfie PiP overlay */}
              <div className="absolute top-3 right-3 w-20 h-28 rounded-[14px] bg-gradient-to-tr from-purple to-pink border-2 border-white/20 flex items-center justify-center shadow-lg">
                <span className="text-[10px] text-white font-semibold">Selfie Cam</span>
              </div>

              {/* GPS Badge */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-[10px] text-white/80 flex items-center gap-1">
                <span>📍</span> San Francisco, CA
              </div>
            </div>

            {/* Bottom Record Bar */}
            <div className="mt-4 flex items-center justify-between px-6">
              <span className="text-[10px] text-text-dim">Takes: 4</span>
              <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-pink" />
              </div>
              <span className="text-[10px] text-text-dim">16:9</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
