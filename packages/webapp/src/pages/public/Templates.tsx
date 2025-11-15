import { IconLayoutGrid, IconSparkles } from '@tabler/icons-react'

import { personaContent, templateCollections } from '@/content/public'

const TemplatesPage = () => {
  return (
    <div className="space-y-16">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Templates</p>
        <h1 className="mt-4 text-4xl font-semibold">Launch faster with conversion-proven templates</h1>
        <p className="text-secondary mt-4 text-lg leading-relaxed">
          Mix and match templates for lead gen, research, onboarding, and success playbooks. Each template
          ships with recommended logic, automations, and brand controls.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {templateCollections.map((collection) => (
          <div key={collection.title} className="rounded-3xl border border-input/60 bg-background/70 p-6">
            <IconLayoutGrid className="h-7 w-7 text-primary" />
            <h2 className="mt-3 text-2xl font-semibold">{collection.title}</h2>
            <p className="text-secondary mt-2">{collection.description}</p>
            <div className="mt-4 rounded-2xl bg-background/80 p-4 text-sm text-secondary">
              <p className="font-semibold text-primary">Included templates</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {collection.templates.map((template) => (
                  <li key={template}>{template}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-input/60 bg-gradient-to-br from-background to-background/60 p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Persona packs</p>
            <h2 className="mt-2 text-3xl font-semibold">Curated packs by team persona</h2>
            <p className="text-secondary mt-2">
              Enable every department with bundles that include suggested logic, notifications, and
              integrations aligned to their KPIs.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {personaContent.map((persona) => (
              <div key={persona.id} className="rounded-2xl border border-input/60 bg-foreground/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
                  {persona.subtitle}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{persona.title}</h3>
                <ul className="text-secondary mt-3 space-y-1 text-sm">
                  {persona.templates.slice(0, 2).map((template) => (
                    <li key={template.name}>{template.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/60 bg-primary/5 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Services</p>
            <h2 className="mt-2 text-3xl font-semibold">Need bespoke templates or migrations?</h2>
            <p className="text-secondary mt-2">
              Our solutions team can migrate legacy Typeform, Google Forms, or custom-built experiences—and
              leave you with a reusable template kit.
            </p>
          </div>
          <a
            href="/contact/sales"
            className="inline-flex items-center gap-2 rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-light"
          >
            <IconSparkles className="h-4 w-4" />
            Talk to solutions
          </a>
        </div>
      </section>
    </div>
  )
}

export default TemplatesPage
