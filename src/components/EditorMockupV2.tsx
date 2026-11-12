import { useState } from 'react'

export function EditorMockupV2() {
  const [activeTab, setActiveTab] = useState<'editor' | 'mcp'>('editor')
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="mt-8 bg-[#121216] border border-border rounded-[20px] p-3 shadow-[0_40px_100px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)] text-left overflow-hidden">
      {/* Title bar with tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs text-text-muted font-semibold">Cameraman Studio Pro</span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-bg-card p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab('editor')}
            className={`text-[11px] font-bold px-3 py-1 rounded-md transition-all ${
              activeTab === 'editor'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            🎬 Timeline Editor
          </button>
          <button
            onClick={() => setActiveTab('mcp')}
            className={`text-[11px] font-bold px-3 py-1 rounded-md transition-all ${
              activeTab === 'mcp'
                ? 'bg-purple text-white shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            🤖 MCP Live Stream
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        /* Video Editor Interface */
        <div className="grid grid-cols-[220px_1fr] gap-px bg-border-soft rounded-[12px] overflow-hidden mt-2 max-md:grid-cols-1">
          {/* Left Panel: Track inspector */}
          <div className="bg-[#16161c] p-4 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[1px] text-accent-bright mb-3">
                Tracks &amp; Layers
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-accent-soft/40 border border-accent-bright/30 flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2">🖥️ Screen (4K)</span>
                  <span className="text-[9px] bg-accent text-white px-1.5 py-0.5 rounded">Primary</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-elev border border-border flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-2">📷 Camera PiP</span>
                  <span className="text-[9px] bg-green/20 text-green px-1.5 py-0.5 rounded">Circle</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-elev border border-border flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-2">🎙️ Mic + System</span>
                  <span className="text-[9px] bg-purple/20 text-purple px-1.5 py-0.5 rounded">Dual</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-soft">
              <div className="text-[10px] font-bold uppercase tracking-[1px] text-text-dim mb-2">
                Auto-Zoom Engine
              </div>
              <div className="p-2 rounded bg-bg-elev text-[11px] text-text-muted flex justify-between items-center">
                <span>Click Telemetry:</span>
                <span className="text-green font-mono font-bold">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Main Viewport & Timeline */}
          <div className="flex flex-col bg-[#0a0a0c]">
            {/* Viewport */}
            <div className="relative aspect-video bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] flex items-center justify-center overflow-hidden p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-accent/20 border border-accent-bright flex items-center justify-center text-2xl">
                  {isPlaying ? '⏸️' : '▶️'}
                </div>
                <span className="text-xs font-mono text-white/70 bg-black/50 px-3 py-1 rounded-full">
                  00:04.12 / 00:30.00
                </span>
              </div>

              {/* Camera PiP */}
              <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full border-2 border-white/30 bg-gradient-to-tr from-orange to-pink flex items-center justify-center font-bold text-xs text-white shadow-xl">
                REC
              </div>

              {/* Floating Auto-Zoom indicator */}
              <div className="absolute top-6 left-6 bg-purple/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-md">
                🔍 Auto-Zoom 1.4× at Cursor Click
              </div>
            </div>

            {/* Timeline track */}
            <div className="p-3 bg-[#141418] border-t border-border-soft">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-xs font-bold text-accent-bright bg-accent-soft px-3 py-1 rounded hover:bg-accent hover:text-white transition-colors"
                >
                  {isPlaying ? 'Pause' : 'Play Preview'}
                </button>
                <span className="text-[10px] text-text-dim font-mono">1080p H.264 60FPS</span>
              </div>
              <div className="h-6 rounded bg-accent/20 border border-accent/40 relative overflow-hidden flex items-center px-2">
                <div className="w-1/3 h-full bg-accent/40 border-r border-accent-bright flex items-center px-2 text-[9px] font-bold text-white">
                  Segment A
                </div>
                <div className="w-1/3 h-full bg-purple/40 border-r border-purple flex items-center px-2 text-[9px] font-bold text-white">
                  Silence Trimmed (AI)
                </div>
                <div className="w-1/3 h-full bg-green/40 flex items-center px-2 text-[9px] font-bold text-white">
                  Segment B
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MCP Terminal View */
        <div className="p-6 bg-[#0d0d11] font-mono text-xs text-text leading-[1.8] rounded-[12px] mt-2 min-h-[320px]">
          <div className="text-text-dim mb-4 border-b border-border-soft pb-2">
            // Connected to cameraman-mcp (stdio JSON-RPC server)
          </div>
          <div className="space-y-3">
            <div className="text-accent-bright">
              &gt; JSON-RPC Call: <span className="text-white">cameraman_suggest_silence_edits({'{ project_id: "demo" }'})</span>
            </div>
            <div className="text-green pl-4">
              ✓ Found 3 silence gaps (&gt; 1.2s threshold). Applying non-destructive cuts...
            </div>
            <div className="text-purple">
              &gt; JSON-RPC Call: <span className="text-white">cameraman_export_project({'{ preset: "web_1080p" }'})</span>
            </div>
            <div className="text-text-muted pl-4">
              ⏳ Job queued (jobId: <span className="text-green">job_8a92f</span>). Polling status...
            </div>
            <div className="text-green pl-4 font-bold">
              ✓ Render Complete! Saved to /Exports/demo_web1080p.mp4 (4.2 MB)
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
