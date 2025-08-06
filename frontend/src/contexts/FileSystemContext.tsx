// frontend/src/contexts/FileSystemContext.tsx
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { FileItem } from "../components/layout/FileSidebar/utils"
import readSingleDirectoryContent, { sortFiles } from "../components/layout/FileSidebar/FileTree"
import { useFileCache, writeFileAndCache } from "./FileCache"
import { useAppSettings } from "./AppContext"
import { extractCurrentDirectory, invalidCharactersExist } from "../../lib/utils"

type FileSystemContextType = {
    // File tree state
    vaultTree: FileItem[]
    expandedDirectories: Map<string, boolean>

    // File operations
    handleDirectoryToggle: (path: string) => void
    loadFileIntoEditor: (filePath: string) => void
    createNewNote: (title: string) => void

    // File tree management

    // File state management
    currentOpenedFile: string | null
    changingFilePath: boolean
    editorContent: string | null

    // File content operations

    // Auto/Background operations
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined)

export const useFileSystem = () => {
    const context = useContext(FileSystemContext)
    if (!context) {
        throw new Error('useFileSystem must be used within a FileSystemContext')
    }
    return context
}

interface FileSystemProviderProps {
    children?: ReactNode,
}

const FileSystemProvider: React.FC<FileSystemProviderProps> = ({ children }) => {
    const { vaultPath } = useAppSettings()
    // File tree state
    const [files, setFiles] = useState<FileItem[]>([])
    const [expandedDirectories, setExpandedDirectories] = useState<Map<string, boolean>>(new Map())

    // File state management
    const [currentOpenedFile, setCurrentOpenedFile] = useState<string | null>(null)
    const [changingFilePath, setChangingFilePath] = useState<boolean>(false)
    const [editorContent, setEditorContent] = useState<string | null>(null)

    const { readFileAndCache } = useFileCache()

    // Load files from vault
    useEffect(() => {
        const readFilesFromDirectory = async () => {
            const fileItems = await readSingleDirectoryContent(vaultPath)
            const sortedFiles = sortFiles(fileItems)
            setFiles(sortedFiles)
            return true
        }

        readFilesFromDirectory()
    }, [vaultPath])

    const handleDirectoryToggle = (path: string) => {
        const isExpanded = expandedDirectories.get(path)
        setExpandedDirectories(prev => new Map(prev).set(path, !isExpanded))
    }

    const loadFileIntoEditor = (filePath: string) => {
        if (currentOpenedFile === filePath)
            setCurrentOpenedFile(null)
        setCurrentOpenedFile(filePath)
        setChangingFilePath(true)
        readFileAndCache(filePath).then((content) => {
            setEditorContent(content)
            setChangingFilePath(false)
        })
    }

    const createNewNote = (title: string) => {
        if (!currentOpenedFile) return
        const basePath = extractCurrentDirectory(currentOpenedFile)
        const newNotePath = `${basePath}/${title}.md`
        console.log('New note path', newNotePath)
        writeFileAndCache(newNotePath, '# ' + title + '\n\n')
        setFiles(prev => [...prev, {
            name: title,
            absPath: newNotePath,
            type: 'file',
            isDirectory: false,
            timeCreated: Date.now(),
            timeModified: Date.now(),
            currentPosition: 0,
            mimeType: 'text/markdown',
            children: [],
            expanded: false,
        }])
    }

    const contextValue: FileSystemContextType = {
        vaultTree: files,
        expandedDirectories,
        handleDirectoryToggle,
        loadFileIntoEditor,
        createNewNote,
        changingFilePath,
        editorContent,
        currentOpenedFile: currentOpenedFile,
    }

    return <FileSystemContext.Provider value={contextValue}>{children}</FileSystemContext.Provider>
}

export default FileSystemProvider