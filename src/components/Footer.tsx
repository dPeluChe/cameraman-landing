const links = [
  { href: 'https://github.com/dPeluChe/cameraman', label: 'GitHub' },
  { href: 'https://github.com/dPeluChe/cameraman/blob/main/docs/CHANGELOG.md', label: 'Changelog' },
  { href: 'https://github.com/dPeluChe/cameraman/blob/main/CONTRIBUTING.md', label: 'Contributing' },
  { href: 'https://github.com/dPeluChe/cameraman/blob/main/docs/PRIVACY_POLICY.md', label: 'Privacy' },
]

export function Footer() {
  return (
    <footer className="border-t border-border-soft pt-12 pb-12 text-center">
      <div className="max-w-[1120px] mx-auto px-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2.5 font-bold">
          <img src="/branding/favicon.png" alt="Cameraman logo" className="w-7 h-7 rounded-[7px]" />
          cameraman
        </div>
        <div className="flex gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-text-muted hover:text-text text-sm no-underline transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="text-sm text-text-dim">
          Built with code &amp; caffeine by{' '}
          <a
            href="https://github.com/dPeluChe"
            className="text-text-muted no-underline hover:text-text"
          >
            dPeluChe
          </a>{' '}
          · MIT License · © 2026
        </p>
      </div>
    </footer>
  )
}
