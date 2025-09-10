// backend/domain/llm/LocalModel.ts
import { LanguageModel } from "./LanguageModel"
import { invoke } from "@tauri-apps/api/tauri"
import { listen } from "@tauri-apps/api/event"

export class LocalModel implements LanguageModel {
    private modelName: string

    constructor(modelName: string) {
        this.modelName = modelName
    }

    getIdentifier(): string {
        return `ollama/${this.modelName}`
    }

    getDisplayName(): string {
        return this.modelName
    }

    async generate(prompt: string): Promise<string> {
        try {
            const response = await invoke("ollama_generate", {
                model: this.modelName,
                prompt: prompt,
            })
            console.log(`[LocalModel] Generated response: ${response}`)
            return response as string
        } catch (error) {
            console.error(`[LocalModel] Failed to generate response: ${error}`)
            throw error
        }
    }

    async generateStream(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
        const eventName = `ollama_chunk_${Date.now()}`

        const unlisten = await listen<string>(eventName, (event: any) => {
            onChunk(event.payload)
        })

        try {
            await invoke('ollama_generate_stream', {
                model: this.modelName,
                prompt: prompt,
                onchunk: eventName,
            })
        } catch (error) {
            console.error(`[LocalModel] Failed to generate stream: ${error}`)
            throw error
        } finally {
            unlisten()
        }
    }
}