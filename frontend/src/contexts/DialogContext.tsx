// frontend/src/contexts/DialogContext
import React, { createContext, ReactNode, useContext, useState } from 'react'

interface DialogContextType {
    openDialog: (component: ReactNode) => void
    closeDialog: () => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export const DialogProvider = ({ children }: { children: ReactNode }) => {
    const [dialogComponent, setDialogComponent] = useState<ReactNode | null>(null);

    const openDialog = (component: ReactNode ) => {
        setDialogComponent(component)
    }

    const closeDialog = () => {
        setDialogComponent(null)
    }

    return (
        <DialogContext.Provider value={{ openDialog, closeDialog }}>
            {children}
            {dialogComponent}
        </DialogContext.Provider>
    )
}

export const useDialog = () => {
    const context = useContext(DialogContext)
    if (context === undefined)
        throw new Error('useDialog must be used within a DialogProvider')
    return context
}