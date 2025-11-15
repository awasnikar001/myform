import { IconChecks, IconLayoutDashboard, IconWand, IconWorkflow } from '@tabler/icons-react'

const featureSets = [
  {
    title: 'Builder & Branding',
    description:
      'Drag-and-drop blocks, reusable sections, and theme controls keep every form perfectly on brand.',
    icon: IconLayoutDashboard,
    bullets: [
      'Reusable content blocks, layouts, and variables',
      'Advanced typography + color tokens',
      'Media-rich thank-you pages and follow-up screens'
    ]
  },
  {
    title: 'Logic & Personalization',
    description:
      'Branching, question piping, scoring, and calculations tailor every response journey for higher completion rates.',
    icon: IconWorkflow,
    bullets: [
      'Unlimited branching depth and nested groups',
      'Question piping + dynamic values',
      'Conditional notifications and autoresponders'
    ]
  },
  {
    title: 'Automation & Insights',
    description:
      'Route submissions, trigger SLAs, and surface analytics automatically so teams act within minutes.',
    icon: IconWand,
    bullets: [
      'Native integrations + advanced webhooks with retries',
      'Conversion, attribution, and completion analytics',
      'Auto-tagging, sentiment, and AI-powered summaries'
    ]
  }
]

const collaborationHighlights = [
  'Granular roles for marketing, product, ops, and contractors',
  'Approval flows to lock templates before publishing',
  'Field-level audit logs with exportable history',
  'Workspace and project-level permissions',
  'Environment controls for staging vs. production embeddables'
]

const FeaturePage = () => {
  return (
    <div className="space-y-16">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Features</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight">
          Everything teams need to design, automate, and scale forms that convert.
        </h1>
        <p className="text-secondary mt-4 text-lg leading-relaxed">
          From campaign-ready templates to enterprise governance, HeyForm brings marketing-grade polish and
          IT-grade control under one workspace.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {featureSets.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-input/60 bg-background/70 p-6">
            <feature.icon className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">{feature.title}</h2>
            <p className="text-secondary mt-2">{feature.description}</p>
            <ul className="text-secondary mt-4 space-y-2 text-sm">
              {feature.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <IconChecks className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-input/60 bg-gradient-to-br from-background to-background/60 p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Collaboration</p>
            <h2 className="mt-2 text-3xl font-semibold">Built for multi-team governance</h2>
            <p className="text-secondary mt-2">
              Workspaces keep forms, templates, and integrations organized while permissions ensure teams
              move fast without compromising security.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-secondary">
            {collaborationHighlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-input/60 bg-background/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Analytics</p>
          <h2 className="mt-2 text-2xl font-semibold">Conversion + drop-off analytics</h2>
          <p className="text-secondary mt-2">
            Identify friction by device, channel, field, or cohort. Export raw data or push insights to your
            BI stack for modeling.
          </p>
          <ul className="text-secondary mt-4 list-disc space-y-1 pl-4 text-sm">
            <li>Completion, time-to-finish, and fall-off per question</li>
            <li>UTM + campaign attribution with source of truth exports</li>
            <li>Benchmarking across teams and template versions</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-input/60 bg-background/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Security</p>
          <h2 className="mt-2 text-2xl font-semibold">Enterprise-grade protection</h2>
          <p className="text-secondary mt-2">
            SOC 2 Type II controls, encryption at rest/in transit, SSO/SCIM, audit logs, and configurable data
            retention keep compliance teams confident.
          </p>
          <ul className="text-secondary mt-4 list-disc space-y-1 pl-4 text-sm">
            <li>SSO (Okta, Azure AD, Google, custom SAML) + SCIM provisioning</li>
            <li>Field-level encryption and secure file handling</li>
            <li>IP allowlists, domain restrictions, and spam protection</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default FeaturePage
