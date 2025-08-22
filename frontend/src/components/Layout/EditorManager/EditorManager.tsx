// frontend/src/components/Layout/EditorManager/EditorManager.tsx
"use client"
import { BlockNoteView } from '@blocknote/mantine'
import { BlockNoteEditor } from '@blocknote/core'
import '@blocknote/mantine/style.css'
import '@blocknote/core/fonts/inter.css'
import './editor.css'

import React, { useEffect, useRef } from 'react'
import { useFileSystem } from '../../../contexts/FileSystemContext'
import { Loader2 } from 'lucide-react'
import { useAIContext } from '../../../contexts/AIContext'


const EditorManager = () => {
    const {
        editorInitialBlocks,
        editorInitialMarkdown,
        changingFilePath,
        currentOpenedFile,
        loadFileIntoEditor,
        saveFileFromEditor,
    } = useFileSystem()

    const { editor } = useAIContext()

    const isInitialLoad = useRef<boolean>(false)

    useEffect(() => {
        if (changingFilePath) return

        const loadMarkdownContent = async () => {
            isInitialLoad.current = true
            if (editorInitialBlocks) {
                editor.replaceBlocks(editor.document, editorInitialBlocks)
            } else {
                const blocks = await editor.tryParseMarkdownToBlocks(editorInitialMarkdown)
                editor.replaceBlocks(editor.document, blocks)
            }
        }

        loadMarkdownContent()
    }, [changingFilePath, editor, editorInitialBlocks, editorInitialMarkdown])

    useEffect(() => {
        const fetchFile = async () => {
            if (!currentOpenedFile) return

            // Before loading the new file, we need to save the current opened file
            if (editor.document.length > 0 && currentOpenedFile?.isDirty) {
                const markdown = await editor.blocksToMarkdownLossy(editor.document)
                saveFileFromEditor(editor.document, markdown)
            } else {
                console.log('No changes to save')
            }

            loadFileIntoEditor(currentOpenedFile)
        }

        fetchFile()
    }, [changingFilePath, currentOpenedFile])

    const handleEditorChange = (editor: BlockNoteEditor, { getChanges }) => {
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
            <BlockNoteView editor={editor} onChange={handleEditorChange}/>
        </div>
    )
}

export default EditorManager