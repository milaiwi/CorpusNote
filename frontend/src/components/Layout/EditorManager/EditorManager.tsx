// frontend/src/components/Layout/EditorManager/EditorManager.tsx
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import '@blocknote/core/fonts/inter.css'

import React, { useEffect } from 'react'
import { useFileCache } from '../../../contexts/FileCache'

interface EditorManagerProps {
    selectedFile: string | null;
}

const EditorManager: React.FC<EditorManagerProps> = ({ selectedFile }) => {
    const editor = useCreateBlockNote()
    const { readFileAndCache } = useFileCache()

    useEffect(() => {
        const fetchFile = async () => {
            if (!selectedFile) return
            const content = await readFileAndCache(selectedFile)
            editor.pasteText(content)
        }

        fetchFile()
    }, [selectedFile])
    
    return (
        <div className='w-full h-full'>
            <BlockNoteView editor={editor} />
        </div>
    )
}

export default EditorManager