import { IconHandClick, IconShare, IconTemplate } from '@tabler/icons-react'
import { FC } from 'react'

const steps = [
  {
    icon: IconTemplate,
    title: 'Choose a template or start from scratch',
    description:
      'Browse 50+ professionally designed templates or create your form from a blank canvas. Templates cover everything from surveys to event registrations.'
  },
  {
    icon: IconHandClick,
    title: 'Customize with drag-and-drop',
    description:
      'Add fields, logic, and styling without code. Our intuitive builder lets you create complex forms with conditional branching and calculations.'
  },
  {
    icon: IconShare,
    title: 'Share and collect responses',
    description:
      'Publish your form and start receiving submissions instantly. Share via link, embed on your website, or integrate with your existing tools.'
  }
]

export const HowItWorks: FC = () => {
  return (
    <section className="bg-slate-950 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-lg text-slate-400">
            Explain how to get started with the product in 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="animate-in fade-in-0 slide-in-from-bottom-4 text-center duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-4">
                  <Icon className="h-8 w-8 text-purple-400" />
                </div>
                <div className="mb-4 flex items-center justify-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                </div>
                <p className="text-slate-400">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
