// backend/domain/index/IndexingPipeline.ts

import { FileItem } from "@/src/components/layout/FileSidebar/utils"
import { readTextFile, writeFile } from "@tauri-apps/api/fs"
import { splitBlocksIntoChunks } from "./chunking"
import { Block } from "@blocknote/core"
import { Embedding } from "../llm/embedding"
import { invoke } from "@tauri-apps/api/tauri"
import { join } from "@tauri-apps/api/path"
// import VectorDBManager from "../db/db"

async function processFile(
    file: FileItem,
    parseMarkdownToBlocks: (markdown: string) => Promise<Block[]>,
    embeddingModel: Embedding,
    embed_dim: number,
    tableName: string
) {
    // Step 1: Load the content
    // TODO: We could optimize this by caching the content
    // for potential future use. However, our current cache
    // system works by storing BLOCKS and not markdown.
    // We convert markdown -> blocks from our editor which is 
    // a subchild of this component and therefore we do not have
    // access to it. We can fix this by making it global, but that's
    // a future problem.
    const content = await readTextFile(file.absPath)

    // Step 2: Split the content into chunks
    const blocks = await parseMarkdownToBlocks(content)
    const chunks = splitBlocksIntoChunks(blocks)

    // Step 3: Embed the chunks
    const embeddings = await embeddingModel.batchEmbed(chunks.map(chunk => chunk.text))
    // console.log(`[Worker] Finished embeddings with size ${embeddings.length}`)

    // Step 4: Store the embeddings in the vector database
    // First convert into our db chunk - backend will handle ID generation
    // console.log(`[Worker] Converting chunks to db chunks`)
    const dbChunks = chunks.map((chunk, index) => ({
        file_path: file.absPath,
        text: chunk.text,
        source_block_ids: chunk.sourceBlockIds,
        embedding: Array.from(embeddings[index]),
    }))

    try {
        const result = await invoke('insert_chunks', { 
            name: tableName, 
            chunks: dbChunks,
            embedDim: embed_dim
        })
        console.log(`[Worker] Successfully inserted chunks: ${result}`)
    } catch (error) {
        console.error(`[Worker] Failed to insert chunks:`, error)
        throw error
    }

    // Step 6: Update the manifest file (placeholder for future implementation)
    console.log(`[Worker] File ${file.absPath} processed successfully`)
}

class IndexingPipeline {
    private vaultPath: string
    private manifestJson: any[]
    private indexingQueue: FileItem[] = []
    private isWorkerRunning: boolean = false
    private workerIntervalId: NodeJS.Timeout | null = null
    private verbose: boolean = false
    private parseMarkdownToBlocks: (markdown: string) => Promise<Block[]>
    private embeddingModel: Embedding
    private embed_dim: number
    private tableName: string

    constructor(
        vaultPath: string,
        manifestJson: any[],
        parseMarkdownToBlocks: (markdown: string) => Promise<Block[]>,
        embeddingModel: Embedding,
        embed_dim: number,
        verbose: boolean = false,
        tableName: string = "indexing_table"
    ) {
        this.vaultPath = vaultPath
        this.manifestJson = manifestJson
        this.parseMarkdownToBlocks = parseMarkdownToBlocks
        this.embeddingModel = embeddingModel
        this.embed_dim = embed_dim
        this.verbose = verbose
        this.tableName = tableName
    }

    public addToQueue(files: FileItem[]): void {
        files.forEach(file => {
            if (!this.indexingQueue.some(item => item.absPath === file.absPath)) {
                this.indexingQueue.push(file)
            }
        })
    }

    private async processQueue(): Promise<void> {
        if (this.indexingQueue.length === 0)
            return

        this.stopWorker()

        const fileToIndex = this.indexingQueue.shift()
        if (!fileToIndex) {
            this.startWorker()
            return
        }

        try {
            await processFile(fileToIndex, this.parseMarkdownToBlocks, this.embeddingModel, this.embed_dim, this.tableName)
            this.updateManifest(fileToIndex)
        } catch (error) {
            console.error(`[Worker] Failed to process file ${fileToIndex.absPath}`, error)
        } finally {
            this.startWorker()
        }
    }

    private async updateManifest(file: FileItem) {
        const manifestPath = await join(this.vaultPath, '.corpus-notes', '.vector-indexing-manifest.json')
        this.manifestJson.push({
            absPath: file.absPath,
            timeCreated: file.timeCreated,
            timeModified: file.timeModified,
        })
        await writeFile(manifestPath, JSON.stringify(this.manifestJson))
    }

    public startWorker(): void {
        if (this.isWorkerRunning)
            return
    
        if (this.verbose) console.log(`Starting indexing worker...`)
        this.isWorkerRunning = true
        // Acts similar to a throttle since we do not want to process
        // the entire queue since we have CPU expensive tasks like
        // embedding and chunking. Therefore, we process the queue
        // every 2 seconds.
        this.workerIntervalId = setInterval(() => this.processQueue(), 2000)
    }

    public stopWorker(): void {
        if (!this.isWorkerRunning || !this.workerIntervalId)
            return

        if (this.verbose) console.log(`Stopping indexing worker...`)
        clearInterval(this.workerIntervalId)
        this.isWorkerRunning = false
        this.workerIntervalId = null
    }
}

export default IndexingPipeline