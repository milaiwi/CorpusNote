// backend/domain/infrastructure/OllamaClient.ts
import { ModelClient, GenerateParams, StreamHandler } from '../llm/ModelClient'
import { Ollama } from 'ollama'

export class OllamaClient implements ModelClient {
    private model: Ollama

    constructor(private readonly defaultModel: string) {
        this.model = new Ollama()
    }

    capabilities(): { toolUse: boolean, json: boolean, images: boolean, embeddings: boolean } {
        return { toolUse: false, json: false, images: false, embeddings: true }
    }

    async generate(params: GenerateParams): Promise<string> {
        const { prompt, temperature, maxTokens, modelHint } = params
        const modelName = modelHint ?? this.defaultModel
        console.log(`Generating with model: ${modelName}`)

        const resp = await this.model.generate({
            model: modelName,
            prompt: prompt ?? "",
            options: {
                temperature: temperature,
                num_predict: maxTokens
            }
        })
        return resp.response
    }

    async stream(params: GenerateParams, onDelta: StreamHandler): Promise<void> {
        const { prompt, messages, modelHint, temperature, maxTokens } = params
        const input = prompt ?? (messages ?? []).map(m => `${m.role}: ${m.content}`).join("\n")
        const modelName = modelHint ?? this.defaultModel

        const iterator = await this.model.generate({
            model: modelName,
            prompt: input,
            stream: true,
            options: {
                temperature: temperature,
                num_predict: maxTokens
            }
        })

        for await (const chunk of iterator) {
            const line = safeParse(chunk.response)
            if (line?.response) onDelta({ text: line.response })
            if (line?.done) break
        }
    }

    async embed({ inputs, modelHint }: { inputs: string[], modelHint?: string }): Promise<number[][]> {
        try {
            const modelName = modelHint ?? this.defaultModel
            const resp = await this.model.embed({
                model: modelName,
                input: inputs
            })
            return resp.embeddings
        } catch (e) {
            console.error(`Error embedding: ${e}`)
            throw e
        }
    }
}

const safeParse = (s: string) => { try { return JSON.parse(s) } catch (e) { return null } }
