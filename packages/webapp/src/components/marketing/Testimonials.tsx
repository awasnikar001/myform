import { FC } from 'react'

import { cn } from '@/utils'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { ANIMATION_DELAYS, SCROLL_ANIMATION_THRESHOLD } from '@/pages/marketing/constants'
import { testimonials } from '@/pages/marketing/content'

import { TestimonialCard } from './TestimonialCard'

export const Testimonials: FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: SCROLL_ANIMATION_THRESHOLD })

  return (
    <section
      id="testimonials"
      ref={ref}
      className={cn('bg-slate-950 py-20 transition-all duration-700 lg:py-32', {
        'translate-y-8 opacity-0': !isVisible,
        'translate-y-0 opacity-100': isVisible
      })}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Loved by People Worldwide
          </h2>
          <p className="text-lg text-slate-400">
            See what our customers have to say about their experience
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={cn('transition-transform duration-300 hover:scale-105', {
                'translate-y-8 opacity-0': !isVisible,
                'translate-y-0 opacity-100': isVisible
              })}
              style={{
                transitionDelay: isVisible ? `${index * ANIMATION_DELAYS.STAGGER_ITEM}ms` : '0ms'
              }}
            >
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
