// backend/domain/llm/ModelClient.ts
export type Tool = { name: string, description?: string, schema?: any }

export type Message = {
    role: "user" | "assistant" | "system" | "tool",
    content: string,
}

export type GenerateParams = {
    prompt?: string,
    messages?: Message[],
    system?: string,
    temperature?: number,
    maxTokens?: number,
    stop?: string[],
    tools?: Tool[],
    json?: boolean,
    modelHint?: string,
    // context?: number[],
    // images?: Uint8Array[] | string[],
    // think?: boolean | 'high' | 'medium' | 'low',
}

export type EmbedParams = { inputs: string[] }

export type StreamHandler = (delta: { text?: string }) => void

export interface ModelClient {
    /** Single shot that returns full text */
    generate(params: GenerateParams): Promise<string>

    /** Streaming: returns final text and emits deltas */
    stream(params: GenerateParams, handler: StreamHandler): Promise<void>

    /** Embedding: returns vector embeddings */
    embed(params: EmbedParams): Promise<number[][]>

    /** Capabilities: returns the capabilities of the model */
    capabilities(): {
        toolUse: boolean,
        json: boolean,
        images: boolean,
        embeddings: boolean,
    }
}
