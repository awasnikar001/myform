import { IconUsers } from '@tabler/icons-react'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

export const Hero: FC = () => {
  const navigate = useNavigate()

  return (
    <section className="pattern-dots relative overflow-hidden bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column - Text Content */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {/* Trust Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2">
              <IconUsers className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-slate-300">1000+ active users</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white lg:text-6xl">
              Build Beautiful Forms in Minutes, Not Hours
            </h1>

            {/* Subheading */}
            <p className="mb-8 text-xl text-slate-400 lg:text-2xl">
              Create stunning forms with our drag-and-drop builder. No coding required. Real-time
              analytics, smart logic, and 100+ integrations to power your workflows.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => navigate('/sign-up')}
                className="btn-ripple animate-gradient rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('benefits')
                  element?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="rounded-lg border border-slate-800 bg-slate-900/50 px-6 py-3 text-base font-medium text-white transition-all hover:border-slate-700 hover:bg-slate-900"
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Column - Product Screenshot */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 delay-200 duration-700">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 blur-3xl" />
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900">
                  {/* Placeholder for product screenshot */}
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4 text-6xl" role="img" aria-label="Form icon">
                        📋
                      </div>
                      <p className="text-sm text-slate-400">Product Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
