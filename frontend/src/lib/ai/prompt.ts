// frontend/src/lib/ai/prompt.ts

import { FileItem } from "../../components/layout/FileSidebar/utils";

export const compareNotesPrompt = {
    prompt: (data: { noteAContent: string, noteBContent: string, fileA: FileItem, fileB: FileItem }) => `
        You are an intelligent note-taking assistant. Your task is to compare two notes and provide a synthesis.

        Amswer Start: - Begin your answer with a few sentences that provide a summary of the overall comparison.

        Here is an example of a good comparison:

        ---
        EXAMPLE START
        ---

        USER:
        Here are the two notes:

        Note A (OOP Principles.md):
        ---
        Object-Oriented Programming is a paradigm centered around objects. Key principles are encapsulation, which bundles data with the methods that operate on it, and inheritance, which allows a new class to reuse and extend functionality from an existing class. This helps manage complexity by modeling real-world entities.
        --- 

        Note B (Functional Programming Concepts.md):
        ---
        Functional Programming treats computation as the evaluation of mathematical functions. It emphasizes pure functions, which have no side effects, and immutable data. Instead of loops, it often uses recursion and higher-order functions like map and reduce. The goal is to create more predictable and testable code.
        ---

        Please provide a comparison and synthesis of these two notes. Focus on:
        - Key common themes and ideas.
        - Contrasting points or disagreements.
        - Potential connections or new insights that emerge from combining them.

        Present the result in clear, concise markdown.

        ASSISTANT:
        ### Note Comparison: OOP vs. Functional Programming

        Here is a synthesis of the notes on "OOP Principles.md" and "Functional Programming Concepts.md".

        #### Key Common Themes
        * **Complexity Management**: Both paradigms are fundamentally about writing cleaner, more maintainable, and less complex code at scale. They provide high-level abstractions to organize logic.

        #### Contrasting Points
        * **State Management**: OOP manages state by encapsulating it within objects, while Functional Programming minimizes state, favoring immutable data structures to avoid side effects.
        * **Core Units**: The core unit in OOP is the **object**, which bundles data and behavior. In Functional Programming, the core unit is the **function**, which transforms data.
        * **Flow Control**: OOP often relies on loops and conditional statements. Functional programming tends to use function composition, recursion, and higher-order functions.

        #### Synthesis & New Insights
        * **Hybrid Approaches**: These paradigms are not mutually exclusive. Many modern languages (like Python, JavaScript, and C#) are multi-paradigm, allowing developers to use OOP principles for overall structure (e.g., defining services) and functional techniques for data manipulation (e.g., processing lists of items).
        * **Problem Domain**: The choice often depends on the problem. OOP can be intuitive for modeling systems with distinct, stateful entities (like a user interface with buttons and windows). Functional Programming excels in data processing, parallel computing, and mathematical tasks where predictability is paramount.

        ---
        EXAMPLE END
        ---

        Here are the two notes:

        Note A (${data.fileA.name}):
        ---
        ${data.noteAContent}
        --- 

        Note B (${data.fileB.name}):
        ---
        ${data.noteBContent}
        ---

        Please provide a comparison and synthesis of these two notes. Focus on:
        - Key common themes and ideas.
        - Contrasting points or disagreements.
        - Potential connections or new insights that emerge from combining them.

        Present the result in clear, concise markdown.
        Note: Do not focus on formatting. Focus only on the structure and content of the notes, with more emphasis on the content.

    `,
}