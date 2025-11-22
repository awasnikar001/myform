import { IconArrowRight } from '@tabler/icons-react'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '@/utils'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { SCROLL_ANIMATION_THRESHOLD } from '@/pages/marketing/constants'

export const CTASection: FC = () => {
  const navigate = useNavigate()
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
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />

      {/* Glowing Orbs */}
      <div className="animate-pulse-slow absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="animate-pulse-slow absolute right-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-blue-600/20 blur-[120px] delay-1000" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-4xl font-bold tracking-tight text-white lg:text-6xl">
          Ready to build something <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            extraordinary?
          </span>
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-400">
          Join thousands of forward-thinking teams who are already using LyticsForm to create
          beautiful, high-converting forms.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigate('/sign-up')}
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Start Building Free
            <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => {
              // Contact sales logic
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
          >
            Contact Sales
          </button>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          No credit card required · 14-day free trial · Cancel anytime
        </p>
      </div>
    </section>
  )
}
