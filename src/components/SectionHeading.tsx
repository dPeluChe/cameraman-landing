import { Reveal } from './Reveal'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  subtitle?: string
  center?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
}: SectionHeadingProps) {
  return (
    <div className={center ? 'text-center' : ''}>
      <Reveal>
        <div className="text-[12px] font-bold uppercase tracking-[1px] text-accent-bright mb-3">
          {eyebrow}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h2
          className="text-[40px] font-extrabold tracking-[-1.5px] leading-[1.1] mb-3.5 max-md:text-[30px]"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </Reveal>
      {subtitle && (
        <Reveal delay={0.2}>
          <p
            className={`text-[17px] text-text-muted mb-13 max-w-[620px] leading-[1.5] ${
              center ? 'mx-auto' : ''
            }`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  )
}
