// frontend/src/contexts/AppContext
import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react'
import { useAIContext } from '../AIContext'
import { invoke } from '@tauri-apps/api/tauri'
import { useFileSystem } from '../FileSystemContext'
import { useFileCache } from '../FileCache'
import { extractTextFromBlocks } from '../../components/layout/EditorManager/utils/blockUtils'

interface SearchSemanticContextType {
    // search functions
    search: (query: string) => Promise<any[]>
    searchSimilarUsingCurrentFile: () => Promise<void>
    
    // synchronous getters for cached data
    getCurrentFileSimilarFiles: () => any[]
    getCachedSimilarFilesForFile: (filePath: string) => any[]

    // state management
    searchResults: any[]
    isLoading: boolean
    error: string | null
}

const SearchSemanticContext = createContext<SearchSemanticContextType | undefined>(undefined)

/**
 * SearchSemanticContext is a context that provides the searchSemantic function to the app.
 * It handles all the logic for searching the semantic of the editor.
 * 
 * @param children - The children of the SearchSemanticProvider
 * @returns The SearchSemanticContext
 */
export const SearchSemanticProvider = ({ children }: { children: ReactNode }) => {
    const { embeddingModel } = useAIContext()
    const { currentOpenedFile, editorInitialBlocks } = useFileSystem()
    const { cacheSimilarFiles, getCachedSimilarFiles } = useFileCache()
    
    // State management
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Auto-search when current file or content changes
    useEffect(() => {
        if (currentOpenedFile && editorInitialBlocks) {
            searchSimilarUsingCurrentFile()
        }
    }, [currentOpenedFile, editorInitialBlocks])

    const search = async (query: string) => {
        if (!embeddingModel) throw new Error("Embedding model not found")
        
        try {
            // Extract text content from each block's content array
            const queryVector = Array.from(await embeddingModel.embed(query))
            const results: string = await invoke("search", {
                name: "indexing_table",
                query: query,
                queryVector: queryVector,
                limit: 10
            })
            const jsonResults = JSON.parse(results)
            return jsonResults.filter((result: any) => result.file_path !== currentOpenedFile?.absPath)
        } catch (err) {
            throw new Error("Search failed")
        }
    }

    /**
     * Uses the content of the current opened file to search for similar files
     * Manages loading state and results internally
     */
    const searchSimilarUsingCurrentFile = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            if (!currentOpenedFile) {
                setError("No current opened file")
                return
            }
            
            if (!editorInitialBlocks) {
                setError("No content to search")
                return
            }
            
            const currentFileText = extractTextFromBlocks(editorInitialBlocks)
            const results = await search(currentFileText)
            setSearchResults(results)
            
            // Cache the results for this file using FileCache
            if (currentOpenedFile) {
                cacheSimilarFiles(currentOpenedFile.absPath, results)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }
    
    // Synchronous getter for current file's similar files
    const getCurrentFileSimilarFiles = (): any[] => {
        if (!currentOpenedFile) return []
        return getCachedSimilarFiles(currentOpenedFile.absPath) || []
    }
    
    // Synchronous getter for any file's similar files
    const getCachedSimilarFilesForFile = (filePath: string): any[] => {
        return getCachedSimilarFiles(filePath) || []
    }

    const value = useMemo(
        () => ({
            search,
            searchSimilarUsingCurrentFile,
            getCurrentFileSimilarFiles,
            getCachedSimilarFilesForFile,
            searchResults,
            isLoading,
            error
        }),
        [
            embeddingModel,
            currentOpenedFile,
            editorInitialBlocks,
            searchResults,
            isLoading,
            error,
            getCurrentFileSimilarFiles,
            getCachedSimilarFilesForFile,
            cacheSimilarFiles,
            getCachedSimilarFiles
        ]
    )

    return (
        <SearchSemanticContext.Provider value={value}>
            {children}
        </SearchSemanticContext.Provider>
    )
}

export const useSearchSemanticContext = () => {
    const context = useContext(SearchSemanticContext)
    if (context === undefined)
        throw new Error('useSearchSemanticContext must be used within a SearchSemanticProvider')
    return context
}