// src/contexts/FileCache.tsx
import React, { useContext, useMemo } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { createDir, readTextFile, writeTextFile, renameFile, removeFile } from '@tauri-apps/api/fs'
import { useAppSettings } from './AppContext'

// Global reference to the query client for use outside of React components
let globalQueryClient: QueryClient | null = null

export const setGlobalQueryClient = (queryClient: QueryClient) => {
  globalQueryClient = queryClient
}

export const getGlobalQueryClient = () => {
  if (!globalQueryClient) {
    throw new Error('Global query client not set. Make sure FileCacheProvider is initialized.')
  }
  return globalQueryClient
}

/**
 *  ========================================================
 *
 *    GLOBAL FILE CACHE TO USE OUTSIDE OF REACT COMPONENTS
 *      PREVENTS react-hook ERRORS
 *
 *  ========================================================
 */
export const readFileCached = async (path: string): Promise<string | null> => {
  const queryClient = getGlobalQueryClient()

  try {
    // Check if the file is in the cache
    const cachedData = queryClient.getQueryData(['file', path])
    if (cachedData) {
      return cachedData as string
    }

    // If not in cache, fetch and cache it
    const fileContent = await queryClient.fetchQuery({
      queryKey: ['file', path],
      queryFn: async () => {
        // const content = await window.fileSystem.readFile(path, 'utf-8')
        console.log
        const content = await readTextFile(path)
        return content
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    })

    return fileContent
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
}

export const writeFileAndCache = async (path: string, content: string): Promise<void> => {
  const queryClient = getGlobalQueryClient()

  try {
    await writeTextFile(path, content)
    // Invalidate the cache after writing
    queryClient.invalidateQueries({ queryKey: ['file', path] })
  } catch (error) {
    console.error('Error writing file:', error)
    throw error
  }
}
/**
 *  =============================
 *
 *    END OF GLOBAL FILE CACHE
 *
 *  =============================
 */

interface FileCacheContextType {
  // File operations with cache validation and invalidation
  readFileAndCache: (path: string) => Promise<string | null>
  writeFileAndCache: (path: string, content: string) => Promise<void>
  renameFileAndCache: (oldPath: string, newPath: string) => Promise<void>
  deleteFileAndCache: (path: string) => Promise<void>

  // Cache management
  invalidateFile: (path: string) => void
  prefetchFile: (path: string) => Promise<void>

  // File system operations with no cache validation
  createDirectory: (path: string) => Promise<void>
}

const FileCacheContext = React.createContext<FileCacheContextType | undefined>(undefined)

const FileCacheProvider: React.FC<{ children: React.ReactNode; queryClient: QueryClient }> = ({
  children,
  queryClient,
}) => {
  // Set global query client reference for use outside of React components
  setGlobalQueryClient(queryClient)
  const { vaultPath } = useAppSettings()

  const readFileAndCache = async (path: string): Promise<string | null> => {
    try {
      // Use the cache instead of bypassing it
      const cachedData = queryClient.getQueryData(['file', path])
      if (cachedData) {
        return cachedData as string
      }

      // If not in cache, fetch and cache it
      const fileContent = await queryClient.fetchQuery({
        queryKey: ['file', path],
        queryFn: async () => {
          const content = await readTextFile(path)
          return content
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
      })

      return fileContent
    } catch (error) {
      console.error('Error reading file:', error)
      return null
    }
  }

  const writeFileAndCache = async (path: string, content: string): Promise<void> => {
    try {
      await writeTextFile(path, content)

      queryClient.invalidateQueries({ queryKey: ['file', path] })
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  }


  const deleteFileAndCache = async (path: string): Promise<void> => {
    try {
      await removeFile(path)
      queryClient.invalidateQueries({ queryKey: ['file', path] })
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const renameFileAndCache = async (oldPath: string, newPath: string): Promise<void> => {
    try {
      await renameFile(oldPath, newPath)
      queryClient.invalidateQueries({ queryKey: ['file', oldPath] })
      queryClient.invalidateQueries({ queryKey: ['file', newPath] })
    } catch (error) {
      console.error('Error renaming file:', error)
    }
  }

//   const createFileAndCache = async (path: string, content: string): Promise<void> => {
//     try {
//       await window.fileSystem.createFile(path, content)
//       queryClient.invalidateQueries({ queryKey: ['file', path] })
//     } catch (error) {
//       console.error('Error creating file:', error)
//     }
//   }

  const invalidateFile = (path: string): void => {
    queryClient.invalidateQueries({ queryKey: ['file', path] })
  }

  const prefetchFile = async (path: string): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: ['file', path],
      queryFn: async () => {
        const fileContent = await readTextFile(path)
        return fileContent
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    })
  }

  const createDirectory = async (path: string): Promise<void> => {
    try {
      await createDir(path)
    } catch (error) {
      console.error('Error creating directory:', error)
    }
  }

  const value = useMemo(
    () => ({
      readFileAndCache,
      writeFileAndCache,
      renameFileAndCache,
      deleteFileAndCache,
    //   createFileAndCache,
      invalidateFile,
      prefetchFile,
      createDirectory,
      renameFile,
    }),
    [queryClient],
  )

  return <FileCacheContext.Provider value={value}>{children}</FileCacheContext.Provider>
}

export const useFileCache = () => {
  const context = useContext(FileCacheContext)
  if (!context) {
    throw new Error('useFileCache must be used within a FileCacheProvider')
  }
  return context
}

export default FileCacheProvider
