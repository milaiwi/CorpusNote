// frontend/src/components/dialogs/RenameDialog.tsx
import React, { useState } from 'react'

import { DialogDescription, DialogHeader, DialogTitle } from '../../../shadcn/ui/dialog'
import { GenericDialog } from '../ui/GenericDialog'
import { useDialog } from '../../contexts/DialogContext'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'

import { Button } from '../../../shadcn/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '../../../shadcn/ui/form'
import { Input } from '../../../shadcn/ui/input'
import { useFileSystem } from '../../contexts/FileSystemContext'
import { FileItem } from '../layout/FileSidebar/utils'
import { extractFileName } from '../../../lib/utils'

interface RenameDialogProps {
    item: FileItem
}

const renameNoteSchema = z.object({
    title: z.string().min(2, { message: 'Title is required' }),
})

export const RenameDialog: React.FC<RenameDialogProps> = ({ item }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true)
    const { closeDialog } = useDialog()
    const { handleRename } = useFileSystem()

    const form = useForm<z.infer<typeof renameNoteSchema>>({
        resolver: zodResolver(renameNoteSchema),
        defaultValues: {
            title: extractFileName(item.name),
        }
    })

    const onSubmit = (values: z.infer<typeof renameNoteSchema>) => {
        const [success, error] = handleRename(item.absPath, values.title)
        if (!success) {
            form.setError('title', { message: error })
            return
        }
        closeDialog()
    }

    return (
        <GenericDialog isOpen={isOpen} onOpenChange={(open) => {
            if (!open) {
                closeDialog()
            }
        }}>
            <DialogHeader className="gap-2">
                <DialogTitle className="flex items-center">
                    Rename Note
                </DialogTitle>
                <DialogDescription>
                    Rename the note
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="my-4">
                                    <FormControl>
                                        <Input placeholder="Rename Note" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="secondary">Rename Note</Button>
                    </form>
                </Form>
            </DialogHeader>
        </GenericDialog>
    )
}