// frontend/src/lib/ai/prompt.ts
import { Block } from "@blocknote/core";

export const compareNotesPrompt = {
    prompt: (data: { noteAContent: Block[], noteBContent: Block[] }) => `
        You are an intelligent note-taking assistant. Your task is to compare two notes and provide a synthesis.

        Here are the two notes:

        Note A:
        ---
        ${data.noteAContent.map(block => JSON.stringify(block.content)).join('\n')}
        --- 

        Note B:
        ---
        ${data.noteBContent.map(block => JSON.stringify(block.content)).join('\n')}
        ---

        Please provide a comparison and synthesis of these two notes. Focus on:
        - Key common themes and ideas.
        - Contrasting points or disagreements.
        - Potential connections or new insights that emerge from combining them.

        Present the result in clear, concise markdown.
    `,
}