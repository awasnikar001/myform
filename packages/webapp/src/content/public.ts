export type PersonaId = 'marketing' | 'product' | 'operations' | 'success'

export interface PersonaContent {
  id: PersonaId
  title: string
  subtitle: string
  description: string
  needs: string[]
  highlights: {
    title: string
    body: string
    bullets: string[]
  }[]
  stats: {
    label: string
    value: string
  }[]
  templates: {
    name: string
    description: string
  }[]
  integrations: string[]
  testimonial: {
    quote: string
    author: string
    role: string
    company: string
  }
  primaryCta: {
    label: string
    href: string
  }
  secondaryCta: {
    label: string
    href: string
  }
}

export const personaContent: PersonaContent[] = [
  {
    id: 'marketing',
    title: 'Marketing & Growth Teams',
    subtitle: 'High-converting forms for every campaign',
    description:
      'Spin up lead-gen, webinar, and gated content forms in minutes with pre-built logic, branded themes, and native marketing automation integrations.',
    needs: [
      'Launch campaign-ready forms and landing experiences without waiting on engineering.',
      'Optimize conversions with versioned templates, A/B testing hooks, and analytics that focus on drop-off insights.',
      'Pipe leads straight into HubSpot, Marketo, Salesforce, or custom webhooks with enrichment out of the box.'
    ],
    highlights: [
      {
        title: 'Template gallery built for marketers',
        body: 'Choose from proven templates for event registrations, content downloads, paid ads, and partner co-marketing.',
        bullets: ['Filter by goal, channel, and funnel stage', 'Lock brand styles once, reuse everywhere']
      },
      {
        title: 'Automations that accelerate MQLs',
        body: 'Trigger nurture sequences, add to audiences, or send instant alerts to Sales and RevOps.',
        bullets: ['Native HubSpot, Marketo, Mailchimp, Customer.io', 'Route hot leads with scoring rules']
      },
      {
        title: 'Campaign analytics',
        body: 'See conversion, completion, and attribution data without switching tabs.',
        bullets: ['Drop-off tracking per field', 'UTM/source reporting-ready exports']
      }
    ],
    stats: [
      { label: 'Faster campaign launches', value: '4x' },
      { label: 'Average conversion lift', value: '+28%' },
      { label: 'Native integrations', value: '30+' }
    ],
    templates: [
      { name: 'Lead Magnet Download', description: 'Collect intent-rich signals with progressive profiling.' },
      { name: 'Event / Webinar Signup', description: 'Sync attendees to marketing automation instantly.' },
      { name: 'Customer Winback', description: 'Re-engage churn risks with tailored offers.' }
    ],
    integrations: ['HubSpot', 'Marketo', 'Salesforce', 'Mailchimp', 'Customer.io', 'Segment'],
    testimonial: {
      quote:
        'We now launch campaigns in hours instead of sprints and every form pipes enriched data into HubSpot automatically.',
      author: 'Priya Verma',
      role: 'Director of Growth',
      company: 'Northwind'
    },
    primaryCta: { label: 'Explore templates', href: '/public/templates' },
    secondaryCta: { label: 'Book a revenue workflow demo', href: '/contact/sales' }
  },
  {
    id: 'product',
    title: 'Product Teams',
    subtitle: 'Research, betas, and feedback in one workspace',
    description:
      'Run user research studies, roadmap surveys, and beta waitlists with logic branching, question piping, and flexible exports.',
    needs: [
      'Collect feedback across journeys with advanced logic and personalization.',
      'Pipe insights to Productboard, Jira, Linear, or shared research repositories.',
      'Keep legal + privacy teams happy with role-based permissions and audit trails.'
    ],
    highlights: [
      {
        title: 'Adaptive question flows',
        body: 'Use conditional paths, question piping, and scoring to personalize surveys for each respondent.',
        bullets: ['No-code branching tree', 'Reusable logic blocks across forms']
      },
      {
        title: 'Research ops friendly',
        body: 'Tag responses, push to Productboard or Airtable, and auto-create backlog items.',
        bullets: ['One-click exports (CSV, JSON, PDF)', 'Automatic summaries and alerts']
      },
      {
        title: 'Beta management',
        body: 'Collect signups, gate access, and trigger onboarding sequences.',
        bullets: ['Invite-only or public waitlists', 'Custom approval flows']
      }
    ],
    stats: [
      { label: 'Research forms shipped', value: '12k+' },
      { label: 'Export formats', value: '5' },
      { label: 'Logic depth', value: 'Unlimited' }
    ],
    templates: [
      { name: 'Feature Validation Survey', description: 'Prioritize backlog items with confidence scores.' },
      { name: 'Beta Program Signup', description: 'Manage cohorts with auto-responders and Slack alerts.' },
      { name: 'In-app Feedback', description: 'Route bugs and ideas to the right squad instantly.' }
    ],
    integrations: ['Productboard', 'Linear', 'Jira', 'Slack', 'Notion', 'Amplitude'],
    testimonial: {
      quote:
        'HeyForm removed the friction between research and delivery—logic, tagging, and exports are all in one place.',
      author: 'Ethan Morales',
      role: 'Lead Product Manager',
      company: 'Voyage'
    },
    primaryCta: { label: 'Start research workspace', href: '/sign-up' },
    secondaryCta: { label: 'Talk to a product specialist', href: '/contact/product' }
  },
  {
    id: 'operations',
    title: 'HR & Operations',
    subtitle: 'Secure workflows for internal teams',
    description:
      'Streamline onboarding, policy acknowledgments, and internal requests with SSO, audit logs, and granular permissions.',
    needs: [
      'Protect employee data with encryption, SSO, and advanced admin controls.',
      'Standardize recurring workflows with templates and approval routing.',
      'Keep stakeholders informed instantly via notifications and automations.'
    ],
    highlights: [
      {
        title: 'Enterprise-grade security',
        body: 'SOC 2, GDPR, SSO (Okta, Azure AD), IP allow‑lists, and audit trails built in.',
        bullets: ['Field-level encryption', 'Data residency controls']
      },
      {
        title: 'Operational consistency',
        body: 'Cloneable playbooks for onboarding, equipment requests, policy attestations, and more.',
        bullets: ['Multi-step approvals', 'Deadline reminders + escalations']
      },
      {
        title: 'Notifications & ownership',
        body: 'Notify managers, IT, and HR via Slack, Teams, or email automatically.',
        bullets: ['Conditional routing by department', 'Sync to HRIS or ITSM platforms']
      }
    ],
    stats: [
      { label: 'Onboarding time saved', value: '35%' },
      { label: 'Security controls', value: '20+' },
      { label: 'Global workspaces', value: '60+' }
    ],
    templates: [
      { name: 'New Hire Intake', description: 'Capture role, equipment, and compliance needs in one form.' },
      { name: 'Access & Equipment Request', description: 'Drive tickets into ITSM tools automatically.' },
      { name: 'Policy Acknowledgment', description: 'Track attestations with audit-ready exports.' }
    ],
    integrations: ['Okta', 'Azure AD', 'BambooHR', 'Workday', 'ServiceNow', 'Slack'],
    testimonial: {
      quote: 'We proved compliance readiness in record time and automated onboarding with zero custom code.',
      author: 'Hannah Liu',
      role: 'VP, People Operations',
      company: 'VistaCore'
    },
    primaryCta: { label: 'Review security controls', href: '/public/security' },
    secondaryCta: { label: 'Schedule compliance walkthrough', href: '/contact/security' }
  },
  {
    id: 'success',
    title: 'Customer Success',
    subtitle: 'NPS, onboarding, and playbooks that scale',
    description:
      'Deliver always-on feedback loops, proactive onboarding, and automated follow-ups that plug into your existing success stack.',
    needs: [
      'Capture health signals across the lifecycle with configurable surveys.',
      'Trigger personalized follow-ups via success tools like Gainsight, Zendesk, or Intercom.',
      'Give reps visibility with dashboards, alerts, and shared workspaces.'
    ],
    highlights: [
      {
        title: 'Lifecycle listening',
        body: 'Launch NPS, CSAT, onboarding checklists, and renewal readiness surveys with one toolkit.',
        bullets: ['Automated reminders + throttling', 'Segmented benchmarks']
      },
      {
        title: 'Success stack integrations',
        body: 'Sync responses to Gainsight, Catalyst, Zendesk, or any webhook to trigger playbooks.',
        bullets: ['Auto-create success tasks', 'Surface red flags in Slack']
      },
      {
        title: 'Customer-facing polish',
        body: 'Brand-safe experiences with conditional thank-you pages, embedded videos, and resource hubs.',
        bullets: ['Dynamic autoresponders', 'Localized experiences']
      }
    ],
    stats: [
      { label: 'Response rates boost', value: '+32%' },
      { label: 'Time to action', value: '<10 min' },
      { label: 'Playbooks automated', value: '50+' }
    ],
    templates: [
      { name: 'NPS + Follow-up', description: 'Route detractors to CSMs and auto-open Slack alerts.' },
      { name: 'Onboarding Checklist', description: 'Track every milestone with due dates and owners.' },
      { name: 'Renewal Risk Pulse', description: 'Catch churn signals before QBRs.' }
    ],
    integrations: ['Gainsight', 'Catalyst', 'Zendesk', 'Intercom', 'Salesforce', 'Slack'],
    testimonial: {
      quote: 'Auto-responders plus Slack alerts mean our team never misses a renewal risk or promoter opportunity.',
      author: 'Miguel Andrade',
      role: 'Director of Customer Success',
      company: 'Brighton'
    },
    primaryCta: { label: 'Launch NPS program', href: '/public/personas/customer-success' },
    secondaryCta: { label: 'Chat with Success Ops', href: '/contact/success' }
  }
]

