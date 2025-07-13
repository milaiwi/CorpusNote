// frontend/src/components/Settings/AppSettings
import React, { createContext, useContext, useEffect, useState } from 'react'
import { AppStoreType } from './types'
import TauriStore from './TauriStore'

const AppContext = createContext<AppStoreType | undefined>(undefined)

export const AppSettingsProvider = ({children}: { children: React.ReactNode }) => {
    const [store] = useState(() => new TauriStore())
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    // State
    const [vaultPath, setVaultPath] = useState<string | undefined>(undefined)

    useEffect(() => {
        const loadInitialVals = async () => {
            try {
                const [
                    savedVaultPath
                ] = await Promise.all([
                    store.get<string>('vaultPath')
                ])

                console.log(`get path: ${savedVaultPath}`)
                setVaultPathFn(savedVaultPath)
            } catch (error) {
                console.error(`Error is ${error}`)
            } finally {
                setIsLoaded(true)
            }
        }

        loadInitialVals()
    }, [store])

    const setVaultPathFn = async (path: string | undefined) => {
        console.log(`Store is`, store)
        console.log(`setting path: ${path}`)
        setVaultPath(path)
        await store.set('vaultPath', path)
    }

    const contextValue: AppStoreType = {
        vaultPath,
        setVaultPathFn
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppSettings = () => {
    const context = useContext(AppContext)
    if (context === undefined)
        throw new Error('useAppSettings must be used within an AppSettingsProvider')
    return context
}