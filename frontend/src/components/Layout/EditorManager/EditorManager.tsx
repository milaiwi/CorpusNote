// frontend/src/components/Layout/EditorManager/EditorManager.tsx
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import '@blocknote/core/fonts/inter.css'

import React from 'react'

interface EditorManagerProps {

}

const EditorManager: React.FC<EditorManagerProps> = ({}) => {
    const editor = useCreateBlockNote()

    return (
        <div className='w-full h-full'>
            <BlockNoteView editor={editor} />
        </div>
    )
}

export default EditorManager