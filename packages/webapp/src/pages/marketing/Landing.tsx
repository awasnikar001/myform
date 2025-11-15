import { Suspense, lazy, useEffect } from 'react'

import { Hero } from '@/components/marketing'

const LogoCloud = lazy(() => import('@/components/marketing').then(m => ({ default: m.LogoCloud })))
const BenefitsGrid = lazy(() =>
  import('@/components/marketing').then(m => ({ default: m.BenefitsGrid }))
)
const HowItWorks = lazy(() =>
  import('@/components/marketing').then(m => ({ default: m.HowItWorks }))
)
const PricingTable = lazy(() =>
  import('@/components/marketing').then(m => ({ default: m.PricingTable }))
)
const Testimonials = lazy(() =>
  import('@/components/marketing').then(m => ({ default: m.Testimonials }))
)
const FAQ = lazy(() => import('@/components/marketing').then(m => ({ default: m.FAQ })))
const CTASection = lazy(() =>
  import('@/components/marketing').then(m => ({ default: m.CTASection }))
)

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
      <Suspense fallback={<div className="h-32" />}>
        <LogoCloud />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <BenefitsGrid />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <PricingTable />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <FAQ />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <CTASection />
      </Suspense>
    </div>
  )
}
