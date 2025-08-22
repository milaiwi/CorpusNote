import { Block } from "@blocknote/core";

// A reasonable approximation for a token limit. 
// Average token is ~4 chars. 1024 * 4 = 4096.
const MAX_CHUNK_SIZE_IN_CHARS = 4096;

export interface Chunk {
    text: string;
    sourceBlockIds: string[];
}

/**
 * Converts the `InlineContent[]` of a BlockNote block into a plain string.
 */
const inlineContentToString = (content: any): string => {
    if (Array.isArray(content)) {
        return content.map(item => {
            if ('text' in item) {
                return item.text || '';
            }
            return '';
        }).join('');
    }
    return '';
};

/**
 * Splits BlockNote content into chunks based on headings and a character limit.
 * Each chunk includes the text content and the IDs of the source blocks.
 * @param blocks The array of Block objects from a BlockNote editor.
 * @returns An array of Chunk objects.
 */
export const splitBlocksIntoChunks = (blocks: Block[]): Chunk[] => {
    const chunks: Chunk[] = [];
    if (!blocks || blocks.length === 0) {
        return chunks;
    }

    let currentChunkText = "";
    let currentChunkBlockIds: string[] = [];
    let currentHeadingText = "";

    for (const block of blocks) {
        if (block.type === 'heading') {
            if (currentChunkText.trim() !== "" && currentChunkText.trim() !== currentHeadingText.trim()) {
                chunks.push({ text: currentChunkText.trim(), sourceBlockIds: [...currentChunkBlockIds] });
            }

            currentHeadingText = inlineContentToString(block.content) + "\n\n";
            currentChunkText = currentHeadingText;
            currentChunkBlockIds = [block.id];
            continue;
        }

        const blockText = block.content ? inlineContentToString(block.content) : '';
        if (blockText.trim() === "") continue; // Skip empty blocks

        const potentialChunkSize = currentChunkText.length + blockText.length + 2; // +2 for newlines

        if (potentialChunkSize > MAX_CHUNK_SIZE_IN_CHARS && currentChunkText.length > currentHeadingText.length) {
            chunks.push({ text: currentChunkText.trim(), sourceBlockIds: [...currentChunkBlockIds] });
            
            currentChunkText = currentHeadingText + blockText;
            currentChunkBlockIds = [block.id];
        } else {
            currentChunkText += blockText + "\n\n";
            currentChunkBlockIds.push(block.id);
        }
    }

    if (currentChunkText.trim() !== "" && currentChunkText.trim() !== currentHeadingText.trim()) {
        chunks.push({ text: currentChunkText.trim(), sourceBlockIds: [...currentChunkBlockIds] });
    }

    return chunks;
};
