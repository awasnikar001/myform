import { IconBrandGithub, IconBrandLinkedin, IconBrandTwitter } from '@tabler/icons-react'
import { FC } from 'react'
import { Link } from 'react-router-dom'

import Logo from '@/assets/logo.svg?react'

export const Footer: FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">HeyForm</span>
            </div>
            <p className="text-sm text-slate-400">
              Build beautiful forms in minutes. No coding required.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-2">
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
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2">
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
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Newsletter</h3>
            <p className="mb-4 text-sm text-slate-400">
              Get the latest updates and form building tips.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-600 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between border-t border-slate-800 pt-8 md:flex-row">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} HeyForm. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 md:mt-0">
            <a
              href="#"
              className="text-slate-400 transition-colors hover:text-white"
              aria-label="Twitter"
            >
              <IconBrandTwitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-slate-400 transition-colors hover:text-white"
              aria-label="LinkedIn"
            >
              <IconBrandLinkedin className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-slate-400 transition-colors hover:text-white"
              aria-label="GitHub"
            >
              <IconBrandGithub className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
