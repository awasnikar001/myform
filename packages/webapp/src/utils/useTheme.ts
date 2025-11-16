import { useLocalStorageState } from 'ahooks'
import { useCallback, useEffect } from 'react'

import { APPEARANCE_STORAGE_KEY } from '@/consts'

type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  const [appearance, setAppearance] = useLocalStorageState<ThemeMode>(APPEARANCE_STORAGE_KEY, {
    defaultValue: 'light',
    listenStorageChange: true
  })

  const handleChange = useCallback(
    ({ matches }: { matches: boolean }) => {
      let value = appearance

      if (appearance === 'system') {
        value = matches ? 'dark' : 'light'
      }

      if (value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    [appearance]
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [handleChange])

  useEffect(() => {
    handleChange({
      matches: appearance === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches
    })
  }, [appearance, handleChange])

  const toggleTheme = useCallback(() => {
    setAppearance(prev => (prev === 'light' ? 'dark' : 'light'))
  }, [setAppearance])

  const isDark = useCallback(() => {
    if (appearance === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return appearance === 'dark'
  }, [appearance])

  return {
    appearance,
    setAppearance,
    toggleTheme,
    isDark: isDark()
  }
}
