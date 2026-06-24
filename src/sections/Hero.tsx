import { motion } from 'framer-motion'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { EditorMockup } from '../components/EditorMockup'

const heroBadges = [
  { label: 'Swift Native', tone: 'blue' as const },
  { label: 'macOS 13+', tone: 'default' as const },
  { label: 'Open Source', tone: 'green' as const },
  { label: 'Free', tone: 'green' as const },
  { label: 'MCP', tone: 'purple' as const },
  { label: 'v0.7.0 Beta', tone: 'orange' as const },
]

export function Hero() {
  return (
    <section className="relative pt-[90px] pb-[70px] text-center z-1">
      <div className="max-w-[1120px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center gap-2 mb-7 flex-wrap"
        >
          {heroBadges.map((b) => (
            <Badge key={b.label} tone={b.tone}>
              {b.label}
            </Badge>
          ))}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-[62px] font-extrabold tracking-[-2.5px] leading-[1.05] mb-5 max-md:text-[38px] max-md:tracking-[-1.5px]"
        >
          <span className="gradient-text">Record. Edit. Export.</span>
          <br />
          <span className="gradient-accent">Let AI do the cuts.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[21px] text-text-muted max-w-[620px] mx-auto mb-9 leading-[1.5] max-md:text-[17px]"
        >
          A local-first screen recorder &amp; editor for macOS — with a built-in
          MCP server so Claude, Codex, or any agent can edit your videos for you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex justify-center gap-3.5 flex-wrap"
        >
          <Button href="#install" variant="primary" size="lg">
            Download for macOS
          </Button>
          <Button href="https://github.com/dPeluChe/cameraman" variant="ghost" size="lg">
            View Source
          </Button>
        </motion.div>

        <EditorMockup />
      </div>
    </section>
  )
}
