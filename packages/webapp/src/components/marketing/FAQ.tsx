import { IconChevronDown } from '@tabler/icons-react'
import { FC, useState } from 'react'

import { cn } from '@/utils'

const faqs = [
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! We offer a 14-day free trial with full access to all features. No credit card required. Start building forms immediately and see the value before committing.'
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. We believe in no long-term contracts. Cancel your subscription at any time with just a few clicks. Your data remains accessible for 30 days after cancellation.'
  },
  {
    question: 'How secure is my data?',
    answer:
      'We use enterprise-grade encryption and follow industry best practices. We are SOC 2 Type II certified, GDPR compliant, and HIPAA ready. Your data is encrypted in transit and at rest.'
  },
  {
    question: 'What integrations are available?',
    answer:
      'We integrate with 100+ popular tools including Zapier, Salesforce, HubSpot, Mailchimp, Stripe, Google Sheets, Slack, and many more. Our Zapier integration allows you to connect to virtually any app.'
  },
  {
    question: 'Do you offer migration support?',
    answer:
      'Yes! We offer white-glove migration assistance for Enterprise customers. Our team will help you migrate forms from Google Forms, Typeform, or any other platform. Contact sales for details.'
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. For Enterprise customers, we also offer invoicing with net-30 payment terms.'
  }
]

export const FAQ: FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="bg-slate-950 py-20 lg:py-32">
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
                  className={cn(
                    'flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-900/50',
                    'group'
                  )}
                >
                  <span className="font-semibold text-white">{faq.question}</span>
                  <IconChevronDown
                    className={cn(
                      'h-5 w-5 text-slate-400 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                <div
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
