// frontend/src/components/ui/ThemeToggle.tsx
import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { SidebarIconButton } from './SidebarButton'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return Sun
      case 'dark':
        return Moon
      default:
        return Sun
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to Dark Mode'
      case 'dark':
        return 'Switch to System Theme'
      default:
        return 'Toggle Theme'
    }
  }

  return (
    <SidebarIconButton
      icon={getIcon()}
      label={getLabel()}
      onClick={toggleTheme}
    />
  )
}