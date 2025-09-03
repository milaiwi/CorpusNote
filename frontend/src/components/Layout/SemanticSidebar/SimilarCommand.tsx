// SimilarCommand.tsx
import * as React from "react";
import { posToDOMRect } from "@tiptap/core";
import { SemanticFilePopover } from "../EditorManager/lib/editor/SemanticFiles";

type SimilarState = { query: string; from: number; to: number } | null;

export function SimilarCommand({
  editor,         // BlockNote editor instance
  state,          // { query, from, to } from your trigger detector
  onClose,
}: {
  editor: any;
  state: SimilarState;
  onClose: () => void;
}) {
  // Compute the caret rect to anchor the popover
  const caretRect = React.useMemo(() => {
    if (!state) return null;
    const view = editor?._tiptapEditor?.view;
    if (!view) return null;
    const r = posToDOMRect(view, state.to, state.to);
    return { top: r.top, left: r.left, right: r.right, bottom: r.bottom };
  }, [editor, state?.to, !!state]); // re-run when caret moves or state toggles

  if (!state || !caretRect) return null;

  return (
    <SemanticFilePopover
      open={true}
      rect={caretRect}
      onClose={() => {
        editor?._tiptapEditor?.chain().focus().setTextSelection({ from: state.to, to: state.to }).run();
        onClose();
      }}
      onFileSelect={(file) => {
        editor?._tiptapEditor
          ?.chain()
          .focus()
          .setTextSelection({ from: state.from, to: state.to })
          .deleteSelection()
          .run();

        const name =
          (file as any).title ||
          (file as any).file_name ||
          (file as any).file_path?.split("/").pop() ||
          "Link";

        editor.insertInlineContent([
          {
            type: "fileLink",
            props: { name, path: (file as any).file_path },
          },
        ]);

        onClose();
      }}
    />
  );
}
