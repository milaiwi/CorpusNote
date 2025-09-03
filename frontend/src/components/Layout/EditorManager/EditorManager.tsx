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
import { FileItem } from '../FileSidebar/utils'


const EditorManager = () => {
    const {
        editorInitialBlocks,
        editorInitialMarkdown,
        changingFilePath,
        currentOpenedFile,
        loadFileIntoEditor,
        saveFileFromEditor,
        saveCurrentFileBeforeLoad,
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
        if (changingFilePath && currentOpenedFile) {
            loadFileIntoEditor(currentOpenedFile)
        }
    }, [changingFilePath, currentOpenedFile, loadFileIntoEditor])

    // Save current file when switching to a new file
    // useEffect(() => {
    //     return () => {
    //         console.log(`[CLEANUP] Saving file`)
    //         // const saveFile = async () => {
    //         //     if (editor.document.length > 0 && currentOpenedFile?.isDirty) {
    //         //         console.log(`[CLEANUP] Saving previous file: ${currentOpenedFile.absPath}`)
    //         //         const markdown = await editor.blocksToMarkdownLossy(editor.document)
    //         //         await saveCurrentFileBeforeLoad(editor.document, markdown)
    //         //     }
    //         // }
    //         // saveFile()
    //     }
    // }, [currentOpenedFile, editor, saveCurrentFileBeforeLoad])

    const handleEditorChange = (editor: BlockNoteEditor, { getChanges }) => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false
            return
        }

        if (!currentOpenedFile) return
        
        const changes = getChanges()
        if (changes.length > 0 && !currentOpenedFile?.isDirty) {
            console.log(`[DIRTY MODIFICATION] Marking file as dirty!! ${currentOpenedFile?.absPath}`)
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