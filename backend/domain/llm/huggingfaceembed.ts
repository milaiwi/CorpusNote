// backend/domain/llm/huggingfaceembed.ts

import { Embedding } from "./embedding";
import { pipeline, cos_sim } from "@huggingface/transformers"

const DEFAULT_EMBED_MODEL = 'Xenova/all-MiniLM-L6-v2'

class HuggingFaceEmbed extends Embedding {
    private static instance: HuggingFaceEmbed | null = null
    private modelName: string

    constructor(modelName: string) {
        super(modelName)
        this.modelName = modelName
    }

    public async getInstance(modelName: string = DEFAULT_EMBED_MODEL): Promise<Embedding> {
        if (!HuggingFaceEmbed.instance || HuggingFaceEmbed.instance.modelName !== modelName) {
            HuggingFaceEmbed.instance = new HuggingFaceEmbed(modelName)
            await HuggingFaceEmbed.instance.loadModel()
        }
        return HuggingFaceEmbed.instance
    }

    private async loadModel(): Promise<void> {
        this.model = await pipeline('feature-extraction', this.modelName)
    }

    public async embed(text: string): Promise<number[]> {
        const embedding = await this.model(text, {
            pooling: 'mean',
            normalize: true
        })
        return embedding.data
    }

    public async batchEmbed(texts: string[]): Promise<number[][]> {
        const embeddings = await this.model(texts, {
            pooling: 'mean',
            normalize: true
        })
        const result: number[][] = []
        for (let i = 0; i < embeddings.dims[0]; i++) {
            result.push(Array.from(embeddings.data.slice(embeddings.dims[1] * i, embeddings.dims[1] * (i + 1))))
        }
        return result
    }

    public similarity(embedding1: number[], embedding2: number[]): number {
        const similarity = cos_sim(embedding1, embedding2)
        return similarity
    }

    public async batchSimilarity(embedding1: number[], embedding2: number[]): Promise<number[]> {
        return this.model.similarity(embedding1, embedding2)
    }
    
    public async getEmbeddingDimension(): Promise<number> {
        return (await this.embed('hello world')).length
    }
}

export default HuggingFaceEmbed