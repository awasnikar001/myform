import { IconBrandGithub, IconBrandLinkedin, IconBrandTwitter } from '@tabler/icons-react'
import { FC } from 'react'

import Logo from '@/assets/logo.svg?react'

export const Footer: FC = () => {
  return (
    <footer className="border-t border-white/10 bg-black pb-10 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
          {/* Logo & Tagline */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Logo className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">LyticsForm</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Build beautiful, conversational forms that your users will actually enjoy filling out.
              No coding required.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all hover:-translate-y-1 hover:bg-white hover:text-black"
                aria-label="Twitter"
              >
                <IconBrandTwitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all hover:-translate-y-1 hover:bg-white hover:text-black"
                aria-label="LinkedIn"
              >
                <IconBrandLinkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all hover:-translate-y-1 hover:bg-white hover:text-black"
                aria-label="GitHub"
              >
                <IconBrandGithub className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white">
              Product
            </h3>
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('benefits')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.getElementById('pricing')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Pricing
                </button>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Templates
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white">
              Stay Updated
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              Get the latest updates and form building tips delivered to your inbox.
            </p>
            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all placeholder:text-slate-500 focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:bg-slate-200 active:scale-[0.98]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} LyticsForm Inc. All rights reserved.
          </p>
          <div className="mt-4 flex gap-6 md:mt-0">
            <span className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
