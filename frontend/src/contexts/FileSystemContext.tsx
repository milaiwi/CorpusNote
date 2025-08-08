// frontend/src/contexts/FileSystemContext.tsx
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { FileItem } from "../components/layout/FileSidebar/utils"
import readSingleDirectoryContent, { sortFiles, addItemToDirectory, renameItemInFileTree } from "../components/layout/FileSidebar/FileTree"
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
    createNewNote: (title: string, targetDirectory?: string) => void
    createNewDirectory: (directory: string, targetDirectory?: string) => void
    handleRename: (filePath: string, newName: string) => [boolean, string]

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

    const { readFileAndCache, createDirectory, renameFileAndCache } = useFileCache()

    // Load files from vault
    useEffect(() => {
        const readFilesFromDirectory = async () => {
            const startingPath = vaultPath
            const fileItems = await readSingleDirectoryContent(vaultPath, startingPath)
            const sortedFiles = sortFiles(fileItems)
            
            // Create a dummy root node that contains all top-level files
            const dummyRoot: FileItem = {
                name: '.corpusnotes-dummy',
                absPath: vaultPath,
                isDirectory: true,
                timeCreated: Date.now(),
                timeModified: Date.now(),
                currentPosition: 0,
                children: sortedFiles,
                expanded: true,
            }
            
            setFiles([dummyRoot])
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

    const createNewNote = (title: string, targetDirectory?: string) => {
        const targetPath = targetDirectory || (currentOpenedFile ? extractCurrentDirectory(currentOpenedFile) : vaultPath)
        const newNotePath = `${targetPath}/${title}.md`
        
        writeFileAndCache(newNotePath, '# ' + title + '\n\n')
        
        const newFile: FileItem = {
            name: title,
            absPath: newNotePath,
            isDirectory: false,
            timeCreated: Date.now(),
            timeModified: Date.now(),
            currentPosition: 0,
            mimeType: 'text/markdown',
            children: [],
            expanded: false,
        }
        
        // If targetPath is the vault root, add to dummy root's children
        if (targetPath === vaultPath) {
            setFiles(prev => {
                const dummyRoot = prev[0]
                return [{
                    ...dummyRoot,
                    children: sortFiles([...dummyRoot.children, newFile])
                }]
            })
        } else {
            setFiles(prev => addItemToDirectory(prev, vaultPath, targetPath, newFile))
        }
    }

    const createNewDirectory = (directory: string, targetDirectory?: string) => {
        const targetPath = targetDirectory || (currentOpenedFile ? extractCurrentDirectory(currentOpenedFile) : vaultPath)
        const newDirectoryPath = `${targetPath}/${directory}`
        createDirectory(newDirectoryPath)
        
        const newDir: FileItem = {
            name: directory,
            absPath: newDirectoryPath,
            isDirectory: true,
            timeCreated: Date.now(),
            timeModified: Date.now(),
            currentPosition: 0,
            children: [],
            expanded: false,
        }
        
        // If targetPath is the vault root, add to dummy root's children
        if (targetPath === vaultPath) {
            setFiles(prev => {
                const dummyRoot = prev[0]
                return [{
                    ...dummyRoot,
                    children: sortFiles([...dummyRoot.children, newDir])
                }]
            })
        } else {
            setFiles(prev => addItemToDirectory(prev, vaultPath, targetPath, newDir))
        }
    }

    const handleRename = (filePath: string, newName: string): [boolean, string] => {
        if (!filePath) return [false, 'File path is empty'] // No file is opened
        if (invalidCharactersExist(newName)) return [false, 'There is an invalid character'] // There is an invalid character
        if (newName === '') return [false, 'New name is empty'] // New name is empty
        
        // Check if the new name already exists in the same directory
        const basePath = extractCurrentDirectory(filePath)
        const newFilePath = `${basePath}/${newName}`
        
        // Check if the new name already exists in the same directory
        // Since we have a dummy root, we need to search in its children
        const dummyRoot = files[0]
        const existingFile = dummyRoot?.children?.find(file => file.absPath === newFilePath)
        if (existingFile) return [false, 'New name already exists'] // New name already exists

        console.log('Renaming:', filePath, 'to:', newFilePath)
        renameFileAndCache(filePath, newFilePath)
        
        // Use the tree traversal function to properly update the file tree
        setFiles(prev => renameItemInFileTree(prev, filePath, newName))
        return [true, newFilePath]
    }

    const contextValue: FileSystemContextType = {
        vaultTree: files,
        expandedDirectories,
        handleDirectoryToggle,
        loadFileIntoEditor,
        createNewNote,
        createNewDirectory,
        handleRename,
        changingFilePath,
        editorContent,
        currentOpenedFile: currentOpenedFile,
    }

    return <FileSystemContext.Provider value={contextValue}>{children}</FileSystemContext.Provider>
}

export default FileSystemProvider