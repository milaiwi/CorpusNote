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
    data: T
) => {
    if (!model) throw new Error("Model not found")

    const fullPrompt = prompt.prompt(data)
    console.log(`[runAITask] Running prompt: ${fullPrompt}`)
    const response = await model.generate(fullPrompt)
    console.log(`[runAITask] Response: ${response}`)
    return response
}