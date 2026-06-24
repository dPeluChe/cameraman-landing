const features = [
  { icon: '\u23FA', title: 'Multi-Track Recording', body: 'Screen, camera, system audio, and mic captured simultaneously as separate tracks via ScreenCaptureKit.' },
  { icon: '\u2702\uFE0F', title: 'Multi-Track Timeline', body: 'Trim, split, delete, drag-and-drop. Typed tracks for screen, B-roll video, images, audio, and color clips.' },
  { icon: '\u23E9', title: 'Per-Segment Speed', body: '0.25× to 4× speed per segment. Speed badges visible right on the timeline.' },
  { icon: '\u{1F4F7}', title: 'Camera PiP', body: 'Circle, rounded rect, capsule masks. Color border. Position per segment. Drag to place anywhere.' },
  { icon: '\u{1F509}', title: 'Per-Track Audio', body: 'Independent volume (0–300%) and mute per track and per clip. Global track volume sliders in preview and export.' },
  { icon: '\u{1F50D}', title: 'Auto-Zoom', body: 'Cursor telemetry detects clicks and dwell pauses. Zoom suggestions appear automatically. Click to dismiss.' },
  { icon: '\u{1F3A8}', title: 'Clip Effects', body: 'Sepia, B&W, brightness, contrast, blur, vignette — targetable to screen, camera, or background. Audio pitch shift too.' },
  { icon: '\u{1F4DD}', title: 'Overlays', body: 'Arrows, rectangles, lines, text with draw-on and fade-in. Drag in timeline. Full popover inspector for style.' },
  { icon: '\u{1F4AC}', title: 'On-Device Transcription', body: 'WhisperKit speech-to-text on Apple Silicon. Generates SRT/VTT captions. Model picker from base to large.' },
  { icon: '\u{1F9E0}', title: 'Local Intelligence', body: 'Silence detection and chapter suggestions run on-device. One call from an agent and your edit is structured.' },
  { icon: '\u{1F4E4}', title: 'Export Presets', body: 'Web 1080p H.264, HEVC, 4K 60fps, Portrait, Animated GIF. Live size estimate. Per-segment effects preserved.' },
  { icon: '\u{1F4BE}', title: 'Non-Destructive', body: 'All edits live in project.json. Source files are never modified. Autosave with undo/redo. Portable bundles.' },
]

export function Features() {
  return (
    <section id="features" className="py-[90px] bg-bg-alt relative z-1">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="text-[12px] font-bold uppercase tracking-[1px] text-accent-bright mb-3">
          Features
        </div>
        <h2 className="text-[40px] font-extrabold tracking-[-1.5px] leading-[1.1] mb-3.5 max-md:text-[30px]">
          What&apos;s built and working.
        </h2>
        <p className="text-[17px] text-text-muted mb-13 max-w-[620px]">
          Not a roadmap. These ship in the current beta.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-3.5">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3.5 p-[18px] rounded-[10px] bg-bg-card border border-border transition-colors hover:border-text-dim"
            >
              <div className="flex-shrink-0 w-[38px] h-[38px] flex items-center justify-center rounded-[9px] bg-accent-soft text-accent-bright text-[17px]">
                {f.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold mb-0.5">{f.title}</h4>
                <p className="text-[13px] text-text-muted leading-[1.5]">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
