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
      className={cn('bg-black py-20 transition-all duration-700 lg:py-32', {
        'translate-y-8 opacity-0': !isVisible,
        'translate-y-0 opacity-100': isVisible
      })}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-400">
            Start for free, scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                'group relative flex flex-col rounded-3xl border p-8 transition-all duration-500 hover:-translate-y-2',
                {
                  'border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10':
                    !plan.popular,
                  'border-transparent bg-slate-900/80 shadow-2xl shadow-purple-500/20 backdrop-blur-xl':
                    plan.popular
                }
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Border for Popular Plan */}
              {plan.popular && (
                <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 p-[1px] opacity-100" />
              )}

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="mb-2 text-xl font-bold text-white">{plan.name}</h3>
                <p className="mb-6 min-h-[40px] text-sm text-slate-400">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                      <IconCheck className="h-3 w-3" />
                    </div>
                    <span className="text-sm text-slate-300">{feature}</span>
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
                className={cn(
                  'w-full rounded-xl px-6 py-4 text-base font-bold transition-all duration-300',
                  {
                    'bg-white text-black hover:scale-105 hover:shadow-lg hover:shadow-white/20':
                      plan.popular,
                    'bg-white/10 text-white hover:scale-105 hover:bg-white/20': !plan.popular
                  }
                )}
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
