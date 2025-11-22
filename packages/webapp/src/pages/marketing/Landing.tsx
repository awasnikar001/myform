import { Suspense, lazy, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Hero } from '@/components/marketing'
import { SEO } from '@/components'

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
  const { t } = useTranslation()

  useEffect(() => {
    // document.title and meta description are now handled by the SEO component
  }, [])

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SEO
        title={t('landing.hero.headline', 'Build Beautiful Forms')}
        description={t('landing.hero.subHeadline', 'The most powerful form builder for modern teams.')}
      />

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
