// backend/domain/llm/LanguageModel.ts

export interface LanguageModel {
    // Unique identifier for the model (e.g., 'ollama/llama3.2')
    getIdentifier(): string
    
    // The display name (e.g., "Llama 3" or "GPT-4o")
    getDisplayName(): string

    // The core method for text generation
    generate(prompt: string): Promise<string>
}