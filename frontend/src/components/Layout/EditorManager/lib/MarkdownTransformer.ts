// frontend/src/components/layout/EditorManager/lib/MarkdownTransformer.ts
import { BlockNoteEditor, Block } from "@blocknote/core"

class MarkdownTransformer {
    private readonly editor: BlockNoteEditor

    constructor(editor: BlockNoteEditor) {
        this.editor = editor
    }

    /**
     * Parses the markdown content which is stored on disk into blocks
     * to later be rendered in the editor.
     * @param markdown The markdown content we want to parse read from
     * @returns The blocks parsed from the markdown content
     */
    async parse(markdown: string): Promise<Block[]> {
        // TODO: Later add our own custom markdown parser that
        // builds on top of the default markdown parser.
        
        // For instacne, adding custom regex to handle linking files
        // like [[corpusnotes:path/to/file.md]]
        const blocks = await this.editor.tryParseMarkdownToBlocks(markdown)
        return blocks
    }

    /**
     * Serializes the blocks into markdown content to be stored on disk.
     * @param blocks The blocks to serialize.
     * @returns The blocks serialized into markdown content
     */
    async serialize(blocks: Block[]): Promise<string> {
        const markdown = await this.editor.blocksToMarkdownLossy(blocks)
        return markdown
    }
}

export default MarkdownTransformer