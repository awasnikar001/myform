import {
  IconArrowRight,
  IconCheck,
  IconDotsVertical,
  IconGripVertical,
  IconPlus,
  IconSettings,
  IconStarFilled
} from '@tabler/icons-react'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

export const Hero: FC = () => {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen overflow-hidden bg-black pb-20 pt-32 lg:pb-32 lg:pt-48">
      {/* Background Effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-full max-w-7xl -translate-x-1/2">
        <div className="animate-pulse-slow absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="animate-pulse-slow absolute right-1/4 top-20 h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[100px] delay-1000" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Trust Badge */}
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md transition-colors duration-1000 [animation-delay:200ms] hover:bg-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 w-6 rounded-full border-2 border-black bg-slate-700" />
              ))}
            </div>
            <div className="mx-2 h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <IconStarFilled key={i} className="h-3 w-3" />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-300">Loved by 1000+ teams</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards mb-8 max-w-4xl text-5xl font-bold tracking-tight text-white duration-1000 [animation-delay:400ms] sm:text-7xl lg:text-8xl">
            Build forms that feel like <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              magic, not work.
            </span>
          </h1>

          {/* Subheading */}
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 duration-1000 [animation-delay:600ms] sm:text-xl">
            Create stunning, conversational forms that your users will actually enjoy filling out.
            No coding required. Just pure design excellence.
          </p>

          {/* CTAs */}
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards flex flex-col gap-4 duration-1000 [animation-delay:800ms] sm:flex-row sm:items-center">
            <button
              onClick={() => navigate('/sign-up')}
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Start Building Free
              <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('benefits')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              View Features
            </button>
          </div>

          {/* Feature List */}
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-slate-400 duration-1000 [animation-delay:1000ms]">
            {['No credit card required', '14-day free trial', 'Cancel anytime'].map(feature => (
              <div key={feature} className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                  <IconCheck className="h-3 w-3" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Realistic Form Builder Mock */}
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards relative mt-20 duration-1000 [animation-delay:1200ms] lg:mt-32">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
            {/* Mock Header */}
            <div className="flex h-14 items-center justify-between border-b border-white/10 bg-[#111] px-4">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20" />
                <div className="h-3 w-3 rounded-full border border-yellow-500/50 bg-yellow-500/20" />
                <div className="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20" />
                <div className="ml-4 h-6 w-px bg-white/10" />
                <span className="text-sm font-medium text-slate-300">Product Feedback Survey</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-slate-400">
                  Draft
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">
                  JD
                </div>
                <button className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black">
                  Publish
                </button>
              </div>
            </div>

            {/* Mock Body */}
            <div className="flex h-[600px]">
              {/* Sidebar - Fields */}
              <div className="hidden w-64 border-r border-white/10 bg-[#111] p-4 md:block">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Add Fields
                </div>
                <div className="space-y-2">
                  {[
                    { icon: 'T', label: 'Short Text' },
                    { icon: '¶', label: 'Long Text' },
                    { icon: '◉', label: 'Multiple Choice' },
                    { icon: '★', label: 'Rating' },
                    { icon: '@', label: 'Email' },
                    { icon: '#', label: 'Number' }
                  ].map(field => (
                    <div
                      key={field.label}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2 text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-xs font-bold group-hover:bg-white/10">
                        {field.icon}
                      </div>
                      <span className="text-sm">{field.label}</span>
                      <IconPlus className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Canvas - Form Preview */}
              <div className="relative flex-1 overflow-hidden bg-[#0A0A0A] p-8">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] opacity-20 [background-size:16px_16px]" />

                <div className="relative z-10 mx-auto max-w-2xl space-y-6">
                  {/* Active Field */}
                  <div className="group relative rounded-xl border-2 border-purple-500/50 bg-[#161616] p-6 shadow-lg shadow-purple-500/5">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 cursor-move opacity-0 transition-opacity group-hover:opacity-100">
                      <IconGripVertical className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-lg font-medium text-white">
                        How would you rate your experience? <span className="text-red-500">*</span>
                      </label>
                      <p className="mt-1 text-sm text-slate-400">
                        Please be honest, we value your feedback.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <div
                          key={star}
                          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-all ${
                            star <= 4
                              ? 'border-purple-500/50 bg-purple-500/20 text-purple-400'
                              : 'border-white/10 bg-white/5 text-slate-500 hover:border-white/20'
                          }`}
                        >
                          <IconStarFilled className="h-5 w-5" />
                        </div>
                      ))}
                    </div>
                    {/* Field Actions */}
                    <div className="absolute -right-3 top-1/2 flex -translate-y-1/2 flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded-full border border-white/10 bg-[#222] p-2 text-slate-400 shadow-lg hover:text-white">
                        <IconSettings className="h-4 w-4" />
                      </button>
                      <button className="rounded-full border border-white/10 bg-[#222] p-2 text-slate-400 shadow-lg hover:text-white">
                        <IconDotsVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inactive Field */}
                  <div className="rounded-xl border border-white/5 bg-[#111] p-6 opacity-50 transition-opacity hover:opacity-100">
                    <div className="mb-4">
                      <label className="block text-lg font-medium text-white">
                        What features would you like to see next?
                      </label>
                    </div>
                    <div className="h-24 w-full rounded-lg border border-white/10 bg-black/50" />
                  </div>
                </div>
              </div>

              {/* Right Panel - Properties */}
              <div className="hidden w-72 border-l border-white/10 bg-[#111] p-4 lg:block">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Properties</span>
                  <IconSettings className="h-4 w-4 text-slate-400" />
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-400">Label</label>
                    <div className="rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white">
                      How would you rate your experience?
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-400">
                      Description
                    </label>
                    <div className="rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white">
                      Please be honest, we value your feedback.
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Required</span>
                      <div className="h-5 w-9 rounded-full bg-purple-600 p-1">
                        <div className="h-3 w-3 translate-x-4 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Show Description</span>
                      <div className="h-5 w-9 rounded-full bg-purple-600 p-1">
                        <div className="h-3 w-3 translate-x-4 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow behind the card */}
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-pink-500/30 opacity-50 blur-3xl" />
        </div>
      </div>
    </section>
  )
}
