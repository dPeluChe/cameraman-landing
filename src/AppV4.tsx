import { useState } from 'react'

export function AppV4() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'mcp' | 'ios'>('timeline')

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans antialiased selection:bg-[#0066cc] selection:text-white relative">
      {/* Native macOS Menu Bar Simulation Top Container */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#1d1d1f]/80 border-b border-white/10 text-xs">
        <div className="max-w-[1200px] mx-auto px-6 h-[48px] flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold">
            {/* macOS Traffic Lights */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/20" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/20" />
              <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black/20" />
            </div>
            <span className="ml-2 font-bold text-sm tracking-tight text-white flex items-center gap-2">
              <img src="/branding/favicon.png" alt="Logo" className="w-4 h-4 rounded" />
              Cameraman Studio
            </span>
            <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full font-mono">
              Swift Native v0.7.0
            </span>
          </div>

          {/* Version Selector Pills */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10">
            <a href="/" className="px-3 py-1 text-white/60 hover:text-white transition-colors">v1</a>
            <a href="/?v=2" className="px-3 py-1 text-white/60 hover:text-white transition-colors">v2</a>
            <a href="/?v=3" className="px-3 py-1 text-white/60 hover:text-white transition-colors">v3</a>
            <a href="/?v=4" className="px-3 py-1 rounded-full bg-[#0066cc] text-white font-bold shadow">
              v4 Native macOS ✨
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/dPeluChe/cameraman"
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white font-medium"
            >
              GitHub
            </a>
            <a
              href="#install"
              className="bg-[#0066cc] hover:bg-[#0077ed] text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
            >
              Download .dmg
            </a>
          </div>
        </div>
      </header>

      {/* Hero: Apple Style Product Showcase */}
      <section className="pt-20 pb-16 text-center max-w-[1000px] mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 mb-6 font-medium">
          <span> Built natively for macOS 13+ Ventura, Sonoma &amp; Sequoia</span>
        </div>

        <h1 className="text-[64px] sm:text-[52px] max-md:text-[36px] font-semibold tracking-[-0.03em] leading-[1.05] text-white mb-6">
          Screen Capture &amp; Editing.<br />
          <span className="text-[#2997ff]">Designed for the Mac.</span>
        </h1>

        <p className="text-[21px] max-md:text-[17px] text-[#86868b] max-w-[640px] mx-auto mb-10 leading-[1.47] font-normal tracking-[-0.01em]">
          Swift native. Local-first. Multi-track. Powered by a built-in MCP server for automated AI editing with zero cloud subscription.
        </p>

        <div className="flex justify-center items-center gap-4 mb-16">
          <a
            href="#install"
            className="bg-[#0066cc] hover:bg-[#0077ed] text-white text-base font-semibold px-7 py-3.5 rounded-xl shadow-lg transition-all"
          >
            Download Free for macOS
          </a>
          <a
            href="#github"
            className="bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white text-base font-semibold px-7 py-3.5 rounded-xl border border-white/10 transition-all"
          >
            View Source Code
          </a>
        </div>

        {/* macOS Native Window Frame Container */}
        <div className="rounded-[18px] bg-[#1e1e1e] border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.8)] text-left overflow-hidden">
          {/* macOS Window Header Bar */}
          <div className="bg-[#2b2b2b] px-4 py-2.5 flex items-center justify-between border-b border-black/40">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs text-[#a1a1a6] font-medium ml-2">Cameraman.app — MyProject.cameramanproject</span>
            </div>

            {/* Segmented Control in Native macOS Toolbar style */}
            <div className="flex bg-[#181818] p-0.5 rounded-md border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1 rounded-[5px] font-medium transition-all ${
                  activeTab === 'timeline' ? 'bg-[#3a3a3c] text-white shadow-sm' : 'text-[#a1a1a6] hover:text-white'
                }`}
              >
                Timeline NLE
              </button>
              <button
                onClick={() => setActiveTab('mcp')}
                className={`px-3 py-1 rounded-[5px] font-medium transition-all ${
                  activeTab === 'mcp' ? 'bg-[#3a3a3c] text-white shadow-sm' : 'text-[#a1a1a6] hover:text-white'
                }`}
              >
                MCP Server (43 Tools)
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`px-3 py-1 rounded-[5px] font-medium transition-all ${
                  activeTab === 'ios' ? 'bg-[#3a3a3c] text-white shadow-sm' : 'text-[#a1a1a6] hover:text-white'
                }`}
              >
                iOS Takes Scribe
              </button>
            </div>
          </div>

          {/* Window Content Area */}
          {activeTab === 'timeline' && (
            <div className="p-4 bg-[#141414] font-sans">
              <div className="grid grid-cols-[200px_1fr] gap-3 aspect-[16/9] bg-[#000] rounded-lg border border-white/10 overflow-hidden">
                {/* Sidebar */}
                <div className="bg-[#1c1c1e] p-3 text-xs space-y-3 border-r border-white/10">
                  <div className="text-[10px] uppercase font-bold text-[#86868b] tracking-wider">Tracks</div>
                  <div className="bg-[#2c2c2e] p-2 rounded text-white font-medium flex items-center justify-between">
                    <span>🖥️ Display 4K</span>
                    <span className="text-[9px] bg-[#0066cc] px-1.5 py-0.5 rounded">Main</span>
                  </div>
                  <div className="bg-[#2c2c2e] p-2 rounded text-[#a1a1a6] flex items-center justify-between">
                    <span>📷 FaceTime HD</span>
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded">Circle</span>
                  </div>
                  <div className="bg-[#2c2c2e] p-2 rounded text-[#a1a1a6] flex items-center justify-between">
                    <span>🎙️ Audio Tracks</span>
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Dual</span>
                  </div>
                </div>

                {/* Viewport & Timeline */}
                <div className="flex flex-col justify-between p-4 bg-[#0a0a0a] relative">
                  <div className="flex-1 flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎬</div>
                      <div className="text-xs text-[#86868b]">ScreenCaptureKit Engine Active</div>
                    </div>
                    {/* Circle PiP Overlay */}
                    <div className="absolute bottom-2 right-2 w-16 h-16 rounded-full border-2 border-white/40 bg-gradient-to-tr from-blue-600 to-purple-600 shadow-xl flex items-center justify-center text-[10px] font-bold">
                      PiP Cam
                    </div>
                  </div>
                  {/* Timeline Bar */}
                  <div className="h-8 bg-[#1c1c1e] rounded border border-white/10 flex items-center px-3 justify-between text-xs text-[#86868b]">
                    <span>00:00:12.04</span>
                    <div className="flex-1 mx-4 h-3 bg-blue-500/20 rounded overflow-hidden relative">
                      <div className="w-1/2 h-full bg-[#0066cc]" />
                    </div>
                    <span>30 FPS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mcp' && (
            <div className="p-6 bg-[#000] font-mono text-xs text-[#f5f5f7] leading-relaxed aspect-[16/9] overflow-y-auto">
              <div className="text-[#86868b] border-b border-white/10 pb-2 mb-3">
                // cameraman-mcp stdio server connection active
              </div>
              <div className="space-y-2">
                <p className="text-[#2997ff]">&gt; REGISTERED_TOOLS: 43 Available</p>
                <p className="text-white/80">&gt; claude-code: call_tool("cameraman_split_clip", &#123; clip_id: "clip_01", time: 4.5 &#125;)</p>
                <p className="text-green-400">✓ Non-destructive split applied to track_video_01.</p>
                <p className="text-white/80">&gt; claude-code: call_tool("cameraman_export_project", &#123; preset: "4k_hevc" &#125;)</p>
                <p className="text-green-400">✓ Export completed: /Exports/MyProject_4K.mp4</p>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="p-6 bg-[#000] aspect-[16/9] flex items-center justify-center">
              <div className="text-center max-w-[400px]">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-lg font-semibold text-white mb-1">Cameraman Mobile Takes</h3>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Record dual-camera takes on your iPhone, map GPS telemetry, and transfer projects losslessly to your Mac.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grid of macOS Native Capabilities */}
      <section className="py-20 bg-[#161617] border-t border-white/10">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center text-white mb-12 tracking-tight">
            Built from the ground up for macOS.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-white mb-2">Swift 5.9 Native</h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Zero web wrappers or Electron bloat. 100% pure Swift, SwiftUI, and ScreenCaptureKit for instant response.
              </p>
            </div>

            <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-white mb-2">Local-First Architecture</h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Your recordings and source assets never leave your Mac. Non-destructive project.json editing model.
              </p>
            </div>

            <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI MCP Integration</h3>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Connect Claude, Codex, or local LLMs to manage timelines, cut silences, and render exports automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-[#86868b] border-t border-white/10">
        © 2026 Cameraman · Designed natively for macOS · Open Source MIT
      </footer>
    </div>
  )
}
