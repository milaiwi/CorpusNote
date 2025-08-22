import { Block } from "@blocknote/core"


export const extractTextFromBlocks = (blocks: Block[]) => {
    return blocks.map(block => {
        if (Array.isArray(block.content)) {
            return block.content.map(item => {
                return extractTextFromBlock(item)
            }).join('')
        }
        return ''
    }).join('\n')
}

export const extractTextFromBlock = (item: any) => {
    if (item.type === "text") {
        return item.text
    } else if (item.type === "link") {
        if (Array.isArray(item.content)) {
            return item.content.map(linkItem => 
                linkItem.type === 'text' ? linkItem.text : ''
            ).join('')
        }
        return ''
    }
}