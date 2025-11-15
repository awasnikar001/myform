import { IconCheck } from '@tabler/icons-react'

import { pricingPlans } from '@/content/public'

const PricingPage = () => {
  return (
    <div className="space-y-16">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Pricing</p>
        <h1 className="mt-4 text-4xl font-semibold">Flexible plans for every growth stage</h1>
        <p className="text-secondary mt-4 text-lg leading-relaxed">
          Start free, upgrade when you launch more workflows, and unlock enterprise controls when you need
          them. Every plan includes unlimited responses, templates, and collaboration.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-3xl border border-input/60 bg-background/70 p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Plan</p>
            <h2 className="mt-2 text-2xl font-semibold">{plan.name}</h2>
            <div className="mt-4 text-4xl font-semibold">{plan.price}</div>
            <p className="text-secondary text-sm">{plan.cadence}</p>
            <p className="text-secondary mt-4">{plan.description}</p>
            <ul className="text-secondary mt-4 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <IconCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href={plan.name === 'Growth' ? '/contact/sales' : '/sign-up'}
              className="text-primary mt-8 inline-flex w-full items-center justify-center rounded-full border border-primary px-4 py-3 text-sm font-semibold transition hover:bg-primary hover:text-primary-light"
            >
              {plan.ctaLabel}
            </a>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-input/60 bg-background/70 p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">What’s included</p>
            <h2 className="mt-2 text-3xl font-semibold">Every plan comes enterprise-ready</h2>
            <p className="text-secondary mt-2">
              Unlimited responses, templates, collaboration seats, and API/Webhooks come standard. Upgrade for
              additional governance, security, and success support.
            </p>
          </div>
          <ul className="text-secondary space-y-2 text-sm">
            <li>Unlimited published forms & responses</li>
            <li>Full template gallery + theme controls</li>
            <li>Advanced logic, piping, and calculations</li>
            <li>Analytics dashboards + exports</li>
            <li>Native integrations + REST/webhook access</li>
            <li>Email + in-app support (Priority + Success on Scale)</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default PricingPage
