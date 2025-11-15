import { IconChevronDown } from '@tabler/icons-react'
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
      className={cn('bg-slate-950 py-20 transition-all duration-700 lg:py-32', {
        'translate-y-8 opacity-0': !isVisible,
        'translate-y-0 opacity-100': isVisible
      })}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-400">
            Address some major questions to help people make the final call
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className="animate-in fade-in-0 slide-in-from-bottom-4 rounded-xl border border-slate-800 bg-slate-900/50 transition-colors duration-700 hover:border-slate-700"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${index}`}
                  id={`faq-question-${index}`}
                  className={cn(
                    'flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-900/50',
                    'group'
                  )}
                >
                  <h3 className="font-semibold text-white">{faq.question}</h3>
                  <IconChevronDown
                    className={cn(
                      'h-5 w-5 text-slate-400 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-content-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="px-6 pb-4 text-slate-300">{faq.answer}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
