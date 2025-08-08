// frontend/src/components/dialogs/VaultSelectorDialog.tsx
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

const newDirectorySchema = z.object({
    directory: z.string().min(2, { message: 'Directory name is required' }),
})

interface NewDirectoryDialogProps {
    directoryPath?: string;
}

export const NewDirectoryDialog: React.FC<NewDirectoryDialogProps> = ({ directoryPath }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true)
    const { closeDialog } = useDialog()
    const { createNewDirectory } = useFileSystem()

    const form = useForm<z.infer<typeof newDirectorySchema>>({
        resolver: zodResolver(newDirectorySchema),
        defaultValues: {
            directory: '',
        }
    })

    const onSubmit = (values: z.infer<typeof newDirectorySchema>) => {
        if (invalidCharactersExist(values.directory)) {
            form.setError('directory', { message: `Directory name contains invalid characters: ${INVALID_CHARACTERS_STRING}` })
            return
        }
        createNewDirectory(values.directory, directoryPath)
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
                    New Directory
                </DialogTitle>
                <DialogDescription>
                    Create a new directory in the current vault.
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="directory"
                            render={({ field }) => (
                                <FormItem className="my-4">
                                    <FormControl>
                                        <Input placeholder="Directory Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="secondary">Create Directory</Button>
                    </form>
                </Form>
            </DialogHeader>
        </GenericDialog>
    )
}