// frontend/src/components/Layout/EditorManager
import React, { useEffect } from 'react'
import { useFileSystem } from '@/src/contexts/FileSystemContext'

interface EditorManagerProps {

}

const EditorManager: React.FC<EditorManagerProps> = ({}) => {
    const { currentFilePath, currentContent } = useFileSystem()

    useEffect(() => {
        console.log(`file path has changed!`)
    }, [currentFilePath])

    return (
        <h1>{currentContent}</h1>
    )
}

export default EditorManager