import { IconArrowUpRight, IconQuote } from '@tabler/icons-react'
import { FC } from 'react'
import { Link } from 'react-router-dom'

import type { PersonaContent } from '@/content/public'

interface PersonaPageTemplateProps {
  persona: PersonaContent
}

const CTAButton: FC<{ href: string; label: string; variant?: 'primary' | 'secondary' }> = ({
  href,
  label,
  variant = 'primary'
}) => {
  const isInternal = href.startsWith('/')
  const className =
    variant === 'primary'
      ? 'bg-primary text-primary-light inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:bg-opacity-85'
      : 'text-primary inline-flex items-center gap-2 rounded-full border border-input px-6 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary'

  if (isInternal) {
    return (
      <Link to={href} className={className}>
        {label}
        <IconArrowUpRight className="h-4 w-4" />
      </Link>
    )
  }

  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {label}
      <IconArrowUpRight className="h-4 w-4" />
    </a>
  )
}

export const PersonaPageTemplate: FC<PersonaPageTemplateProps> = ({ persona }) => {
  return (
    <div className="space-y-16">
      <section className="rounded-3xl border border-input/60 bg-background/70 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{persona.subtitle}</p>
        <h1 className="mt-3 text-4xl font-semibold">{persona.title}</h1>
        <p className="text-secondary mt-4 text-lg leading-relaxed">{persona.description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <CTAButton href={persona.primaryCta.href} label={persona.primaryCta.label} />
          <CTAButton href={persona.secondaryCta.href} label={persona.secondaryCta.label} variant="secondary" />
        </div>
        <div className="mt-8 grid gap-4 border-t border-input/60 pt-6 sm:grid-cols-3">
          {persona.stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-semibold">{stat.value}</div>
              <p className="text-secondary mt-1 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-input/60 bg-background/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">What they need</p>
          <ul className="mt-4 list-disc space-y-2 pl-4 text-sm leading-relaxed text-secondary">
            {persona.needs.map((need) => (
              <li key={need}>{need}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-input/60 bg-background/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Integrations they rely on</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {persona.integrations.map((integration) => (
              <span
                key={integration}
                className="border-input/60 rounded-full border px-3 py-1 text-xs font-semibold text-secondary"
              >
                {integration}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {persona.highlights.map((highlight) => (
          <div key={highlight.title} className="rounded-3xl border border-input/60 bg-background/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Playbook</p>
            <h3 className="mt-2 text-2xl font-semibold">{highlight.title}</h3>
            <p className="text-secondary mt-2">{highlight.body}</p>
            <ul className="text-secondary mt-4 space-y-2 text-sm">
              {highlight.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-input/60 bg-background/70 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Templates</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {persona.templates.map((template) => (
            <div key={template.name} className="rounded-2xl border border-input/60 bg-background/80 p-4">
              <h4 className="text-lg font-semibold">{template.name}</h4>
              <p className="text-secondary mt-2 text-sm">{template.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-primary bg-primary px-6 py-10 text-primary-light sm:px-12">
        <IconQuote className="h-8 w-8 text-primary-light/70" />
        <p className="mt-4 text-2xl font-semibold leading-relaxed">{persona.testimonial.quote}</p>
        <p className="text-primary-light/80 mt-4 text-sm font-semibold uppercase tracking-wide">
          {persona.testimonial.author} · {persona.testimonial.role}, {persona.testimonial.company}
        </p>
      </section>
    </div>
  )
}

export default PersonaPageTemplate
