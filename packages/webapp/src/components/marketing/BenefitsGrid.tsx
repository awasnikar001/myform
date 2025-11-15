import { FC } from 'react'

import { cn } from '@/utils'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { ANIMATION_DELAYS, SCROLL_ANIMATION_THRESHOLD } from '@/pages/marketing/constants'
import { benefits, iconMap } from '@/pages/marketing/content'

export const BenefitsGrid: FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: SCROLL_ANIMATION_THRESHOLD })

  return (
    <section
      id="benefits"
      ref={ref}
      className={cn('bg-slate-950 py-20 transition-all duration-700 lg:py-32', {
        'translate-y-8 opacity-0': !isVisible,
        'translate-y-0 opacity-100': isVisible
      })}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">Why Choose LyticsForm?</h2>
          <p className="text-lg text-slate-400">
            Focus on how it helps users instead of what features it has
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon]
            return (
              <div
                key={benefit.title}
                className={cn(
                  'rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-700 hover:-translate-y-2 hover:border-slate-700 hover:shadow-xl hover:shadow-purple-500/10',
                  {
                    'translate-y-8 opacity-0': !isVisible,
                    'translate-y-0 opacity-100': isVisible
                  }
                )}
                style={{
                  transitionDelay: isVisible ? `${index * ANIMATION_DELAYS.STAGGER_ITEM}ms` : '0ms'
                }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-3">
                  <Icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{benefit.title}</h3>
                <p className="text-slate-400">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
