// frontend/src/components/ui/GenericDialog
import React, { ReactNode } from 'react'
import { Dialog, DialogContent } from '../../../shadcn/ui/dialog'

interface GenericDialogProps {
    children: ReactNode
    isOpen: boolean
    onOpenChange?: (open: boolean) => void
    className?: string
}

export const GenericDialog: React.FC<GenericDialogProps> = ({
    children,
    isOpen,
    onOpenChange,
    className = "sm:max-w-md"
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={className}>
                {children}
            </DialogContent>
        </Dialog>
    )
}