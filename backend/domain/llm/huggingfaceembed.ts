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
        const embedding = await this.model(text)
        return embedding.data
    }

    public async batchEmbed(texts: string[]): Promise<number[][]> {
        const embeddings = await Promise.all(texts.map(text => this.embed(text)))
        const plainEmbeddings = embeddings.map(arr => Array.from(arr))
        return plainEmbeddings
    }

    public similarity(embedding1: number[], embedding2: number[]): number {
        const similarity = cos_sim(embedding1, embedding2)
        return similarity
    }

    public async batchSimilarity(embedding1: number[], embedding2: number[]): Promise<number[]> {
        return this.model.similarity(embedding1, embedding2)
    }
    
    public getEmbeddingDimension(): number {
        return this.model.embedding_dimension
    }
}

export default HuggingFaceEmbed