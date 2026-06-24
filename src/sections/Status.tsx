export function Status() {
  return (
    <section id="status" className="py-[90px] bg-bg-alt relative z-1">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="bg-bg-card border border-border rounded-[14px] p-9">
          <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.5px] bg-[rgba(255,159,10,0.12)] text-orange border border-[rgba(255,159,10,0.25)] mb-4.5">
            Beta · v0.7.0
          </span>
          <h2 className="text-[26px] font-extrabold tracking-[-1.5px]">
            Project Status
          </h2>
          <p className="text-text-muted mt-2.5 max-w-[640px] leading-[1.6]">
            Core recording, multi-track editing, effects, auto-zoom,
            transcription, export, and the MCP server are all functional and
            shipping. Actively developed — some rough edges remain in the overlay
            inspector and zoom animation tuning. See the{' '}
            <a
              href="https://github.com/dPeluChe/cameraman/blob/main/docs/CHANGELOG.md"
              className="text-accent-bright"
            >
              changelog
            </a>{' '}
            and{' '}
            <a
              href="https://github.com/dPeluChe/cameraman/blob/main/docs/TASK_TODO.md"
              className="text-accent-bright"
            >
              backlog
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
