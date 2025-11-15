import { FC } from 'react'

import { TestimonialCard } from './TestimonialCard'

const testimonials = [
  {
    quote:
      'HeyForm has transformed how we collect leads. The conditional logic and integrations saved us hours every week. Our conversion rates increased by 40%!',
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    company: 'TechCorp'
  },
  {
    quote:
      'As a product manager, I use HeyForm for user research surveys. The analytics dashboard gives me instant insights, and the branching logic makes complex surveys simple.',
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'StartupXYZ'
  },
  {
    quote:
      'We switched all our onboarding forms to HeyForm. The drag-and-drop builder is so intuitive, and our HR team loves how easy it is to update forms without IT help.',
    name: 'Emily Rodriguez',
    role: 'HR Coordinator',
    company: 'Global Inc'
  }
]

export const Testimonials: FC = () => {
  return (
    <section id="testimonials" className="bg-slate-950 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Loved by People Worldwide
          </h2>
          <p className="text-lg text-slate-400">
            See what our customers have to say about their experience
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
