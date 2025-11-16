import { IconMoon, IconSun } from '@tabler/icons-react'
import { FC } from 'react'

import { useTheme } from '@/utils'

import { Button } from '@/components'

const ThemeToggle: FC = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <Button.Link
      iconOnly
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
    </Button.Link>
  )
}

export default ThemeToggle
