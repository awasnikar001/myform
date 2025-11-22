import Router, { Route } from '@heyooo-inc/react-router'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as Sentry from '@sentry/react'
import { ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { getAuthState, getDeviceId, setCookie, setDeviceId } from '@/utils'

import { Toaster } from '@/components'
import { REDIRECT_COOKIE_NAME } from '@/consts'
import '@/i18n'
import { AuthLayout } from '@/layouts'
import routes from '@/routes'
import '@/styles/globals.scss'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when an error occurs.
})

if (!getDeviceId()) {
  setDeviceId()
}

const Fallback = () => {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <h1 className="text-center text-2xl font-semibold">{t('components.error.title')}</h1>
      <p className="text-secondary text-center text-sm/6">{t('components.error.message')}</p>
    </AuthLayout>
  )
}

const App = () => {
  function render(options?: any, children?: ReactNode) {
    const isLoggedIn = getAuthState()

    if (options?.loginRequired) {
      if (!isLoggedIn) {
        const redirectUri = window.location.pathname + window.location.search

        setCookie(REDIRECT_COOKIE_NAME, redirectUri, {})
        return <Navigate to="/login" replace />
      }
    } else {
      if (isLoggedIn && options?.redirectIfLogged) {
        return <Navigate to="/app" replace />
      } else {
        return children
      }
    }
  }

  return (
    <ErrorBoundary fallback={<Fallback />}>
      <HelmetProvider>
        <Tooltip.Provider>
          <Router routes={routes as Route[]} render={render} />
        </Tooltip.Provider>
      </HelmetProvider>
      <Toaster />
    </ErrorBoundary>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
