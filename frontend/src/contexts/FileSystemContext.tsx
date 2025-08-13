// frontend/src/contexts/FileSystemContext.tsx
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { FileItem } from "../components/layout/FileSidebar/utils"
import readSingleDirectoryContent, { sortFiles, addItemToDirectory, renameItemInFileTree, removeItemFromFileTree } from "../components/layout/FileSidebar/FileTree"
import { useFileCache } from "./FileCache"
import { useAppSettings } from "./AppContext"
import { extractCurrentDirectory, invalidCharactersExist } from "../../lib/utils"

type FileSystemContextType = {
    // File tree state
    vaultTree: FileItem[]
    expandedDirectories: Map<string, boolean>

    // File operations
    handleDirectoryToggle: (path: string) => void
    loadFileIntoEditor: (file: FileItem) => void
    createNewNote: (title: string, targetDirectory?: string) => void
    createNewDirectory: (directory: string, targetDirectory?: string) => void
    handleRename: (filePath: string, newName: string) => [boolean, string]
    handleRemove: (item: FileItem) => [boolean, string]
    saveFileFromEditor: (markdown: string) => void

    // File tree management

    // File state management
    currentOpenedFile: FileItem | null
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
    const [currentOpenedFile, setCurrentOpenedFile] = useState<FileItem | null>(null)
    const [changingFilePath, setChangingFilePath] = useState<boolean>(false)
    const [editorContent, setEditorContent] = useState<string | null>(null)

    const { readFileAndCache, createDirectory, renameFileAndCache, deleteFileAndCache, writeFileAndCache } = useFileCache()

    // Load files from vault
    useEffect(() => {
        const readFilesFromDirectory = async () => {
            const startingPath = vaultPath

            // Create a dummy root node that contains all top-level files
            const dummyRoot: FileItem = {
                name: '.corpusnotes-dummy',
                absPath: vaultPath,
                isDirectory: true,
                timeCreated: Date.now(),
                timeModified: Date.now(),
                currentPosition: 0,
                expanded: true,
                children: [],
            }

            const fileItems = await readSingleDirectoryContent(vaultPath, startingPath, dummyRoot)
            const sortedFiles = sortFiles(fileItems)

            dummyRoot.children = sortedFiles
            
            setFiles([dummyRoot])
            return true
        }

        readFilesFromDirectory()
    }, [vaultPath])

    const handleDirectoryToggle = (path: string) => {
        const isExpanded = expandedDirectories.get(path)
        setExpandedDirectories(prev => new Map(prev).set(path, !isExpanded))
    }

    const loadFileIntoEditor = (file: FileItem) => {
        if (currentOpenedFile?.absPath === file.absPath)
            setCurrentOpenedFile(null)
        setCurrentOpenedFile(file)
        setChangingFilePath(true)
        readFileAndCache(file).then((content) => {
            setEditorContent(content)
            setChangingFilePath(false)
        })
    }

    const createNewNote = (title: string, targetDirectory?: string) => {
        const targetPath = targetDirectory || (currentOpenedFile ? extractCurrentDirectory(currentOpenedFile.absPath) : vaultPath)
        const newNotePath = `${targetPath}/${title}.md`
        
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

        writeFileAndCache(newFile, '# ' + title + '\n\n')

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
        const targetPath = targetDirectory || (currentOpenedFile ? extractCurrentDirectory(currentOpenedFile.absPath) : vaultPath)
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

        renameFileAndCache(filePath, newFilePath)
        
        // Use the tree traversal function to properly update the file tree
        setFiles(prev => renameItemInFileTree(prev, filePath, newName))
        return [true, newFilePath]
    }

    const handleRemove = (item: FileItem): [boolean, string] => {
        if (!item) return [false, 'File does not exist'] // Theoretically impossible

        deleteFileAndCache(item.absPath)        
        setFiles(prev => removeItemFromFileTree(prev, item.absPath))
        return [true, 'File deleted']
    }

    const saveFileFromEditor = (markdown: string) => {
        if (!currentOpenedFile) return
        writeFileAndCache(currentOpenedFile, markdown)
        currentOpenedFile.isDirty = false
    }

    const contextValue: FileSystemContextType = {
        vaultTree: files,
        expandedDirectories,
        handleDirectoryToggle,
        loadFileIntoEditor,
        createNewNote,
        createNewDirectory,
        handleRename,
        handleRemove,
        saveFileFromEditor,
        changingFilePath,
        editorContent,
        currentOpenedFile: currentOpenedFile,
    }

    return <FileSystemContext.Provider value={contextValue}>{children}</FileSystemContext.Provider>
}

export default FileSystemProvider