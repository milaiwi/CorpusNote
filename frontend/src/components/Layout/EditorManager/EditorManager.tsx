// frontend/src/components/Layout/EditorManager/EditorManager.tsx
"use client"
import { BlockNoteView } from '@blocknote/mantine'
import { BlockNoteEditor } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import '@blocknote/core/fonts/inter.css'
import './editor.css'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useFileSystem } from '../../../contexts/FileSystemContext'
import { Loader2 } from 'lucide-react'
import MarkdownTransformer from './lib/MarkdownTransformer'
import { FileItem } from '../FileSidebar/utils'

interface EditorManagerProps {
    selectedFile: FileItem | null;
}

const EditorManager: React.FC<EditorManagerProps> = ({ selectedFile }) => {
    const {
        editorContent,
        changingFilePath,
        currentOpenedFile,
        loadFileIntoEditor,
        saveFileFromEditor,
    } = useFileSystem()

    const editor = useCreateBlockNote()
    const markdownTransformer = useMemo(() => new MarkdownTransformer(editor), [editor])

    const isInitialLoad = useRef<boolean>(false)

    useEffect(() => {
        if (changingFilePath) return

        const loadMarkdownContent = async () => {
            isInitialLoad.current = true
            const blocks = await markdownTransformer.parse(editorContent)
            editor.replaceBlocks(editor.document, blocks)
        }

        loadMarkdownContent()
    }, [changingFilePath, editorContent])

    useEffect(() => {
        const fetchFile = async () => {
            if (!selectedFile) return

            // Before loading the new file, we need to save the current opened file
            if (editor.document.length > 0 && currentOpenedFile?.isDirty) {
                const markdown = await markdownTransformer.serialize(editor.document)
                saveFileFromEditor(markdown)
            } else {
                console.log('No changes to save')
            }

            loadFileIntoEditor(selectedFile)
        }

        fetchFile()
    }, [changingFilePath, selectedFile])

    const handleEditorChange = (editor: BlockNoteEditor, { getChanges }) => {
        // Ignores the initial editorChange that gets triggered from loading the file
        if (isInitialLoad.current) {
            isInitialLoad.current = false
            return
        }

        if (!currentOpenedFile) return

        const changes = getChanges()
        if (changes.length > 0 && !currentOpenedFile?.isDirty) {
            currentOpenedFile!.isDirty = true
        }
    }

    if (changingFilePath || !editor) {
        return (
            <div className='w-full h-full flex items-center justify-center'>
                <Loader2 className='w-4 h-4 animate-spin' />
            </div>
        )
    }
    
    return (
        <div className='w-full h-full'>
            <BlockNoteView editor={editor} onChange={handleEditorChange} />
        </div>
    )
}

export default EditorManager