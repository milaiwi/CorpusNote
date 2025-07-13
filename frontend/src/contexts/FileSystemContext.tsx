// frontend/src/contexts/FileSystemContext.tsx
'use client';

import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react'
import { FileSystemCache } from '../caches/FileSystemCache';


interface FileSystemContextProps {
    // ==== State variables ====
    currentFilePath: string | undefined
    currentContent: string

    // ==== File operations ====
    readFile: (path: string) => Promise<void>
}

const FileSystemContext = createContext<FileSystemContextProps | undefined>(undefined)

interface FileSystemProviderProps {
    vaultPath: string | undefined
    children: ReactNode
}

const FileSystemProvider: React.FC<FileSystemProviderProps> = ({
    vaultPath,
    children
}) => {
    const [fileCache] = useState(() => new FileSystemCache(vaultPath))
    const [currentFilePath, setCurrentFilePath] = useState<string | undefined>(undefined)
    const [currentContent, setCurrentContent] = useState<string>('')
    
    // ===== File Operations =====
    const readFile = useCallback(async (path: string): Promise<void> => {
        const content = await fileCache.readFile(path)
        setCurrentFilePath(path)
        setCurrentContent(content)
    }, [fileCache])

    const contextValue: FileSystemContextProps = {
        currentFilePath,
        currentContent,
        readFile
    }

    return (
        <FileSystemContext.Provider value={contextValue}>
            <div className={`bg-primary text-primary-foreground h-full flex flex-co`}>
                {children}
            </div>
        </FileSystemContext.Provider>
    )
}

export const useFileSystem = () => {
    const context = useContext(FileSystemContext)
    if (context === undefined) {
        throw new Error('useFileSystem must be used within a FileSystemProvider')
    }
    return context
}

export default FileSystemProvider