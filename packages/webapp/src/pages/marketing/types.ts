export interface Benefit {
  icon: string
  title: string
  description: string
}

export interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  avatar?: string
}

export interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  popular: boolean
}

export interface FAQ {
  question: string
  answer: string
}

export interface HowItWorksStep {
  icon: string
  title: string
  description: string
}
