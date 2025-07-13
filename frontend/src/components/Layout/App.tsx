// frontend/src/contexts/AppContext
import React from 'react'
import MainLayout from './MainLayout'
import { DialogProvider } from '../../contexts/DialogContext'
import { AppSettingsProvider } from '../Settings/AppSettings'

/**
 * Entry point in the entire app. Does the following functions:
 * 
 *  - App Initialization State
 *  - Global Error Boundaries
 *  - Startup Sequence Management
 *  - Loading states for app boot
 */
const App = () => {
    return (
        <AppSettingsProvider>
            <DialogProvider>
                <MainLayout />
            </DialogProvider>
        </AppSettingsProvider>
    )
}

export default App