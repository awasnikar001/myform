import { IconMenu2, IconX } from '@tabler/icons-react'
import { FC, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { cn, getAuthState } from '@/utils'

import Logo from '@/assets/logo.svg?react'

export const Navbar: FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const navigate = useNavigate()
  const isLoggedIn = getAuthState()

  const handleSignUp = () => {
    setIsNavigating(true)
    navigate('/sign-up')
  }

  const handleApp = () => {
    setIsNavigating(true)
    navigate('/app')
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { label: 'Features', action: () => scrollToSection('benefits') },
    { label: 'Pricing', action: () => scrollToSection('pricing') },
    { label: 'Testimonials', action: () => scrollToSection('testimonials') },
    { label: 'FAQ', action: () => scrollToSection('faq') }
  ]

  return (
    <nav
      className={cn('fixed left-0 right-0 top-0 z-50 transition-all duration-500', {
        'border-b border-white/5 bg-black/50 backdrop-blur-xl': scrolled,
        'bg-transparent': !scrolled
      })}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors group-hover:border-white/20">
              <Logo className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LyticsForm</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={link.action}
                aria-label={`Navigate to ${link.label} section`}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
              </button>
            ))}
            {isLoggedIn ? (
              <button
                onClick={handleApp}
                disabled={isNavigating}
                className={cn(
                  'relative overflow-hidden rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-transform hover:scale-105 active:scale-95',
                  {
                    'cursor-not-allowed opacity-50': isNavigating
                  }
                )}
              >
                {isNavigating ? 'Loading...' : 'Go to App'}
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Login
                </Link>
                <button
                  onClick={handleSignUp}
                  disabled={isNavigating}
                  className={cn(
                    'group relative overflow-hidden rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 active:scale-95',
                    {
                      'cursor-not-allowed opacity-50': isNavigating
                    }
                  )}
                >
                  <span className="relative z-10">
                    {isNavigating ? 'Loading...' : 'Get Started'}
                  </span>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-500 group-hover:opacity-10" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/5 md:hidden"
          >
            {mobileMenuOpen ? <IconX className="h-6 w-6" /> : <IconMenu2 className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xl md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu */}
            <div className="animate-fade-in-up fixed inset-x-4 top-24 z-50 rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl md:hidden">
              <div className="flex flex-col gap-6">
                {navLinks.map(link => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    aria-label={`Navigate to ${link.label} section`}
                    className="text-left text-lg font-medium text-slate-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="h-px bg-white/10" />
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleApp()
                      setMobileMenuOpen(false)
                    }}
                    disabled={isNavigating}
                    className="w-full rounded-xl bg-white py-3 text-center font-medium text-black"
                  >
                    {isNavigating ? 'Loading...' : 'Go to App'}
                  </button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link
                      to="/login"
                      className="text-center text-lg font-medium text-slate-300 transition-colors hover:text-white"
                    >
                      Login
                    </Link>
                    <button
                      onClick={() => {
                        handleSignUp()
                        setMobileMenuOpen(false)
                      }}
                      disabled={isNavigating}
                      className="w-full rounded-xl bg-white py-3 text-center font-medium text-black shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                    >
                      {isNavigating ? 'Loading...' : 'Get Started Free'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
