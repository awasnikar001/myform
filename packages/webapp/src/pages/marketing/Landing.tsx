import { useEffect } from 'react'

import {
  BenefitsGrid,
  CTASection,
  FAQ,
  Hero,
  HowItWorks,
  LogoCloud,
  PricingTable,
  Testimonials
} from '@/components/marketing'

export default function Landing() {
  useEffect(() => {
    document.title = 'HeyForm - Build Beautiful Forms in Minutes'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        'Create stunning forms with drag-and-drop builder. No coding required. Real-time analytics, smart logic, and 100+ integrations.'
      )
    }
  }, [])

  return (
    <div className="relative">
      <Hero />
      <LogoCloud />
      <BenefitsGrid />
      <HowItWorks />
      <PricingTable />
      <Testimonials />
      <FAQ />
      <CTASection />
    </div>
  )
}