export const homeFeatures = [
  {
    title: 'Visual builder + logic',
    description: 'Compose forms with drag-and-drop blocks, reusable sections, and limitless branching.',
    bullets: ['Question piping, scoring, and calculations', 'Reusable themes, variables, and layouts']
  },
  {
    title: 'Connect to every stack',
    description: 'Native integrations plus webhooks ensure submissions land exactly where your teams work.',
    bullets: ['Marketing, product, HR, and success integrations', 'Retry logic, mapping, and field validation']
  },
  {
    title: 'Insights & automation',
    description:
      'Dashboards surface conversion, sentiment, and SLA risks while automations handle follow-ups and alerts.',
    bullets: ['Analytics for drop-off and attribution', 'Autoresponders, tasks, and SLA escalations']
  }
]

export const homeStats = [
  { label: 'Teams building on HeyForm', value: '3,200+' },
  { label: 'Templates ready to launch', value: '180+' },
  { label: 'Avg. deployment time', value: '14 min' },
  { label: 'Integrations + webhooks', value: '60+' }
]

export const templateCollections = [
  {
    title: 'Demand Gen & Growth',
    description: 'Lead capture, paid media follow-up, and partner campaign templates.',
    templates: ['Lead Magnet Download', 'Event Signup', 'Partner Referral', 'Newsletter Waitlist']
  },
  {
    title: 'Product & Research',
    description: 'Customer discovery, feature validation, beta ops, and roadmap feedback.',
    templates: ['Product Feedback Loop', 'Beta Program Intake', 'UX Research Screener', 'Feature Prioritization']
  },
  {
    title: 'People Ops & Success',
    description: 'Employee workflows, onboarding, NPS, support escalations, and renewal playbooks.',
    templates: ['New Hire Checklist', 'Equipment Request', 'NPS + CSAT', 'Renewal Risk Pulse']
  }
]

