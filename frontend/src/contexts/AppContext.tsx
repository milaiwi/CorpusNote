// frontend/src/contexts/AppContext
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AppContextType {
    vaultPath: string,
    setVaultPath: (path: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [vaultPath, setVaultPath] = useState<string>('/Users/milaiwi/documents/notes')

    return (
        <AppContext.Provider value={{ vaultPath, setVaultPath }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppSettings = () => {
    const context = useContext(AppContext)
    if (context === undefined)
        throw new Error('useApp must be used within a AppProvider')
    return context
}