import { LayoutProps } from '@heyooo-inc/react-router'
import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { cn, useTheme } from '@/utils'
import { helper } from '@heyform-inc/utils'

import Logo from '@/assets/logo.svg?react'

import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'

export const AuthLayout: FC<LayoutProps> = ({ options, children }) => {
  const { t } = useTranslation()
  const { isDark } = useTheme()

  useEffect(() => {
    if (helper.isValid(options?.title)) {
      document.title = `${t(options!.title)} - LyticsForm`
    }
  }, [options, t])

  return (
    <div
      className={cn(
        'bg-foreground flex min-h-screen flex-col',
        !isDark && 'glass-background mesh-pattern'
      )}
    >
      <div
        className={cn(
          'bg-foreground sticky top-0 flex items-center justify-between p-4',
          !isDark && 'glass-card-subtle'
        )}
      >
        <a href="/" className="flex items-center gap-2" title="LyticsForm">
          <Logo className="h-8 w-auto" />
          <span className="text-xl font-medium">LyticsForm</span>
        </a>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center p-4 lg:p-12">{children}</div>
    </div>
  )
}
