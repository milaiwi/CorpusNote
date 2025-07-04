// frontend/src/contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({children}: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('system')
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark')

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme
        if (savedTheme) {
            setTheme(savedTheme)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('theme', theme)

        const root = window.document.documentElement
        root.classList.remove('light', 'dark')

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme)
            setActualTheme(systemTheme)
        } else {
            root.classList.add(theme)
            setActualTheme(theme)
        }
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}