import { motion } from 'framer-motion'
import { SectionBackground } from '../components/SectionBackground'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal, Stagger, StaggerItem } from '../components/Reveal'
import { FeatureImage } from '../components/FeatureImage'

interface Feature {
  icon: string
  title: string
  body: string
  /** bento col/row span classes */
  span?: string
  /** screenshot slot */
  imageLabel?: string
  imageGradient?: string
  imageIcon?: string
  imageSrc?: string
}

const features: Feature[] = [
  {
    icon: '\u23FA',
    title: 'Multi-Track Recording',
    body: 'Screen, camera, system audio, and mic captured simultaneously as separate tracks via ScreenCaptureKit. Each track is independent — mute, trim, or adjust without touching the others.',
    span: 'md:col-span-2',
    imageLabel: 'Recording Sources',
    imageGradient: 'blue',
    imageIcon: '\u{1F4F9}',
  },
  {
    icon: '\u2702\uFE0F',
    title: 'Multi-Track Timeline',
    body: 'Trim, split, delete, drag-and-drop. Typed tracks for screen, B-roll video, images, audio, and color clips.',
    imageLabel: 'Timeline Editor',
    imageGradient: 'dark',
    imageIcon: '\u{1F4CA}',
  },
  {
    icon: '\u23E9',
    title: 'Per-Segment Speed',
    body: '0.25× to 4× per segment with visible badges on the timeline.',
    imageLabel: 'Speed Control',
    imageGradient: 'orange',
    imageIcon: '\u26A1',
  },
  {
    icon: '\u{1F4F7}',
    title: 'Camera PiP',
    body: 'Circle, rounded rect, capsule masks. Color border. Position per segment. Drag to place anywhere on the canvas.',
    span: 'md:col-span-2',
    imageLabel: 'Camera PiP Styles',
    imageGradient: 'orange',
    imageIcon: '\u{1F4F7}',
  },
  {
    icon: '\u{1F509}',
    title: 'Per-Track Audio',
    body: 'Independent volume (0–300%) and mute per track and per clip. Global sliders in preview and export.',
    imageLabel: 'Audio Mixer',
    imageGradient: 'green',
    imageIcon: '\u{1F3A7}',
  },
  {
    icon: '\u{1F50D}',
    title: 'Auto-Zoom',
    body: 'Cursor telemetry detects clicks and dwell pauses. Zoom suggestions appear automatically — no manual keyframing. Click to dismiss or accept.',
    span: 'md:col-span-2',
    imageLabel: 'Auto-Zoom Detection',
    imageGradient: 'purple',
    imageIcon: '\u{1F50D}',
  },
  {
    icon: '\u{1F3A8}',
    title: 'Clip Effects',
    body: 'Sepia, B&W, brightness, contrast, blur, vignette — targetable to screen, camera, or background layer. Audio pitch shift too.',
    imageLabel: 'Effects Panel',
    imageGradient: 'purple',
    imageIcon: '\u{1F3A8}',
  },
  {
    icon: '\u{1F4DD}',
    title: 'Overlays',
    body: 'Arrows, rectangles, lines, text with draw-on and fade-in animations. Full popover inspector for style, color, rotation.',
    imageLabel: 'Overlay Tools',
    imageGradient: 'blue',
    imageIcon: '\u{1F4DD}',
  },
  {
    icon: '\u{1F4AC}',
    title: 'On-Device Transcription',
    body: 'WhisperKit speech-to-text on Apple Silicon. Generates SRT/VTT captions. Model picker from base to large. All offline.',
    span: 'md:col-span-2',
    imageLabel: 'Transcription + Captions',
    imageGradient: 'green',
    imageIcon: '\u{1F4AC}',
  },
  {
    icon: '\u{1F9E0}',
    title: 'Local Intelligence',
    body: 'Silence detection and chapter suggestions run on-device.',
    imageLabel: 'AI Suggestions',
    imageGradient: 'dark',
    imageIcon: '\u{1F9E0}',
  },
  {
    icon: '\u{1F4E4}',
    title: 'Export Presets',
    body: 'Web 1080p H.264, HEVC, 4K 60fps, Portrait, Animated GIF. Live size estimate. Per-segment effects preserved.',
    imageLabel: 'Export Dialog',
    imageGradient: 'blue',
    imageIcon: '\u{1F4E4}',
  },
  {
    icon: '\u{1F4BE}',
    title: 'Non-Destructive',
    body: 'All edits live in project.json. Source files never modified. Autosave with undo/redo. Portable .cameramanproject bundles.',
    imageLabel: 'Project Bundle',
    imageGradient: 'dark',
    imageIcon: '\u{1F4BE}',
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="relative py-[100px] bg-bg-alt z-1 overflow-hidden"
    >
      <SectionBackground variant="dots" />
      <SectionBackground variant="mesh" />

      <div className="relative max-w-[1120px] mx-auto px-6">
        <SectionHeading
          eyebrow="Features"
          title="What&apos;s built and working."
          subtitle="Not a roadmap. These ship in the current beta — each with a screenshot slot ready for real captures."
        />

        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]">
          {features.map((f) => (
            <StaggerItem
              key={f.title}
              className={f.span ?? ''}
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-bg-card border border-border rounded-[14px] overflow-hidden flex flex-col group hover:border-text-dim transition-colors"
              >
                {/* Image slot */}
                {f.imageLabel && (
                  <div className="h-[140px] flex-shrink-0 border-b border-border-soft">
                    <FeatureImage
                      label={f.imageLabel}
                      gradient={f.imageGradient}
                      icon={f.imageIcon}
                      src={f.imageSrc}
                    />
                  </div>
                )}
                {/* Content */}
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-accent-soft text-accent-bright text-[15px] flex-shrink-0">
                      {f.icon}
                    </div>
                    <h4 className="text-[15px] font-bold">{f.title}</h4>
                  </div>
                  <p className="text-[13px] text-text-muted leading-[1.55]">
                    {f.body}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.3}>
          <p className="text-center text-text-dim text-sm mt-8">
            Screenshots coming soon — placeholders above will be replaced with
            real captures from the app.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
