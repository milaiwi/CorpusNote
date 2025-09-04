// frontend/src/components/Layout/EditorManager/EditorManager.tsx
"use client"
import { BlockNoteView } from '@blocknote/mantine'
import { Block, BlockNoteEditor } from '@blocknote/core'
import '@blocknote/mantine/style.css'
import '@blocknote/core/fonts/inter.css'
import './editor.css'

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useFileSystem } from '../../../contexts/FileSystemContext'
import { Loader2 } from 'lucide-react'
import { useAIContext } from '../../../contexts/AIContext'
import { SimilarCommand } from '../SemanticSidebar/SimilarCommand'
import { FileItem } from '../FileSidebar/utils'

export type EditorManagerRef = {
    getMarkdownContent: () => Promise<string | null>
    getBlocksContent: () => Promise<Block[] | null>
}

type EditorManagerProps = {
    onOpenFile: (file: FileItem) => Promise<void>
}

const EditorManager = forwardRef<EditorManagerRef, EditorManagerProps>((props, ref) => {
    const {
        editorInitialBlocks,
        editorInitialMarkdown,
        changingFilePath,
        currentOpenedFile,
    } = useFileSystem()

    const { editor, similarUI, setSimilarUI } = useAIContext()

    const isInitialLoad = useRef<boolean>(false)

    useImperativeHandle(ref, () => ({
        getMarkdownContent: async () => {
            if (!editor) return null
            return await editor.blocksToMarkdownLossy(editor.document)
        },
        getBlocksContent: async () => {
            if (!editor) return null;
            return editor.document
        }
    }))

    useEffect(() => {
        console.log(`Changing file path: ${changingFilePath}`)
        if (changingFilePath) return
   
        if (editorInitialBlocks || editorInitialMarkdown) {
            const loadContent = async () => {
                if (editorInitialBlocks) {
                    editor.replaceBlocks(editor.document, editorInitialBlocks)
                } else {
                    const blocks = await editor.tryParseMarkdownToBlocks(editorInitialMarkdown)
                    editor.replaceBlocks(editor.document, blocks)
                }
            }

            setTimeout(() => {
                loadContent()
                isInitialLoad.current = false
            }, 0)
        }
    }, [changingFilePath, editor, editorInitialBlocks, editorInitialMarkdown])

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
})

export default EditorManager