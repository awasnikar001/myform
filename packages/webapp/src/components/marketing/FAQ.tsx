import { IconChevronDown, IconHelp } from '@tabler/icons-react'
import { FC, useState } from 'react'

import { cn } from '@/utils'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { SCROLL_ANIMATION_THRESHOLD } from '@/pages/marketing/constants'
import { faqs } from '@/pages/marketing/content'

export const FAQ: FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { ref, isVisible } = useScrollAnimation({ threshold: SCROLL_ANIMATION_THRESHOLD })

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section
      id="faq"
      ref={ref}
      className={cn('bg-black py-20 transition-all duration-700 lg:py-32', {
        'translate-y-8 opacity-0': !isVisible,
        'translate-y-0 opacity-100': isVisible
      })}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <IconHelp className="h-8 w-8 text-purple-400" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-400">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className={cn(
                  'group overflow-hidden rounded-2xl border transition-all duration-300',
                  {
                    'border-white/10 bg-white/5': !isOpen,
                    'border-purple-500/30 bg-white/10 shadow-lg shadow-purple-500/10': isOpen
                  }
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${index}`}
                  id={`faq-question-${index}`}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <h3
                    className={cn('text-lg font-medium transition-colors', {
                      'text-white': isOpen,
                      'text-slate-300 group-hover:text-white': !isOpen
                    })}
                  >
                    {faq.question}
                  </h3>
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300',
                      {
                        'rotate-180 border-transparent bg-white text-black': isOpen,
                        'text-slate-400 group-hover:border-white/20 group-hover:text-white': !isOpen
                      }
                    )}
                  >
                    <IconChevronDown className="h-5 w-5" aria-hidden="true" />
                  </div>
                </button>
                <div
                  id={`faq-content-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="mt-2 border-t border-white/5 px-6 pb-6 pt-0 leading-relaxed text-slate-400">
                    <div className="pt-4">{faq.answer}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
