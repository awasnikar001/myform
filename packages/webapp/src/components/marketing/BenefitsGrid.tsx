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
      className={cn('bg-black py-20 transition-all duration-700 lg:py-32', {
        'translate-y-8 opacity-0': !isVisible,
        'translate-y-0 opacity-100': isVisible
      })}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-5xl">
            Why top teams choose <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              LyticsForm
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Everything you need to build powerful forms, surveys, and quizzes without writing a
            single line of code.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon]
            return (
              <div
                key={benefit.title}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10',
                  {
                    'translate-y-8 opacity-0': !isVisible,
                    'translate-y-0 opacity-100': isVisible,
                    'md:col-span-2': index === 3 || index === 6
                  }
                )}
                style={{
                  transitionDelay: isVisible ? `${index * ANIMATION_DELAYS.STAGGER_ITEM}ms` : '0ms'
                }}
              >
                {/* Gradient Glow on Hover */}
                <div className="absolute -inset-px bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-blue-500/0 opacity-0 transition-opacity duration-500 group-hover:from-purple-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-6 inline-flex rounded-xl bg-white/10 p-3 text-white ring-1 ring-white/20 transition-colors group-hover:bg-white/20 group-hover:text-purple-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{benefit.title}</h3>
                  <p className="leading-relaxed text-slate-400">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
