// frontend/src/components/ui/GenericDialog
import React, { ReactNode } from 'react'
import { Dialog, DialogContent } from '../../../shadcn/ui/dialog'
import { useDialog } from '../../contexts/DialogContext'

interface GenericDialogProps {
    children: ReactNode
    isOpen: boolean
    onClose?: () => void
    className?: string
}

export const GenericDialog: React.FC<GenericDialogProps> = ({
    children,
    isOpen,
    onClose,
    className = "sm:max-w-md"
}) => {
    const { closeDialog } = useDialog()

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose?.()
            closeDialog()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className={className}>
                {children}
            </DialogContent>
        </Dialog>
    )
}