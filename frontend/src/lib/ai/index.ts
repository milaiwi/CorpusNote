// frontend/src/lib/ai/index.ts

import { LocalModel } from "../../../../backend/domain/llm/LocalModel";

interface AIPrompt<T> {
    prompt: (data: T) => string
}

/**
 * Takes a model and a prompt and runs the prompt on the model.
 * Returns the response from the model.
 * 
 * @param model - The model to use
 * @param prompt - The prompt to use
 * @param data - The data to use
 * @returns 
 */
export const runAITask = async<T>(
    model: LocalModel,
    prompt: AIPrompt<T>,
    data: T,
    stream?: boolean,
    onChunk?: (chunk: string) => void
) => {
    if (!model) throw new Error("Model not found")

    if (stream) {
        const fullPrompt = prompt.prompt(data)
        console.log(`[runAITask] Running prompt: ${fullPrompt}`)
        await model.generateStream(fullPrompt, onChunk)
        return
    } else {
        const fullPrompt = prompt.prompt(data)
        console.log(`[runAITask] Running prompt: ${fullPrompt}`)
        const response = await model.generate(fullPrompt)
        return response
    }
}