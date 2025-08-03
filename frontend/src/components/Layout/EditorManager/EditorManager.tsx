// frontend/src/components/Layout/EditorManager
import React, { useEffect, useState } from 'react'
import { useFileSystem } from '@/src/contexts/FileSystemContext'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import { Block } from '@blocknote/core'

import './style.css'

interface EditorManagerProps {

}

const EditorManager: React.FC<EditorManagerProps> = ({}) => {
    const [blocks, setBlocks] = useState<Block[]>([])

    const { currentFilePath, currentContent } = useFileSystem()

    const editor = useCreateBlockNote()

    useEffect(() => {
    }, [currentFilePath])


    return (
        <div className='w-full h-full'>
            <BlockNoteView 
                editor={editor} 
                onChange={() => {
                    setBlocks(editor.document)
                }}
            />
        </div>
    )
}

export default EditorManager