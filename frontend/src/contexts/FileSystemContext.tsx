// frontend/src/contexts/FileSystemContext.tsx
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { FileItem } from "../components/layout/FileSidebar/utils"
import readSingleDirectoryContent, { sortFiles, addItemToDirectory, renameItemInFileTree, removeItemFromFileTree } from "../components/layout/FileSidebar/FileTree"
import { useFileCache } from "./FileCache"
import { useAppSettings } from "./AppContext"
import { extractCurrentDirectory, invalidCharactersExist } from "../../lib/utils"
import { Block } from "@blocknote/core"

type FileSystemContextType = {
    // File tree state
    vaultTree: FileItem[]
    expandedDirectories: Map<string, boolean>
    handleDirectoryToggle: (path: string) => void

    // File operations
    loadFileIntoEditor: (file: FileItem) => Promise<void>
    createNewNote: (title: string, targetDirectory?: string) => Promise<void>
    createNewDirectory: (directory: string, targetDirectory?: string) => Promise<void>
    handleRename: (filePath: string, newName: string) => Promise<[boolean, string]>
    handleRemove: (item: FileItem) => Promise<[boolean, string]>
    saveFileFromEditor: (blocks: Block[]) => Promise<void>

    // File tree management

    // File state management
    currentOpenedFile: FileItem | null
    changingFilePath: boolean
    editorInitialBlocks: Block[] | null
    editorInitialMarkdown: string | null

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

    // State to hold the initial content of the editor
    const [editorInitialBlocks, setEditorInitialBlocks] = useState<Block[] | null>(null)
    const [editorInitialMarkdown, setEditorInitialMarkdown] = useState<string | null>(null)

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

    const loadFileIntoEditor = async (file: FileItem) => {
        if (currentOpenedFile?.absPath === file.absPath)
            setCurrentOpenedFile(null)
        console.log(`Loading file into editor: ${file.absPath}`)
        setCurrentOpenedFile(file)
        setChangingFilePath(true)

        setEditorInitialBlocks(null)
        setEditorInitialMarkdown(null)
        const result = await readFileAndCache(file)

        if (result) {
            if (result.source === 'json') {
                setEditorInitialBlocks(result.content as Block[])
            } else {
                setEditorInitialMarkdown(result.content as string)
            }
        }
        setChangingFilePath(false)
    }

    const createNewNote = async (title: string, targetDirectory?: string) => {
        const targetPath = targetDirectory || (currentOpenedFile ? extractCurrentDirectory(currentOpenedFile.absPath) : vaultPath)
        const newNotePath = `${targetPath}/${title}.md`
        
        await writeFileAndCache({ absPath: newNotePath, name: title, isDirectory: false }, [])

        const newFile: FileItem = {
            name: title,
            absPath: newNotePath,
            isDirectory: false,
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

    const createNewDirectory = async (directory: string, targetDirectory?: string) => {
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

    const handleRename = async (filePath: string, newName: string): Promise<[boolean, string]> => {
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

    const handleRemove = async (item: FileItem): Promise<[boolean, string]> => {
        if (!item) return [false, 'File does not exist'] // Theoretically impossible

        deleteFileAndCache(item.absPath)        
        setFiles(prev => removeItemFromFileTree(prev, item.absPath))
        return [true, 'File deleted']
    }

    const saveFileFromEditor = async (blocks: Block[]) => {
        if (!currentOpenedFile) return
        writeFileAndCache(currentOpenedFile, blocks)
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
        editorInitialBlocks,
        editorInitialMarkdown,
        currentOpenedFile: currentOpenedFile,
    }

    return <FileSystemContext.Provider value={contextValue}>{children}</FileSystemContext.Provider>
}

export default FileSystemProvider