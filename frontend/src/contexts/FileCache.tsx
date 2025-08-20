"use client"
// src/contexts/FileCache.tsx
import React, { useContext, useMemo } from 'react'
import { createDir, readTextFile, writeTextFile, renameFile, removeFile, exists } from '@tauri-apps/api/fs'
import { fetchOllamaModels, OllamaTagsResp } from '../components/models/ollama'
import { FileItem } from '../components/layout/FileSidebar/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useAppSettings } from './AppContext'

import { join } from '@tauri-apps/api/path'
import { Block } from '@blocknote/core'

/**
 * A helper function to generate the path for the shadow JSON file.
 * It replaces directory separators with a safe character to create a flat file structure
 * within the .corpus-notes directory.
 * @param vaultPath The absolute path to the user's vault.
 * @param originalPath The absolute path of the original markdown file.
 * @returns The absolute path for the corresponding shadow JSON file.
 */
const getShadowPath = async (vaultPath: string, originalPath: string): Promise<string> => {
  const relativePath = originalPath.replace(vaultPath, '')
  const safeFileName = relativePath.replace(/[\/\\]/g, '_') + '.json'
  return await join(vaultPath, '.corpus-notes', safeFileName)
}


interface FileCacheContextType {
  // File operations with cache validation and invalidation
  readFileAndCache: (file: FileItem) => Promise<{ content: Block[] | string; source: 'json' | 'markdown'} | null>
  writeFileAndCache: (file: FileItem, content: Block[], markdown?: string) => Promise<void>
  renameFileAndCache: (oldPath: string, newPath: string) => Promise<void>
  deleteFileAndCache: (path: string) => Promise<void>

  // Cache management
  invalidateFile: (path: string) => void
  prefetchFile: (path: string) => Promise<void>
  prefetchOllamaModels: () => Promise<OllamaTagsResp | null>

  // File system operations with no cache validation
  createDirectory: (path: string) => Promise<void>
}

const FileCacheContext = React.createContext<FileCacheContextType | undefined>(undefined)

const FileCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient()
  const { vaultPath } = useAppSettings()

  const readFileAndCache = async (file: FileItem): Promise<{ content: Block[] | string; source: 'json' | 'markdown'} | null> => {
    try {
      const queryKey = ['note-blocks', file.absPath]
      // Use the cache instead of bypassing it
      const cachedData = queryClient.getQueryData<Block[]>(queryKey)
      if (cachedData)
        return { content: cachedData, source: 'json' }

      const shadowPath = await getShadowPath(vaultPath, file.absPath)

      try {
        console.log(`[FileCache] Checking if shadow file exists: ${shadowPath}`)
        if (await exists(shadowPath)) {
          const jsonString = await readTextFile(shadowPath)
          const blocks = JSON.parse(jsonString) as Block[]
          queryClient.setQueryData(queryKey, blocks)
          return { content: blocks, source: 'json' }
        }
      } catch (e) {
        console.error('Error reading shadow file:', e)
      }

      // If the shadow file doesn't exist, read the markdown file
      const markdown = await readTextFile(file.absPath)
      return { content: markdown, source: 'markdown' }
    } catch (error) {
      console.error('Error reading file:', error)
      return null
    }
  }

  const writeFileAndCache = async (file: FileItem, content: Block[], markdown?: string): Promise<void> => {
    const shadowPath = await getShadowPath(vaultPath, file.absPath)
    const queryKey = ['note-blocks', file.absPath]
    try {
      const jsonString = JSON.stringify(content, null, 2)
      console.log(`Writing shadow file: ${shadowPath}`)
      await writeTextFile(shadowPath, jsonString)
      console.log(`[FileCache] Shadow file written: ${shadowPath}`)
      if (markdown) {
        console.log(`[FileCache] Markdown file written: ${file.absPath}`)
        await writeTextFile(file.absPath, markdown)
      }
        
      queryClient.setQueryData(queryKey, content)
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  }


  const deleteFileAndCache = async (path: string): Promise<void> => {
    const shadowPath = await getShadowPath(vaultPath, path)
    const queryKey = ['note-blocks', path]
    try {
      if (await exists(shadowPath)) {
        // Remove from the shadow file
        await removeFile(shadowPath)
      }
      // Now remove the actual '.md' file
      await removeFile(path)
      queryClient.removeQueries({ queryKey })
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const renameFileAndCache = async (oldPath: string, newPath: string): Promise<void> => {
    const oldShadowPath = await getShadowPath(vaultPath, oldPath)
    const newShadowPath = await getShadowPath(vaultPath, newPath)
    const oldQueryKey = ['note-blocks', oldPath]
    const newQueryKey = ['note-blocks', newPath]
    try {
      await renameFile(oldPath, newPath)
      if (await exists(oldShadowPath)) {
        await renameFile(oldShadowPath, newShadowPath)
      }

      queryClient.removeQueries({ queryKey: oldQueryKey })
      queryClient.invalidateQueries({ queryKey: newQueryKey })
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

  const prefetchOllamaModels = async (): Promise<OllamaTagsResp | null> => {
    const _models = await queryClient.fetchQuery({
      queryKey: ['ollamaModels'],
      queryFn: fetchOllamaModels,
      staleTime: 1000 * 60 * 20, // 20 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    })
    return _models
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
      prefetchOllamaModels,
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
