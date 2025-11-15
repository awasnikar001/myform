import {
  IconChartBar,
  IconGitBranch,
  IconHandClick,
  IconPlug,
  IconShare,
  IconShield,
  IconTemplate,
  IconTrendingUp,
  IconWand
} from '@tabler/icons-react'

import type { Benefit, FAQ, HowItWorksStep, PricingPlan, Testimonial } from './types'

export const benefits: Benefit[] = [
  {
    icon: 'IconWand',
    title: 'No-Code Builder',
    description:
      'Drag-and-drop form creation with an intuitive interface. Build complex forms without writing a single line of code.'
  },
  {
    icon: 'IconGitBranch',
    title: 'Smart Logic',
    description:
      'Create conditional branching and calculations that adapt based on user responses. Make your forms intelligent and dynamic.'
  },
  {
    icon: 'IconChartBar',
    title: 'Real-Time Analytics',
    description:
      'Track responses as they come in. Get insights into completion rates, drop-off points, and user behavior patterns.'
  },
  {
    icon: 'IconPlug',
    title: '100+ Integrations',
    description:
      'Connect to your favorite tools. Integrate with CRM, email marketing, payment processors, and more with one click.'
  },
  {
    icon: 'IconTrendingUp',
    title: 'Higher Conversions',
    description:
      'Beautiful forms that people love to fill out. Increase completion rates with our modern, mobile-responsive designs.'
  },
  {
    icon: 'IconShield',
    title: 'Enterprise Security',
    description:
      'Bank-level encryption and compliance. Your data is protected with SOC 2, GDPR, and HIPAA compliance standards.'
  }
]

export const testimonials: Testimonial[] = [
  {
    quote:
      'LyticsForm has transformed how we collect leads. The conditional logic and integrations saved us hours every week. Our conversion rates increased by 40%!',
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    company: 'TechCorp'
  },
  {
    quote:
      'As a product manager, I use LyticsForm for user research surveys. The analytics dashboard gives me instant insights, and the branching logic makes complex surveys simple.',
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'StartupXYZ'
  },
  {
    quote:
      'We switched all our onboarding forms to LyticsForm. The drag-and-drop builder is so intuitive, and our HR team loves how easy it is to update forms without IT help.',
    name: 'Emily Rodriguez',
    role: 'HR Coordinator',
    company: 'Global Inc'
  }
]

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$100',
    period: '/month',
    description: 'Perfect for small teams',
    features: [
      '1,000 responses/month',
      '5 forms',
      'Basic integrations',
      'Email support',
      'Basic analytics'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Pro',
    price: '$200',
    period: '/month',
    description: 'Most popular for growing teams',
    features: [
      '10,000 responses/month',
      'Unlimited forms',
      'All integrations',
      'Priority support',
      'Custom branding',
      'Advanced analytics'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$300',
    period: '/month',
    description: 'For large organizations',
    features: [
      'Unlimited responses',
      'Unlimited forms',
      'Advanced features',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations'
    ],
    cta: 'Contact Sales',
    popular: false
  }
]

export const faqs: FAQ[] = [
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

export const howItWorksSteps: HowItWorksStep[] = [
  {
    icon: 'IconTemplate',
    title: 'Choose a template or start from scratch',
    description:
      'Browse 50+ professionally designed templates or create your form from a blank canvas. Templates cover everything from surveys to event registrations.'
  },
  {
    icon: 'IconHandClick',
    title: 'Customize with drag-and-drop',
    description:
      'Add fields, logic, and styling without code. Our intuitive builder lets you create complex forms with conditional branching and calculations.'
  },
  {
    icon: 'IconShare',
    title: 'Share and collect responses',
    description:
      'Publish your form and start receiving submissions instantly. Share via link, embed on your website, or integrate with your existing tools.'
  }
]

// Icon mapping for dynamic icon rendering
export const iconMap: Record<string, any> = {
  IconWand,
  IconGitBranch,
  IconChartBar,
  IconPlug,
  IconTrendingUp,
  IconShield,
  IconTemplate,
  IconHandClick,
  IconShare
}
