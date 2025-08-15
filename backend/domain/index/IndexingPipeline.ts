// backend/domain/index/IndexingPipeline.ts

import { FileItem } from "@/src/components/layout/FileSidebar/utils"
import { readTextFile } from "@tauri-apps/api/fs"
import { splitBlocksIntoChunks } from "./chunking"
import { Block } from "@blocknote/core"
import { Embedding } from "../llm/embedding"

async function processFile(
    file: FileItem,
    parseMarkdownToBlocks: (markdown: string) => Promise<Block[]>,
    embeddingModel: Embedding
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

    console.log(`[Worker] Split into ${chunks.length} chunks`)
    let i = 0
    for (const chunk of chunks) {
        console.log(`[Worker] Chunk ${i}: ${JSON.stringify(chunk, null, 2)}`)
        i++
    }
    // Step 3: Embed the chunks
    console.log(`[Worker] Attempting Embedding ${chunks.length} chunks`)
    const embeddings = await embeddingModel.batchEmbed(chunks.map(chunk => chunk.text))
    console.log(`[Worker] Finsihed embeddings with size ${embeddings.length}`)

    // Step 4: Store the embeddings in the vector database

    // Step 5: Update the manifest file
}

class IndexingPipeline {
    private indexingQueue: FileItem[] = []
    private isWorkerRunning: boolean = false
    private workerIntervalId: NodeJS.Timeout | null = null
    private verbose: boolean = false
    private parseMarkdownToBlocks: (markdown: string) => Promise<Block[]>
    private embeddingModel: Embedding

    constructor(parseMarkdownToBlocks: (markdown: string) => Promise<Block[]>, embeddingModel: Embedding, verbose: boolean = false) {
        this.parseMarkdownToBlocks = parseMarkdownToBlocks
        this.embeddingModel = embeddingModel
        this.verbose = verbose
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
            await processFile(fileToIndex, this.parseMarkdownToBlocks, this.embeddingModel)
        } catch (error) {
            console.error(`[Worker] Failed to process file ${fileToIndex.absPath}`, error)
        } finally {
            this.startWorker()
        }
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