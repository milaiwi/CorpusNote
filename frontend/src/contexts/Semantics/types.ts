// frontend/src/contexts/Semantics/types.ts

export interface SearchResult {
    file_path: string,
    text: string,
    source_block_ids: string[],
    score: number,
    embedding: number[],
}