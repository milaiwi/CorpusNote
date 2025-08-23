import { BlockNoteEditor } from "@blocknote/core";

// Defines the shape of a single input rule
export interface InputRule {
  regex: RegExp;
  action: (editor: BlockNoteEditor, match: RegExpMatchArray, context: EditorContext) => void;
}

// Context interface that can hold any functions from different contexts
export interface EditorContext {
  getCurrentFileSimilarFiles?: () => any[];
}

// Manages and processes all registered input rules
export class InputRuleManager {
  private rules: InputRule[];

  constructor(rules: InputRule[]) {
    this.rules = rules;
  }

  /**
   * Checks the current block's content against all registered rules.
   * This should be called inside the editor's onChange handler.
   */
  public process(editor: BlockNoteEditor, context: EditorContext): void {
    const currentBlock = editor.getTextCursorPosition().block;
    const blockContent = currentBlock.content[0]
    if (!blockContent) return
    
    if (blockContent.type === "text") {
        const blockText = blockContent.text
        console.log(`Block text:`, blockText)

        for (const rule of this.rules) {
            const match = blockText.match(rule.regex);
            console.log(`Match:`, match)
            if (match) {
                rule.action(editor, match, context);
            }
        }
    }

  }
}