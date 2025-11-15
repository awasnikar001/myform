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
      setScrolled(window.scrollY > 50)
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
      className={cn(
        'sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md transition-all duration-300',
        {
          'border-white/20 bg-slate-950/95': scrolled
        }
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">LyticsForm</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={link.action}
                aria-label={`Navigate to ${link.label} section`}
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                {link.label}
              </button>
            ))}
            {isLoggedIn ? (
              <button
                onClick={handleApp}
                disabled={isNavigating}
                className={cn(
                  'btn-ripple animate-gradient rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20',
                  {
                    'cursor-not-allowed opacity-50': isNavigating
                  }
                )}
              >
                {isNavigating ? 'Loading...' : 'Go to App'}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  Login
                </Link>
                <button
                  onClick={handleSignUp}
                  disabled={isNavigating}
                  className={cn(
                    'rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20',
                    {
                      'cursor-not-allowed opacity-50': isNavigating
                    }
                  )}
                >
                  {isNavigating ? 'Loading...' : 'Get Started Free'}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="text-slate-300 md:hidden"
          >
            {mobileMenuOpen ? <IconX className="h-6 w-6" /> : <IconMenu2 className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Menu */}
            <div className="relative z-50 border-t border-white/10 py-4 md:hidden">
              <div className="flex flex-col gap-4">
                {navLinks.map(link => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    aria-label={`Navigate to ${link.label} section`}
                    className="text-left text-sm font-medium text-slate-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                ))}
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleApp()
                      setMobileMenuOpen(false)
                    }}
                    disabled={isNavigating}
                    className={cn(
                      'rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105',
                      {
                        'cursor-not-allowed opacity-50': isNavigating
                      }
                    )}
                  >
                    {isNavigating ? 'Loading...' : 'Go to App'}
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                    >
                      Login
                    </Link>
                    <button
                      onClick={() => {
                        handleSignUp()
                        setMobileMenuOpen(false)
                      }}
                      disabled={isNavigating}
                      className={cn(
                        'rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105',
                        {
                          'cursor-not-allowed opacity-50': isNavigating
                        }
                      )}
                    >
                      {isNavigating ? 'Loading...' : 'Get Started Free'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
