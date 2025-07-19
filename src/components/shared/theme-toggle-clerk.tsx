'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { UserButton } from '@clerk/nextjs'

export const ThemeToggleItem = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // avoid hydration mismatch

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <UserButton.Action
      label={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
      labelIcon={
        resolvedTheme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )
      }
      onClick={toggleTheme}
    />
  )
}
