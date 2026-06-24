type Cell = { text: string; kind?: 'yes' | 'no' | 'price' | 'highlight' }

const rows: { feature: string; cells: Cell[] }[] = [
  { feature: 'Price', cells: [{ text: 'Free', kind: 'yes' }, { text: '$89', kind: 'price' }, { text: 'Free', kind: 'yes' }, { text: 'Free', kind: 'yes' }] },
  { feature: 'Open source', cells: [{ text: 'Yes', kind: 'yes' }, { text: 'No', kind: 'no' }, { text: 'Yes', kind: 'yes' }, { text: 'Yes', kind: 'yes' }] },
  { feature: 'Timeline editor', cells: [{ text: 'Multi-track', kind: 'yes' }, { text: 'Yes', kind: 'yes' }, { text: 'No', kind: 'no' }, { text: 'No', kind: 'no' }] },
  { feature: 'AI agent editing (MCP)', cells: [{ text: '42 tools', kind: 'yes' }, { text: 'No', kind: 'no' }, { text: 'No', kind: 'no' }, { text: 'No', kind: 'no' }] },
  { feature: 'Auto-zoom', cells: [{ text: 'Telemetry-based', kind: 'yes' }, { text: 'Manual keyframes' }, { text: 'No', kind: 'no' }, { text: 'No', kind: 'no' }] },
  { feature: 'On-device transcription', cells: [{ text: 'WhisperKit', kind: 'yes' }, { text: 'No', kind: 'no' }, { text: 'No', kind: 'no' }, { text: 'No', kind: 'no' }] },
  { feature: 'Camera PiP', cells: [{ text: 'Per-segment', kind: 'yes' }, { text: 'Global', kind: 'yes' }, { text: 'No', kind: 'no' }, { text: 'No', kind: 'no' }] },
  { feature: 'Clip effects (sepia, blur…)', cells: [{ text: 'Per-layer', kind: 'yes' }, { text: 'Yes', kind: 'yes' }, { text: 'No', kind: 'no' }, { text: 'No', kind: 'no' }] },
  { feature: 'GIF export', cells: [{ text: 'Yes', kind: 'yes' }, { text: 'Yes', kind: 'yes' }, { text: 'Yes', kind: 'yes' }, { text: 'No', kind: 'no' }] },
  { feature: '4K export', cells: [{ text: 'Yes', kind: 'yes' }, { text: 'Yes', kind: 'yes' }, { text: 'No', kind: 'no' }, { text: 'Yes', kind: 'yes' }] },
  { feature: 'Local-first', cells: [{ text: 'Yes', kind: 'yes' }, { text: 'Yes', kind: 'yes' }, { text: 'Yes', kind: 'yes' }, { text: 'Yes', kind: 'yes' }] },
]

const cols = ['Cameraman', 'Screen Studio', 'Kap', 'OBS']

const cellClass = (kind?: Cell['kind']) =>
  kind === 'yes'
    ? 'text-green'
    : kind === 'no'
      ? 'text-text-dim'
      : kind === 'price'
        ? 'text-orange font-bold'
        : 'text-text'

export function Comparison() {
  return (
    <section id="comparison" className="py-[90px] bg-bg-alt relative z-1">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="text-[12px] font-bold uppercase tracking-[1px] text-accent-bright mb-3">
          How it compares
        </div>
        <h2 className="text-[40px] font-extrabold tracking-[-1.5px] leading-[1.1] mb-3.5 max-md:text-[30px]">
          Honest comparison.
        </h2>
        <p className="text-[17px] text-text-muted mb-13 max-w-[620px]">
          Against tools you might already know.
        </p>
        <div className="overflow-x-auto rounded-[14px] border border-border">
          <table className="w-full border-collapse text-sm min-w-[560px]">
            <thead>
              <tr className="bg-bg-card">
                <th className="text-left p-[14px_18px] font-bold text-[13px] text-text-muted uppercase tracking-[0.5px] border-b border-border">
                  Feature
                </th>
                {cols.map((c, i) => (
                  <th
                    key={c}
                    className={`text-left p-[14px_18px] font-bold text-[13px] text-text-muted uppercase tracking-[0.5px] border-b border-border ${
                      i === 0 ? 'bg-accent-soft' : ''
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.feature}
                  className="hover:bg-white/[0.015] transition-colors"
                >
                  <td className="p-[14px_18px] font-semibold text-text border-b border-border-soft">
                    {row.feature}
                  </td>
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={`p-[14px_18px] border-b border-border-soft ${cellClass(cell.kind)} ${
                        i === 0 ? 'bg-accent-soft hover:bg-[rgba(10,132,255,0.1)]' : ''
                      }`}
                    >
                      {cell.text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
