import { IconPlugConnected, IconUpload } from '@tabler/icons-react'

import { integrationShowcase } from '@/content/public'

const IntegrationsPage = () => {
  return (
    <div className="space-y-16">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Integrations</p>
        <h1 className="mt-4 text-4xl font-semibold">Connect HeyForm to every workflow</h1>
        <p className="text-secondary mt-4 text-lg leading-relaxed">
          Choose from 60+ native integrations, embed anywhere, or use secure webhooks + APIs to push data to
          your stack with retries, logging, and alerts.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrationShowcase.map((category) => (
          <div key={category.category} className="rounded-3xl border border-input/60 bg-background/70 p-6">
            <IconPlugConnected className="h-7 w-7 text-primary" />
            <h2 className="mt-3 text-2xl font-semibold">{category.category}</h2>
            <p className="text-secondary mt-2">{category.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <span
                  key={item}
                  className="border-input/70 rounded-full border px-3 py-1 text-xs font-semibold text-secondary"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-input/60 bg-background/70 p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Webhooks & API</p>
            <h2 className="mt-2 text-3xl font-semibold">Developer-friendly extensibility</h2>
            <p className="text-secondary mt-2">
              Forward submissions to any endpoint with custom headers, auth tokens, payload mapping, retry
              logic, and logging. Use the public API for management automation.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-secondary">
            <li>REST + GraphQL endpoints with fine-grained scopes</li>
            <li>Webhooks with signing secrets and dead-letter queues</li>
            <li>Embeddable SDKs for web, product, and mobile surfaces</li>
            <li>Integration builder for bespoke internal systems</li>
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/60 bg-primary/5 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Migration help</p>
            <h2 className="mt-2 text-3xl font-semibold">Moving from another form tool?</h2>
            <p className="text-secondary mt-2">
              Our team can migrate Typeform, Google Forms, or internal tooling, replicate integrations, and
              document new automation paths in under a week.
            </p>
          </div>
          <a
            href="/contact/sales"
            className="inline-flex items-center gap-2 rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-light"
          >
            <IconUpload className="h-4 w-4" />
            Request migration support
          </a>
        </div>
      </section>
    </div>
  )
}

export default IntegrationsPage
