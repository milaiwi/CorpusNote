// frontend/src/caches/FileSystemCache

import { readTextFile } from "@tauri-apps/api/fs"
import { FileItem } from "../components/Layout/FileSidebar/utils"

interface CachedFile extends FileItem {
    content: string,
    isDirty: boolean,
    isLoading: boolean,
}

// We sync our file items writes into a queue and update
// the queue for the specific path when it gets completed.
interface WriteQueueItem {
    absPath: string
    content: string
    resolve: () => void
    reject: (error: any) => void
}

export class FileSystemCache {
    private cache = new Map<string, CachedFile>()
    private writeQueues = new Map<string, WriteQueueItem>()

    constructor (private vaultPath: string | undefined) {}

    /**
     * Read file content -- always return the in-memory state that we cached
     */
    async readFile(path: string): Promise<string> {
        const cached = this.cache.get(path)
        if (cached)
            return cached.content
    
        return await this.loadFileToCache(path)
    }

    async loadFileToCache(path: string): Promise<string> {
        this.updateCache(path, { isLoading: true })

        try {
            const content = await readTextFile(path)

            // @ts-ignore - ts doesn't recognize this sets and updates
            // each argument despite spreading the old cache values out
            this.cache.set(path, {
                ...this.cache.get(path),
                absPath: path,
                content,
                isDirty: false,
                isLoading: false,
                timeModified: Date.now(),
                currentPosition: 0,
            })
            return content
        } catch (error) {
            this.cache.delete(path)
            throw error
        }
    }

    // ----- Utility Methods -----
    private updateCache(path: string, updates: Partial<CachedFile>): void {
        const cached = this.cache.get(path)
        if (cached)
            this.cache.set(path, { ...cached, ...updates})
    }
}