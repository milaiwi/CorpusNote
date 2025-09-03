import { ReactNode } from "react";
import { BlockNoteEditor } from "@blocknote/core";

export type SetPopoverFunc = (component: ReactNode) => void

// Defines the shape of a single input rule
export interface InputRule {
  regex: RegExp;
  action: (editor: BlockNoteEditor, match: RegExpMatchArray, context: EditorContext, setPopover: SetPopoverFunc) => void;
}

// Context interface that can hold any functions from different contexts
export interface EditorContext {
  getCurrentFileSimilarFiles?: () => any[];
}

// Manages and processes all registered input rules
export class InputRuleManager {
  private rules: InputRule[];
  private activeRule: InputRule | null = null;
  private lastMatch: RegExpMatchArray | null = null;

  constructor(rules: InputRule[]) {
    this.rules = rules;
  }

  /**
   * Checks the current block's content against all registered rules.
   * This should be called inside the editor's onChange handler.
   */
  public process(editor: BlockNoteEditor, context: EditorContext, setPopover: SetPopoverFunc): void {
    const currentBlock = editor.getTextCursorPosition().block;
    const blockContent = currentBlock.content[0]
    if (!blockContent) {
      // Clear popover if no content
      if (this.activeRule) {
        setPopover(null);
        this.activeRule = null;
        this.lastMatch = null;
      }
      return;
    }
    
    if (blockContent.type === "text") {
      const blockText = blockContent.text

      let foundMatch = false;
      let matchedRule: InputRule | null = null
      let match: RegExpMatchArray | null = null

      for (const rule of this.rules) {
        match = blockText.match(rule.regex)
        if (match) {
          foundMatch = true
          matchedRule = rule
          break
        }
      }

      // If we have an active rule but no match found, clear the popover
      if (this.activeRule && !foundMatch) {
        setPopover(null)
        this.activeRule = null
        this.lastMatch = null
        return
      }

      // If we found a match and it's different from the last one, update the popover
      if (foundMatch && matchedRule && (!this.activeRule || this.activeRule !== matchedRule || !this.lastMatch || match![0] !== this.lastMatch[0])) {
        this.activeRule = matchedRule
        this.lastMatch = match
        matchedRule.action(editor, match!, context, setPopover)
      }
    }
  }

  /**
   * Manually clear the active rule and popover
   */
  public clearActiveRule(setPopover: SetPopoverFunc): void {
    if (this.activeRule) {
      setPopover(null)
      this.activeRule = null
      this.lastMatch = null
    }
  }
}