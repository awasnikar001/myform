import { IconCheck } from '@tabler/icons-react'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '@/utils'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { SCROLL_ANIMATION_THRESHOLD } from '@/pages/marketing/constants'
import { pricingPlans } from '@/pages/marketing/content'

export const PricingTable: FC = () => {
  const navigate = useNavigate()
  const { ref, isVisible } = useScrollAnimation({ threshold: SCROLL_ANIMATION_THRESHOLD })

  return (
    <section
      id="pricing"
      ref={ref}
      className={cn('bg-slate-950 py-20 transition-all duration-700 lg:py-32', {
        'translate-y-8 opacity-0': !isVisible,
        'translate-y-0 opacity-100': isVisible
      })}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Pricing - Why to Buy / How it Helps
          </h2>
          <p className="text-lg text-slate-400">Transparent pricing. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
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
                    ? 'btn-ripple animate-gradient bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20'
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
