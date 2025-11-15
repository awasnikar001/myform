import {
  IconChartBar,
  IconGitBranch,
  IconPlug,
  IconShield,
  IconTrendingUp,
  IconWand
} from '@tabler/icons-react'
import { FC } from 'react'

const benefits = [
  {
    icon: IconWand,
    title: 'No-Code Builder',
    description:
      'Drag-and-drop form creation with an intuitive interface. Build complex forms without writing a single line of code.'
  },
  {
    icon: IconGitBranch,
    title: 'Smart Logic',
    description:
      'Create conditional branching and calculations that adapt based on user responses. Make your forms intelligent and dynamic.'
  },
  {
    icon: IconChartBar,
    title: 'Real-Time Analytics',
    description:
      'Track responses as they come in. Get insights into completion rates, drop-off points, and user behavior patterns.'
  },
  {
    icon: IconPlug,
    title: '100+ Integrations',
    description:
      'Connect to your favorite tools. Integrate with CRM, email marketing, payment processors, and more with one click.'
  },
  {
    icon: IconTrendingUp,
    title: 'Higher Conversions',
    description:
      'Beautiful forms that people love to fill out. Increase completion rates with our modern, mobile-responsive designs.'
  },
  {
    icon: IconShield,
    title: 'Enterprise Security',
    description:
      'Bank-level encryption and compliance. Your data is protected with SOC 2, GDPR, and HIPAA compliance standards.'
  }
]

export const BenefitsGrid: FC = () => {
  return (
    <section id="benefits" className="bg-slate-950 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">Why Choose HeyForm?</h2>
          <p className="text-lg text-slate-400">
            Focus on how it helps users instead of what features it has
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="animate-in fade-in-0 slide-in-from-bottom-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-colors duration-700 hover:border-slate-700"
                style={{ animationDelay: `${index * 100}ms` }}
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
