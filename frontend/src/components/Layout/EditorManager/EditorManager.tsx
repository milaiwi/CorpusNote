// frontend/src/components/Layout/EditorManager/EditorManager.tsx
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import '@blocknote/core/fonts/inter.css'

import React, { useEffect } from 'react'
import { useFileCache } from '../../../contexts/FileCache'
import { useFileSystem } from '../../../contexts/FileSystemContext'
import { Loader2 } from 'lucide-react'

interface EditorManagerProps {
    selectedFile: string | null;
}

const EditorManager: React.FC<EditorManagerProps> = ({ selectedFile }) => {
    const { editorContent, changingFilePath } = useFileSystem()
    const { readFileAndCache } = useFileCache()

    const editor = useCreateBlockNote()

    useEffect(() => {
        if (changingFilePath) return
        editor.pasteText(editorContent)
    }, [changingFilePath, editorContent])

    useEffect(() => {
        const fetchFile = async () => {
            if (!selectedFile) return
            const content = await readFileAndCache(selectedFile)
            editor.pasteText(content)
        }

        fetchFile()
    }, [selectedFile])

    if (changingFilePath) {
        return (
            <div className='w-full h-full flex items-center justify-center'>
                <Loader2 className='w-4 h-4 animate-spin' />
            </div>
        )
    }
    
    return (
        <div className='w-full h-full'>
            <BlockNoteView editor={editor} />
        </div>
    )
}

export default EditorManager