import { LayoutProps } from '@heyooo-inc/react-router'
import { FC, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

import Logo from '@/assets/logo.svg?react'
import { personaContent } from '@/content/public'
import { cn } from '@/utils'

const NAV_LINKS = [
  { label: 'Overview', href: '/public' },
  { label: 'Features', href: '/public/features' },
  { label: 'Templates', href: '/public/templates' },
  { label: 'Integrations', href: '/public/integrations' },
  { label: 'Pricing', href: '/public/pricing' }
]

export const PublicLayout: FC<LayoutProps> = ({ options, children }) => {
  const location = useLocation()

  useEffect(() => {
    document.title = options?.metaTitle ?? 'HeyForm — Customer-ready forms'
  }, [options?.metaTitle])

  return (
    <div className="bg-foreground text-primary">
      <header className="border-input/60 sticky top-0 z-20 border-b bg-foreground/95 backdrop-blur supports-[backdrop-filter]:bg-foreground/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/public" className="flex items-center gap-2" title="HeyForm">
            <Logo className="h-7 w-auto" />
            <span className="text-lg font-semibold tracking-tight">HeyForm</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-secondary sm:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  'transition-colors hover:text-primary',
                  location.pathname === href && 'text-primary'
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/public#solutions"
              className={cn(
                'transition-colors hover:text-primary',
                location.pathname.startsWith('/public/personas') && 'text-primary'
              )}
            >
              Solutions
            </Link>
          </nav>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Link to="/login" className="text-secondary transition-colors hover:text-primary">
              Log in
            </Link>
            <a
              href="/sign-up"
              className="bg-primary text-primary-light inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-opacity-85 sm:text-sm"
            >
              Start free trial
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:gap-20 sm:px-6 sm:py-16 lg:gap-24 lg:px-8 lg:py-20">
        {children}
      </main>

      <footer className="border-input/60 border-t bg-background/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-auto" />
              <span className="text-base font-semibold">HeyForm</span>
            </div>
            <p className="text-secondary text-sm leading-relaxed">
              Build secure, high-converting form experiences for every customer-facing team.
            </p>
            <div className="text-secondary/90 text-xs">
              © {new Date().getFullYear()} HeyForm. All rights reserved.
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link to={href} className="transition-colors hover:text-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Solutions</p>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              {personaContent.map((persona) => (
                <li key={persona.id}>
                  <Link
                    to={`/public/personas/${persona.id}`}
                    className="transition-colors hover:text-primary"
                  >
                    {persona.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Get in touch</p>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              <li>
                <a className="transition-colors hover:text-primary" href="/contact/sales">
                  Contact sales
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="/contact/support">
                  Support
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-primary" href="mailto:hello@heyform.com">
                  hello@heyform.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
