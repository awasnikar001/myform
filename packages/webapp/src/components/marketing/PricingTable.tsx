import { IconCheck } from '@tabler/icons-react'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: '$100',
    period: '/month',
    description: 'Perfect for small teams',
    features: [
      '1,000 responses/month',
      '5 forms',
      'Basic integrations',
      'Email support',
      'Basic analytics'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Pro',
    price: '$200',
    period: '/month',
    description: 'Most popular for growing teams',
    features: [
      '10,000 responses/month',
      'Unlimited forms',
      'All integrations',
      'Priority support',
      'Custom branding',
      'Advanced analytics'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$300',
    period: '/month',
    description: 'For large organizations',
    features: [
      'Unlimited responses',
      'Unlimited forms',
      'Advanced features',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations'
    ],
    cta: 'Contact Sales',
    popular: false
  }
]

export const PricingTable: FC = () => {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="bg-slate-950 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Pricing - Why to Buy / How it Helps
          </h2>
          <p className="text-lg text-slate-400">Transparent pricing. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`animate-in fade-in-0 slide-in-from-bottom-4 relative rounded-2xl border p-8 transition-all duration-700 ${
                plan.popular
                  ? 'scale-105 border-purple-600/50 bg-slate-900/50 shadow-2xl shadow-purple-500/10'
                  : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold text-white">{plan.name}</h3>
                <p className="mb-4 text-sm text-slate-400">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-3">
                    <IconCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (plan.name === 'Enterprise') {
                    // Could open contact form or navigate to contact page
                    return
                  }
                  navigate('/sign-up')
                }}
                className={`w-full rounded-lg px-6 py-3 text-base font-medium transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20'
                    : 'border border-slate-800 bg-slate-900/50 text-white hover:border-slate-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
