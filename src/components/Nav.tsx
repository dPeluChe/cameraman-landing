import { Button } from './Button'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#agents', label: 'AI Agents' },
  { href: '#comparison', label: 'Compare' },
  { href: '#install', label: 'Install' },
]

export function Nav() {
  return (
    <nav className="sticky top-0 z-100 bg-[#0a0a0b] border-b border-border-soft">
      <div className="max-w-[1120px] mx-auto px-6 flex items-center justify-between h-[60px]">
        <div className="flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.4px]">
          <img src="/branding/favicon.png" alt="Cameraman logo" className="w-[26px] h-[26px] rounded-[6px]" />
          cameraman
        </div>
        <div className="flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-text-muted hover:text-text text-sm font-medium transition-colors hidden sm:inline"
            >
              {l.label}
            </a>
          ))}
          <Button href="https://github.com/dPeluChe/cameraman" variant="ghost">
            GitHub
          </Button>
        </div>
      </div>
    </nav>
  )
}
