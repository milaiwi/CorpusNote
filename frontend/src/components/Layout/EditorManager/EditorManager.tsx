// frontend/src/components/Layout/EditorManager/EditorManager.tsx
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import '@blocknote/core/fonts/inter.css'
import './editor.css'

import React, { useEffect } from 'react'
import { useFileSystem } from '../../../contexts/FileSystemContext'
import { Loader2 } from 'lucide-react'

interface EditorManagerProps {
    selectedFile: string | null;
}

const EditorManager: React.FC<EditorManagerProps> = ({ selectedFile }) => {
    const { editorContent, changingFilePath } = useFileSystem()
    const { loadFileIntoEditor } = useFileSystem()

    const editor = useCreateBlockNote()

    useEffect(() => {
        if (changingFilePath) return
        editor.pasteText(editorContent)
    }, [changingFilePath, editorContent])

    useEffect(() => {
        const fetchFile = async () => {
            if (!selectedFile) return
            loadFileIntoEditor(selectedFile)
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