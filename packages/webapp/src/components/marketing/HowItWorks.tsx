import { FC } from 'react'

import { cn } from '@/utils'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { SCROLL_ANIMATION_THRESHOLD } from '@/pages/marketing/constants'
import { howItWorksSteps, iconMap } from '@/pages/marketing/content'

export const HowItWorks: FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: SCROLL_ANIMATION_THRESHOLD })

  return (
    <section
      ref={ref}
      className={cn(
        'relative overflow-hidden bg-black py-20 transition-all duration-700 lg:py-32',
        {
          'opacity-0': !isVisible,
          'opacity-100': isVisible
        }
      )}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white lg:text-5xl">
            From idea to live form in <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              seconds
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            We've streamlined the entire process so you can focus on what matters: collecting data.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Connecting Line (Desktop) */}
          <div className="absolute left-0 top-12 hidden h-0.5 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" />

          {howItWorksSteps.map((step, index) => {
            const Icon = iconMap[step.icon]
            return (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Step Number / Icon */}
                <div className="group relative mb-8">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-40 blur transition-opacity duration-500 group-hover:opacity-70" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-black/80 p-6 shadow-2xl backdrop-blur-xl transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-110">
                    <Icon className="h-10 w-10 text-white" />
                    <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-black shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                </div>

                <h3 className="mb-4 text-xl font-bold text-white">{step.title}</h3>
                <p className="max-w-xs leading-relaxed text-slate-400">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
