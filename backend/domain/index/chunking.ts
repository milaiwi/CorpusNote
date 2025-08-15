// backend/domain/index/chunking.ts


const MAX_CHUNK_SIZE_IN_CHARS = 4096;

/**
 * Splits a raw markdown string into chunks based on headings and a character limit.
 * - Each heading starts a new semantic chunk.
 * - If a section under a heading exceeds the character limit, it is split into
 * smaller chunks.
 * - Every chunk created from a split is prepended with the original heading
 * to preserve context for the embedding model.
 * @param markdownContent The raw markdown string from a file.
 * @returns An array of strings, where each string is a content chunk.
 */
export const splitMarkdownIntoChunks = (markdownContent: string): string[] => {
    const chunks: string[] = [];
    if (!markdownContent) {
        return chunks;
    }

    const lines = markdownContent.split('\n');
    let currentChunk = "";
    let currentHeading = "";
    const headingRegex = /^(#+)\s(.*)/; // Matches lines starting with #, ##, etc.

    for (const line of lines) {
        const headingMatch = line.match(headingRegex);

        if (headingMatch) {
            if (currentChunk.trim() !== "" && currentChunk.trim() !== currentHeading.trim()) {
                chunks.push(currentChunk.trim());
            }

            currentHeading = line + "\n\n";
            currentChunk = currentHeading;
            continue;
        }

        if (line.trim() === "") continue; // Skip empty lines

        const potentialChunkSize = currentChunk.length + line.length + 1; // +1 for newline

        if (potentialChunkSize > MAX_CHUNK_SIZE_IN_CHARS && currentChunk.length > currentHeading.length) {
            chunks.push(currentChunk.trim());            
            currentChunk = currentHeading + line + "\n";
        } else {
            currentChunk += line + "\n";
        }
    }

    if (currentChunk.trim() !== "" && currentChunk.trim() !== currentHeading.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};
