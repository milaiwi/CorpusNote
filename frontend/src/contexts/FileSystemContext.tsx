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
    flattedFiles: FileItem[]
    expandedDirectories: Map<string, boolean>
    handleDirectoryToggle: (path: string) => void

    // File operations
    loadFileIntoEditor: (file: FileItem) => Promise<void>
    createNewNote: (title: string, targetDirectory?: string) => Promise<void>
    createNewDirectory: (directory: string, targetDirectory?: string) => Promise<void>
    handleRename: (filePath: string, newName: string) => Promise<[boolean, string]>
    handleRemove: (item: FileItem) => Promise<[boolean, string]>
    saveFileFromEditor: (blocks: Block[], markdown?: string) => Promise<void>

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
    const [flattedFiles, setFlattedFiles] = useState<FileItem[]>([])
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
            
            // Populate flattedFiles with all files from the tree
            const allFiles: FileItem[] = []
            const collectAllFilesFromTree = (items: FileItem[]) => {
                items.forEach(item => {
                    allFiles.push(item)
                    if (item.isDirectory && item.children && item.children.length > 0) {
                        collectAllFilesFromTree(item.children)
                    }
                })
            }
            collectAllFilesFromTree(sortedFiles)
            setFlattedFiles(allFiles)
            
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

    const handleRemove = async (item: FileItem): Promise<[boolean, string]> => {
        if (!item) return [false, 'File does not exist'] // Theoretically impossible

        deleteFileAndCache(item.absPath)        
        setFiles(prev => removeItemFromFileTree(prev, item.absPath))
        
        // Update flattedFiles based on whether it's a file or directory
        if (item.isDirectory) {
            removeDirectoryFromFlattedFiles(item)
        } else {
            setFlattedFiles(prev => prev.filter(file => file.absPath !== item.absPath))
        }
        
        return [true, 'File deleted']
    }

    const saveFileFromEditor = async (blocks: Block[], markdown?: string) => {
        if (!currentOpenedFile) return
        writeFileAndCache(currentOpenedFile, blocks, markdown)
        currentOpenedFile.isDirty = false
    }

    // Helper function to update flattedFiles when adding a new item
    const updateFlattedFiles = (newItem: FileItem, operation: 'add' | 'remove' | 'rename', oldPath?: string) => {
        if (operation === 'add') {
            setFlattedFiles(prev => [...prev, newItem])
        } else if (operation === 'remove') {
            setFlattedFiles(prev => prev.filter(file => file.absPath !== newItem.absPath))
        } else if (operation === 'rename' && oldPath) {
            setFlattedFiles(prev => prev.map(file => 
                file.absPath === oldPath ? { ...file, name: newItem.name, absPath: newItem.absPath } : file
            ))
        }
    }

    // Helper function to recursively add all files from a directory to flattedFiles
    const addDirectoryToFlattedFiles = (directory: FileItem) => {
        setFlattedFiles(prev => [...prev, directory])
        // Recursively add all children if they exist
        if (directory.children && directory.children.length > 0) {
            directory.children.forEach(child => {
                if (child.isDirectory) {
                    addDirectoryToFlattedFiles(child)
                } else {
                    setFlattedFiles(prev => [...prev, child])
                }
            })
        }
    }

    // Helper function to recursively remove all files from a directory from flattedFiles
    const removeDirectoryFromFlattedFiles = (directory: FileItem) => {
        setFlattedFiles(prev => prev.filter(file => file.absPath !== directory.absPath))
        // Recursively remove all children if they exist
        if (directory.children && directory.children.length > 0) {
            directory.children.forEach(child => {
                if (child.isDirectory) {
                    removeDirectoryFromFlattedFiles(child)
                } else {
                    setFlattedFiles(prev => prev.filter(file => file.absPath !== child.absPath))
                }
            })
        }
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
        // Update flattedFiles directly since it's a 1D array
        updateFlattedFiles(newFile, 'add')
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
        // Update flattedFiles directly since it's a 1D array - handle directory properly
        addDirectoryToFlattedFiles(newDir)
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
        // TODO: inefficient double call but this problably doesn't happen so often
        // that it doesn't matter.
        setFiles(prev => renameItemInFileTree(prev, filePath, newName))
        
        // Update flattedFiles directly since it's a 1D array
        const renamedFile = {
            name: newName,
            absPath: newFilePath,
            isDirectory: false,
        }
        updateFlattedFiles(renamedFile, 'rename', filePath)
        
        return [true, newFilePath]
    }

    const contextValue: FileSystemContextType = {
        vaultTree: files,
        flattedFiles,
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