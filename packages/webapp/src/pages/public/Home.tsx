import { IconArrowUpRight, IconChecks } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

import {
  homeFeatures,
  homeStats,
  integrationShowcase,
  personaContent,
  templateCollections
} from '@/content/public'

const ctaClass =
  'bg-primary text-primary-light inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition hover:bg-opacity-85'

const secondaryCtaClass =
  'text-primary inline-flex items-center justify-center gap-2 rounded-full border border-input px-6 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary'

const Home = () => {
  return (
    <>
      <section className="text-center">
        <p className="text-primary/60 text-xs font-semibold uppercase tracking-[0.3em]">
          All-in-one form experience platform
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Launch customer-ready forms for every team in record time
        </h1>
        <p className="text-secondary mx-auto mt-5 max-w-3xl text-lg leading-relaxed">
          Give Marketing, Product, Ops, and Success teams a single workspace to design, automate, and
          analyze every form—without sacrificing governance, security, or integrations.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a className={ctaClass} href="/sign-up">
            Start building free
            <IconArrowUpRight className="h-4 w-4" />
          </a>
          <a className={secondaryCtaClass} href="/contact/sales">
            Talk to sales
          </a>
        </div>

        <div className="mt-10 grid gap-4 rounded-2xl border border-input/80 bg-background/50 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {homeStats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-semibold">{stat.value}</div>
              <p className="text-secondary mt-1 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {homeFeatures.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-input/60 bg-background/60 p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Feature</p>
            <h3 className="mt-4 text-2xl font-semibold">{feature.title}</h3>
            <p className="text-secondary mt-3 leading-relaxed">{feature.description}</p>
            <ul className="text-secondary mt-4 space-y-2 text-sm">
              {feature.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <IconChecks className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section id="solutions" className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.3em]">Solutions</p>
            <h2 className="mt-2 text-3xl font-semibold">Purpose-built for every go-to-market team</h2>
            <p className="text-secondary mt-2 max-w-2xl">
              Dedicated personas, templates, and integrations ensure every team can ship forms, collect
              insights, and automate next steps without switching tools.
            </p>
          </div>
          <Link to="/public/templates" className="text-primary text-sm font-semibold">
            Browse all templates →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {personaContent.map((persona) => (
            <Link
              key={persona.id}
              to={`/public/personas/${persona.id}`}
              className="rounded-3xl border border-input/60 bg-gradient-to-br from-background to-background/40 p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
                {persona.subtitle}
              </p>
              <h3 className="mt-3 text-2xl font-semibold">{persona.title}</h3>
              <p className="text-secondary mt-3">{persona.description}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                {persona.needs.slice(0, 2).map((need) => (
                  <span key={need} className="border-input/70 rounded-full border px-3 py-1 text-secondary">
                    {need.split(' ').slice(0, 2).join(' ')}…
                  </span>
                ))}
              </div>
              <p className="text-primary mt-6 inline-flex items-center font-semibold">
                See solution
                <IconArrowUpRight className="ml-1.5 h-4 w-4" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.3em]">Templates</p>
            <h2 className="mt-2 text-3xl font-semibold">Launch from conversion-proven playbooks</h2>
            <p className="text-secondary mt-2 max-w-3xl">
              Templates include brand controls, logic, and recommended automations so every team can launch
              in minutes.
            </p>
          </div>
          <a className={secondaryCtaClass} href="/public/templates">
            View template library
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {templateCollections.map((collection) => (
            <div key={collection.title} className="rounded-3xl border border-input/60 bg-background/70 p-6">
              <h3 className="text-xl font-semibold">{collection.title}</h3>
              <p className="text-secondary mt-2">{collection.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-secondary">
                {collection.templates.map((template) => (
                  <li key={template} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    {template}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.3em]">Integrations</p>
            <h2 className="mt-2 text-3xl font-semibold">Connect to every system that matters</h2>
            <p className="text-secondary mt-2 max-w-3xl">
              Trigger automation via native integrations or use flexible webhooks for custom workflows. Every
              plan includes granular mapping, retries, and alerting.
            </p>
          </div>
          <a className={secondaryCtaClass} href="/public/integrations">
            Explore integrations
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {integrationShowcase.map((category) => (
            <div key={category.category} className="rounded-3xl border border-input/60 bg-background/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Category</p>
              <h3 className="mt-2 text-xl font-semibold">{category.category}</h3>
              <p className="text-secondary mt-2">{category.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <span
                    key={item}
                    className="border-input/60 text-secondary rounded-full border px-3 py-1 text-xs font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-primary bg-primary px-6 py-10 text-primary-light sm:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-light/80">
              Ready when you are
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-primary-light">
              Give every team the form builder they love—and IT the controls they need.
            </h2>
            <p className="mt-3 max-w-2xl text-primary-light/80">
              Start for free or book a guided tour to see templates, logic, and automations tailored to your
              stack.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex items-center justify-center rounded-full bg-primary-light px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary-light/90" href="/sign-up">
              Create free account
            </a>
            <a className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-primary-light transition hover:bg-primary-light/10" href="/contact/sales">
              Book a live demo
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
