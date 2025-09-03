import { defaultProps } from '@blocknote/core'
import { createReactInlineContentSpec } from '@blocknote/react'
import { InputRule, markInputRule } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import { SyntheticEvent } from 'react'

/**
 * The input regex for Markdown links with title support, and multiple quotation marks (required
 * in case the `Typography` extension is being included).
 */
const inputRegex = /(?:^|\s)\[([^\]]*)?\]\((\S+)(?: ["“](.+)["”])?\)$/i

// Custom extension to handle links to files
// Instead of a traditional external link, this will open the file in the editor

export const makeFileLink = (loadFilePathIntoEditor: (path: string) => Promise<void>) => {
    return createReactInlineContentSpec(
        {
            "type": "fileLink",
            "content": "none",
            "propSchema": {
                ...defaultProps,
                "path": { type: "string", default: "" },
                "name": { type: "string", default: "Open File"}
            }
        },
        {
            render: (props) => {
                const { path, name } = props.inlineContent.props
    
                const open = (e: SyntheticEvent) => {
                    e.preventDefault()
                    console.log(`Path: `, path)
                    loadFilePathIntoEditor(path)
                }

                return (
                    <span
                        data-inline-type="fileLink"
                        role="button"
                        tabIndex={0}
                        onClick={open}
                        onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') open(e)
                        }}
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                        className="cursor-pointer not-prose"
                        aria-label={`Open ${name}`}
                    >
                        {name}
                    </span>
                )
            }
        }
    )
}


/**
 * Input rule built specifically for the `Link` extension, which ignores the auto-linked URL in
 * parentheses (e.g., `(https://doist.dev)`).
 *
 * @see https://github.com/ueberdosis/tiptap/discussions/1865
 */
function linkInputRule(config: Parameters<typeof markInputRule>[0]) {
    const defaultMarkInputRule = markInputRule(config)
    
    return new InputRule({
      find: config.find,
      handler(props) {
        const { tr } = props.state
  
        defaultMarkInputRule.handler(props)
        tr.setMeta('preventAutolink', true)
      },
    })
  }

const RichTextLink = Link.extend({
    inclusive: false,
    addAttributes() {
        return {
            ...this.parent?.(),
            title: {
                default: null,
            },
        }
    },
    addInputRules() {
        return [
          linkInputRule({
            find: inputRegex,
            type: this.type,
    
            // We need to use `pop()` to remove the last capture groups from the match to
            // satisfy Tiptap's `markPasteRule` expectation of having the content as the last
            // capture group in the match (this makes the attribute order important)
            getAttributes(match) {
              return {
                title: match.pop()?.trim(),
                href: match.pop()?.trim(),
              }
            },
          }),

        ]
      },
})

export default RichTextLink