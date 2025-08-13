// frontend/src/components/models/ollama.ts
export type OllamaTagsResp = {
    models: Array<OllamaModel>
}


export type OllamaModel = {
    details: Array<{
        families: Array<string>
        family: string
        format: string
        parameter_size: string,
        parent_model: string,
        quantization_level: string
    }>
    digest: string
    model: string
    modified_at: string
    size: number
}


/**
 * Fetch the models from the Ollama API
 * @returns The models from the Ollama API
 */
export const fetchOllamaModels = async (): Promise<OllamaTagsResp> => {
    const res = await fetch(
        "http://127.0.0.1:11434/api/tags",
        { method: "GET" }
    )
    const data = await res.json() as OllamaTagsResp
    return data
}