// frontend/src/components/Settings/types
export interface WindowState {
    width: number
    height: number
    x?: number
    y?: number
    maximized?: boolean
}

type Theme = 'light' | 'dark' | 'system'

export interface UserPreferences {
    theme: Theme
    // add more user preferences here
}

export interface AppStoreType {
    // core app state
    vaultPath: string | undefined
    // selectedFile: string | undefined
    // recentFiles: string[]
    // recentVaults: string[]

    // // user preferences
    // windowState: WindowState
    // preferences: UserPreferences

    // // actions
    setVaultPathFn: (path: string | undefined) => Promise<void>
    // setSelectedFile: (path: string | undefined) => void
    // addRecentFile: (path: string) => void
    // addRecentVault: (path: string) => void
    // updatePreferences: (updates: Partial<UserPreferences>) => void
    // updateWindowState: (state: Partial<WindowState>) => void

    // // utility
    // isLoaded: boolean
    // clearAllData: () => void
}