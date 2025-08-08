// frontend/src/components/dialogs/NewNoteDialog.tsx
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
import { INVALID_CHARACTERS_STRING, invalidCharactersExist } from '../../../lib/utils'

const newNoteSchema = z.object({
    title: z.string().min(2, { message: 'Title is required' }),
})

interface NewNoteDialogProps {
    directoryPath?: string;
}

export const NewNoteDialog: React.FC<NewNoteDialogProps> = ({ directoryPath }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true)
    const { closeDialog } = useDialog()
    const { createNewNote } = useFileSystem()

    const form = useForm<z.infer<typeof newNoteSchema>>({
        resolver: zodResolver(newNoteSchema),
        defaultValues: {
            title: '',
        }
    })

    const onSubmit = (values: z.infer<typeof newNoteSchema>) => {
        if (invalidCharactersExist(values.title)) {
            form.setError('title', { message: `Title contains invalid characters: ${INVALID_CHARACTERS_STRING}` })
            return
        }

        createNewNote(values.title, directoryPath)
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
                    New Note
                </DialogTitle>
                <DialogDescription>
                    Create a new note in the current vault.
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="my-4">
                                    <FormControl>
                                        <Input placeholder="Note Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="secondary">Create Note</Button>
                    </form>
                </Form>
            </DialogHeader>
        </GenericDialog>
    )
}