// SimilarTrigger.ts
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, EditorState } from "prosemirror-state";

type OpenPayload = { query: string; from: number; to: number };

const key = new PluginKey<{ version: number; active: boolean; payload: OpenPayload | null }>("similarTrigger");

function findTrigger(state: EditorState): OpenPayload | null {
  const { $from } = state.selection;
  if (!$from.parent || !$from.parent.isTextblock) return null;

  // text in the current textblock up to the caret
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, "\n", "\n");

  // match ONLY if it ends at the caret: [[   ...   |   <caret>
  const m = textBefore.match(/\[\[\s*(.*?)\s*\|$/);
  if (!m) return null;

  const query = (m[1] ?? "").trim();
  console.log("query", query);
  const to = state.selection.from;
  const from = to - m[0].length;
  return { query, from, to };
}

export const SimilarTrigger = Extension.create<{
  onOpen?: (payload: OpenPayload, view: any) => void;
  onClose?: () => void;
}>({
  name: "similarTrigger",

  addProseMirrorPlugins() {
    const onOpen = this.options.onOpen;
    const onClose = this.options.onClose;

    return [
      new Plugin({
        key,
        state: {
          init: () => ({ version: 0, active: false, payload: null }),
          apply(tr, prev, _old, state) {
            // Only recompute when the doc or selection changes
            if (!tr.docChanged && !tr.selectionSet) return prev;

            const payload = findTrigger(state);
            if (payload) {
              // (re-)open or update
              const changed =
                !prev.active ||
                !prev.payload ||
                prev.payload.query !== payload.query ||
                prev.payload.from !== payload.from ||
                prev.payload.to !== payload.to;

              if (changed) {
                return { version: prev.version + 1, active: true, payload };
              }
              return prev;
            } else {
              // close if previously active
              if (prev.active) {
                return { version: prev.version + 1, active: false, payload: null };
              }
              return prev;
            }
          },
        },
        view(view) {
          let seen = -1;
          return {
            update(v) {
              const ps = key.getState(v.state);
              if (!ps) return;

              if (ps.version !== seen) {
                seen = ps.version;
                if (ps.active && ps.payload) onOpen?.(ps.payload, v);
                else onClose?.();
              }
            },
            destroy() {},
          };
        },
      }),
    ];
  },
});
