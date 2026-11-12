import { useState } from 'react'

export function AppV3() {
  const [activeTab, setActiveTab] = useState<'mac' | 'ios' | 'ai'>('mac')

  return (
    <div className="min-h-screen bg-[#060608] text-[#f4f4f7] font-sans selection:bg-accent-soft selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(10,132,255,0.18)_0%,rgba(191,90,242,0.08)_40%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-200px] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,55,95,0.08)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060608]/80 border-b border-white/[0.08]">
        <div className="max-w-[1240px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-purple p-[1px] shadow-lg">
              <div className="w-full h-full bg-[#060608] rounded-[11px] flex items-center justify-center">
                <img src="/branding/favicon.png" alt="Logo" className="w-5 h-5 rounded" />
              </div>
            </div>
            <span className="text-lg font-extrabold tracking-tight">CAMERAMAN</span>
          </div>

          {/* Three-Way Navigation Switcher */}
          <div className="flex items-center gap-1 bg-[#121218] p-1.5 rounded-full border border-white/[0.08]">
            <a
              href="/"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full text-text-muted hover:text-white transition-colors"
            >
              v1 Base
            </a>
            <a
              href="/?v=2"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full text-text-muted hover:text-white transition-colors"
            >
              v2 Refined
            </a>
            <a
              href="/?v=3"
              className="text-xs font-bold px-4 py-1.5 rounded-full bg-gradient-to-r from-accent via-purple to-pink text-white shadow-md"
            >
              v3 Bold Studio ✨
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/dPeluChe/cameraman"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-white/80 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] px-4 py-2 rounded-full border border-white/[0.1] transition-all"
            >
              GitHub ↗
            </a>
            <a
              href="#download"
              className="text-xs font-bold text-white bg-accent hover:bg-accent-bright px-5 py-2 rounded-full shadow-[0_4px_20px_rgba(10,132,255,0.4)] transition-all"
            >
              Get Beta v0.7.0
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero Section: Bold Asymmetric Layout */}
      <section className="pt-16 pb-24 relative z-10">
        <div className="max-w-[1240px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_560px] gap-12 items-center">
          
          {/* Left Column: Bold Typography */}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple/10 border border-purple/30 text-xs font-bold text-purple mb-6">
              <span className="w-2 h-2 rounded-full bg-purple animate-ping" />
              Next-Gen Screen Recording &amp; AI NLE
            </div>

            <h1 className="text-[72px] sm:text-[60px] max-md:text-[42px] font-black tracking-[-3.5px] leading-[0.98] mb-6 text-white">
              Studio Power.<br />
              <span className="bg-gradient-to-r from-accent via-purple to-pink bg-clip-text text-transparent">
                Zero Cloud.
              </span>
            </h1>

            <p className="text-xl text-text-muted max-w-[540px] mb-10 leading-[1.6] font-normal">
              The Swift-native screen capture and multi-track editor for macOS with a built-in <strong>43-tool MCP server</strong>. Automate your cuts with local AI.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap mb-12">
              <a
                href="#download"
                className="text-base font-bold text-white bg-gradient-to-r from-accent to-purple hover:opacity-90 px-8 py-4 rounded-2xl shadow-[0_10px_35px_rgba(10,132,255,0.4)] transition-all transform hover:-translate-y-0.5"
              >
                Download for macOS 13+
              </a>
              <a
                href="#demo"
                className="text-base font-semibold text-white/90 bg-[#121218] hover:bg-[#1a1a24] border border-white/10 px-7 py-4 rounded-2xl transition-all"
              >
                Watch 1-Min Demo ➔
              </a>
            </div>

            {/* Micro Stats Bar */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.08] max-w-[500px]">
              <div>
                <div className="text-2xl font-black text-white">48.8K</div>
                <div className="text-xs text-text-dim uppercase tracking-wider font-semibold">Swift LOC</div>
              </div>
              <div>
                <div className="text-2xl font-black text-accent-bright">43 Tools</div>
                <div className="text-xs text-text-dim uppercase tracking-wider font-semibold">MCP Server</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green">100% Free</div>
                <div className="text-xs text-text-dim uppercase tracking-wider font-semibold">Open Source</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Studio Showcase Card */}
          <div className="bg-[#0e0e14] border border-white/[0.12] rounded-[32px] p-6 shadow-[0_50px_120px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] relative overflow-hidden">
            
            {/* Tab Controls */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <span className="text-xs font-bold uppercase tracking-widest text-text-dim">
                Studio Feature Switcher
              </span>
              <div className="flex bg-[#161620] p-1 rounded-xl border border-white/[0.08]">
                <button
                  onClick={() => setActiveTab('mac')}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === 'mac'
                      ? 'bg-accent text-white shadow'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  🖥️ macOS App
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === 'ios'
                      ? 'bg-green text-black font-extrabold shadow'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  📱 iOS Takes
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === 'ai'
                      ? 'bg-purple text-white shadow'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  🤖 MCP AI
                </button>
              </div>
            </div>

            {/* Dynamic Content Display based on Tab */}
            {activeTab === 'mac' && (
              <div className="space-y-4">
                <div className="aspect-[16/10] bg-gradient-to-tr from-[#1a1a2e] via-[#0f172a] to-[#1e1b4b] rounded-2xl border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/80 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                      ScreenCaptureKit 4K
                    </span>
                    <span className="text-xs font-mono font-bold text-green bg-green/10 border border-green/30 px-3 py-1 rounded-full">
                      ● 60 FPS RECORDING
                    </span>
                  </div>

                  <div className="my-auto text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-xl shadow-lg">
                      🎬
                    </div>
                    <div className="text-sm font-bold text-white">Multi-Track NLE Engine</div>
                    <div className="text-xs text-text-muted mt-1">Separate video, audio &amp; camera PiP tracks</div>
                  </div>

                  <div className="h-2 rounded-full bg-accent/30 overflow-hidden relative">
                    <div className="w-2/3 h-full bg-accent animate-pulse" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3.5 rounded-xl bg-[#161620] border border-white/[0.08]">
                    <div className="text-xs font-bold text-accent-bright mb-1">🔍 Smart Auto-Zoom</div>
                    <div className="text-[11px] text-text-muted">Telemetry-based cursor tracking &amp; dwell detection.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#161620] border border-white/[0.08]">
                    <div className="text-xs font-bold text-purple mb-1">🎨 Per-Clip Filters</div>
                    <div className="text-[11px] text-text-muted">Sepia, B&amp;W, blur, vignette &amp; audio pitch adjustments.</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="space-y-4">
                <div className="aspect-[16/10] bg-gradient-to-tr from-[#052e16] to-[#022c22] rounded-2xl border border-green/20 p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="space-y-2 text-left max-w-[240px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green bg-green/20 px-2.5 py-0.5 rounded-full border border-green/30">
                      iOS Companion
                    </span>
                    <h4 className="text-lg font-bold text-white">Dual Cam &amp; EXIF GPS</h4>
                    <p className="text-xs text-green/80">Record on iPhone, arrange sequences, and transfer to Mac.</p>
                  </div>
                  <div className="w-24 h-40 rounded-2xl bg-black border-2 border-white/20 p-2 relative shadow-2xl flex flex-col justify-between">
                    <div className="w-8 h-2 bg-white/20 rounded-full mx-auto" />
                    <div className="text-[9px] font-mono text-green text-center">DUAL REC</div>
                    <div className="w-6 h-6 rounded-full bg-pink mx-auto" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161620] border border-white/[0.08] text-left">
                  <div className="text-xs font-bold text-green mb-1">📍 Map GPS Takes</div>
                  <div className="text-[11px] text-text-muted">Takes are automatically grouped by location and EXIF metadata.</div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="aspect-[16/10] bg-[#09090d] rounded-2xl border border-purple/30 p-5 font-mono text-xs text-left leading-relaxed flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[10px] text-purple font-bold">cameraman-mcp v0.7.0</span>
                    <span className="text-[10px] text-green">43 Tools Active</span>
                  </div>
                  <div className="space-y-2 my-auto">
                    <div className="text-purple">&gt; claude: suggest_silence_edits()</div>
                    <div className="text-white/80 pl-3">↳ 4 silence gaps identified and cut.</div>
                    <div className="text-purple">&gt; claude: export_project(format: "4k_hevc")</div>
                    <div className="text-green pl-3">✓ Exported to /Movies/final_4k.mp4</div>
                  </div>
                  <div className="text-[10px] text-text-dim">// Stdio JSON-RPC protocol</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161620] border border-white/[0.08] text-left">
                  <div className="text-xs font-bold text-purple mb-1">⚡ Instant AI NLE</div>
                  <div className="text-[11px] text-text-muted">Connect Claude Code, Codex, or any MCP client locally.</div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Grid Features Section v3 */}
      <section className="py-24 bg-[#0a0a0f] border-t border-white/[0.08] relative z-10">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
              Engineered for High Performance.
            </h2>
            <p className="text-base text-text-muted">
              Built natively in Swift 5.9+ with ScreenCaptureKit for zero latency and minimal memory footprint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#12121a] border border-white/[0.08] p-8 rounded-3xl text-left hover:border-accent/40 transition-all">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Zero Cloud Dependency</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Everything runs 100% locally on your Mac. No subscriptions, no servers, no data collection.
              </p>
            </div>

            <div className="bg-[#12121a] border border-white/[0.08] p-8 rounded-3xl text-left hover:border-purple/40 transition-all">
              <div className="text-3xl mb-4">🎙️</div>
              <h3 className="text-xl font-bold text-white mb-2">WhisperKit Transcription</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                On-device speech-to-text powered by Apple Silicon. Export clean SRT/VTT subtitles instantly.
              </p>
            </div>

            <div className="bg-[#12121a] border border-white/[0.08] p-8 rounded-3xl text-left hover:border-green/40 transition-all">
              <div className="text-3xl mb-4">🎞️</div>
              <h3 className="text-xl font-bold text-white mb-2">Pro Export Presets</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Export to Web 1080p, HEVC 4K 60fps, Vertical 9:16 for Social, or animated GIFs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.08] text-center text-xs text-text-dim">
        <div className="max-w-[1240px] mx-auto px-6 flex justify-between items-center max-md:flex-col gap-4">
          <div>© 2026 Cameraman · Open Source MIT License</div>
          <div className="flex gap-6">
            <a href="/" className="hover:text-white">v1 Base</a>
            <a href="/?v=2" className="hover:text-white">v2 Refined</a>
            <a href="/?v=3" className="hover:text-white">v3 Bold Studio</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
