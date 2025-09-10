// backend/domain/llm/LanguageModel.ts

export interface LanguageModel {
    // Unique identifier for the model (e.g., 'ollama/llama3.2')
    getIdentifier(): string
    
    // The display name (e.g., "Llama 3" or "GPT-4o")
    getDisplayName(): string

    // The core method for text generation
    generate(prompt: string): Promise<string>

    /**
     * Generates a response as a stream of text chunks.
     * @param prompt The input prompt for the model.
     * @param onChunk A callback function that is invoked for each received chunk of text.
     * @returns A promise that resoles when the stream is complete.
     */
    generateStream(prompt: string, onChunk: (chunk: string) => void): Promise<void>;
}