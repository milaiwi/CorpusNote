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
import { useSearchSemanticContext } from '../../../contexts/Semantics/SearchSemanticContext'
import { SimilarCommand } from '../SemanticSidebar/SimilarCommand'


const EditorManager = () => {
    const {
        editorInitialBlocks,
        editorInitialMarkdown,
        changingFilePath,
        currentOpenedFile,
        loadFileIntoEditor,
        saveFileFromEditor,
        loadFilePathIntoEditor,
    } = useFileSystem()

    const { editor, similarUI, setSimilarUI } = useAIContext()
    const { getCurrentFileSimilarFiles } = useSearchSemanticContext()

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
            console.log(`Dirty: ${currentOpenedFile?.isDirty}`)
            if (editor.document.length > 0 && currentOpenedFile?.isDirty) {
                const markdown = await editor.blocksToMarkdownLossy(editor.document)
                console.log(`[DIRTY MODIFICATION] Saving current file: ${currentOpenedFile.absPath}`)
                saveFileFromEditor(editor.document, markdown)
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
            console.log(`[DIRTY MODIFICATION] Marking file as dirty!!`)
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
            <BlockNoteView editor={editor} onChange={handleEditorChange}>
                <SimilarCommand
                    editor={editor}
                    state={similarUI}
                    onClose={() => setSimilarUI(null)}
                />
            </BlockNoteView>
        </div>
    )
}

export default EditorManager