// backend/domain/llm/embedding.ts

import { z } from "zod";

const embeddingModelSchema = z.enum(["openai", "huggingface"]);


abstract class Embedding {
    protected model: any

    constructor(modelName: string) {}

    abstract getInstance(modelName: string): Promise<Embedding>;

    abstract embed(text: string): Promise<number[]>;
    
    abstract batchEmbed(texts: string[]): Promise<number[][]>;

    abstract similarity(embedding1: number[], embedding2: number[]): number;

    abstract batchSimilarity(embedding1: number[], embedding2: number[]): Promise<number[]>;
}

export { embeddingModelSchema, Embedding }