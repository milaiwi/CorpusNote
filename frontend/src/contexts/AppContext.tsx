// frontend/src/contexts/AppContext
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'
import { SettingsRepository } from '../../../backend/domain/settings/SettingsRepository'
import TauriStoreAdapter from '../../../backend/api/TauriStoreAdapter'
import { Settings } from '../../../backend/domain/settings/schema'
import { createDir, exists } from '@tauri-apps/api/fs'
import { join } from '@tauri-apps/api/path'


interface AppContextType {
    vaultPath: string,
    setVaultPath: (path: string) => void
    settings: Settings
    updateSettings: (patch: Partial<Omit<Settings, "version">>) => Promise<void>
    resetSettings: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [vaultPath, setVaultPath] = useState<string>('/Users/milaiwi/documents/notes')
    const [settings, setSettings] = useState<Settings>()

    const repo = useMemo(() => {
        return new SettingsRepository(new TauriStoreAdapter())
    }, [])

    useEffect(() => {
        const createCorpusDir = async () => {
            const corpusDir = await join(vaultPath, '.corpus-notes')
            const dirExists = await exists(corpusDir)
            console.log(`Corpus directory exists: ${dirExists}`)
            if (!dirExists) {
                await createDir(corpusDir)
            }
        }
        
        createCorpusDir()
    }, [vaultPath])

    // Set up watch and init our settings state
    useEffect(() => {
        let unlisten = () => {};
        (async () => {
          const s = await repo.load();
          setSettings(s);
          unlisten = repo.watch?.((next) => setSettings(next)) ?? (() => {});
        })();
        return () => unlisten();
      }, [repo]);

    // Update settings state and persist to disk
    const updateSettings = async (patch: Partial<Omit<Settings, "version">>) => {
        const next = await repo.update(patch)
        setVaultPath(next.vaultPath)
    }

    // Reset settings to default
    const resetSettings = async () => {
        const next = await repo.reset()
        setVaultPath(next.vaultPath)
    }

    const value = useMemo(() => ({ vaultPath, setVaultPath, settings, updateSettings, resetSettings }), [settings]);

    return (
        <AppContext.Provider value={value}>
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