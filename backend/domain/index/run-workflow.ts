// frontend/domain/index/run-workflow
import React from 'react'

import { FileItem } from '@/src/components/layout/FileSidebar/utils'
import { join } from '@tauri-apps/api/path'
import { exists, writeFile, readTextFile } from '@tauri-apps/api/fs'
import IndexingPipeline from './IndexingPipeline'
import { Block } from '@blocknote/core'
import { Embedding } from '../llm/embedding'
import { invoke } from '@tauri-apps/api/tauri'
// import VectorDBManager from '../db/db'


/**
 * Returns the files that are new in the vault that do not exist in the manifest.
 * Right now this is just a O(N^2) check, but the FileTree is most likely
 * not large enough for this to be a problem. We can later optimize this
 * but I do not think it's worth the effort right now.
 * 
 * @param files - The files in the vault
 * @param manifestJson - The manifest file
 * @returns The new files and the removed files
 */
const diffCheck = (files: FileItem[], manifestJson: any[]): FileItem[] => {
    const filesToIndex: FileItem[] = []
    
    for (const file of files) {
        if (file.isDirectory)
            continue

        const manifestFile = manifestJson.find(mf => mf.absPath === file.absPath)
        
        if (!manifestFile) {
            filesToIndex.push(file)
        } else if (file.timeModified !== manifestFile.timeModified) {
            // File exists but modification time is different - needs re-indexing
            filesToIndex.push(file)
        }
    }
    
    return filesToIndex
}

/**
 * Fetches the manifest file from the vault.
 * If the manifest file does not exist, it creates an empty one.
 * 
 * @param vaultPath - The path to the vault
 * @returns The manifest file
 */
const fetchManifest = async (vaultPath: string) => {
    const corpusDir = await join(vaultPath, '.corpus-notes')
    const manifestPath = await join(corpusDir, '.vector-indexing-manifest.json')
    const manifestExists = await exists(manifestPath)
    if (!manifestExists)
        await writeFile(manifestPath, JSON.stringify([]))

    console.log('Manifest path loaded.')
    const manifest = await readTextFile(manifestPath)
    const manifestJson = JSON.parse(manifest)
    return manifestJson
}

const runIndexingPipeline = async (
    vaultPath: string,
    files: FileItem[],
    parseMarkdownToBlocks: (markdown: string) => Promise<Block[]>,
    embeddingModel: Embedding,
) => {
    console.log(`[Worker] Embedding dimension: ${embeddingModel.getEmbeddingDimension()}`)
    const manifestJson = await fetchManifest(vaultPath)
    const newFiles = diffCheck(files, manifestJson)
    const verbose = true

    if (newFiles.length > 0) {
        console.log(`Creating indexing pipeline...`)
        const pipeline = new IndexingPipeline(parseMarkdownToBlocks, embeddingModel, verbose)
        pipeline.addToQueue(newFiles)
        pipeline.startWorker()
    } else {
        console.log("No new files to index.")
    }
}

export default runIndexingPipeline