export const integrationShowcase = [
  {
    category: 'Marketing Automation',
    description: 'Sync leads, track attribution, and trigger nurture flows.',
    items: ['HubSpot', 'Marketo', 'Pardot', 'Customer.io', 'Mailchimp', 'Segment']
  },
  {
    category: 'Product & Data',
    description: 'Push insights straight into PLG and analytics stacks.',
    items: ['Productboard', 'Linear', 'Amplitude', 'Mixpanel', 'Notion', 'Snowflake']
  },
  {
    category: 'Operations & Success',
    description: 'Keep HRIS, ITSM, and CS platforms in sync.',
    items: ['Workday', 'BambooHR', 'ServiceNow', 'Zendesk', 'Gainsight', 'Slack']
  }
]

export const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    cadence: 'per workspace / month',
    description: 'Launch beautiful forms with core automations and unlimited responses.',
    features: ['All templates + builder', 'Basic logic + piping', '5 native integrations', 'Email + Slack alerts'],
    ctaLabel: 'Start for free'
  },
  {
    name: 'Growth',
    price: '$99',
    cadence: 'per workspace / month',
    description: 'Scale campaigns, research, and customer programs with advanced logic & analytics.',
    features: [
      'Unlimited integrations + webhooks',
      'Advanced logic, scoring, and calculations',
      'Collaboration + approval flows',
      'Analytics & attribution dashboards'
    ],
    ctaLabel: 'Get a demo'
  },
  {
    name: 'Scale',
    price: 'Custom',
    cadence: 'annual agreement',
    description: 'Enterprise-grade security, governance, and dedicated success support.',
    features: [
      'SSO (SAML/OIDC) + SCIM',
      'Field-level encryption + audit logs',
      'Custom data retention & residency',
      'Dedicated CSM + solution architect'
    ],
    ctaLabel: 'Contact sales'
  }
]
