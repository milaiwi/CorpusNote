// SimilarCommand.tsx (sketch)
import React from "react";
import { Command, CommandInput, CommandItem, CommandList } from "../../../../shadcn/ui/command";
import { posToDOMRect } from "@tiptap/core";


const SimilarFiles = {
  "The Roman Empire": [
    {
        "id": "re-001",
        "file_path": "/Users/milaiwi/documents/notes/roman_empire.md",
        "score": 0.92,
        "title": "The Roman Empire"
    },
    {
        "id": "re-002",
        "file_path": "/Users/milaiwi/documents/notes/roman_empire_2.md",
        "score": 0.90,
        "title": "The Roman Empire 2"
    }
  ]
};


export function SimilarCommand({ editor, state, onClose }: {
  editor: any; // BlockNote editor
  state: { query: string; from: number; to: number } | null;
  onClose: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const commandRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Position near caret
  React.useLayoutEffect(() => {
    if (!state) return;
    const view = editor._tiptapEditor?.view;
    if (!view) return;
    const rect = posToDOMRect(view, state.to, state.to);
    const container = view.dom.parentElement!;
    const cr = container.getBoundingClientRect();

    const el = ref.current;
    if (el) {
      el.style.position = "absolute";
      el.style.top = `${rect.bottom - cr.top + 4}px`;
      el.style.left = `${rect.left - cr.left}px`;
      el.style.zIndex = "9999";
    }
  }, [editor, state]);

  // Focus the input when component mounts
  React.useEffect(() => {
    if (inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [state]);

  // Handle keyboard events and click outside
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Restore focus to editor before closing
        restoreEditorFocus();
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // Clicked outside the dialog
        restoreEditorFocus();
        onClose();
      }
    };

    if (state) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [state, onClose]);

  // Function to restore editor focus
  const restoreEditorFocus = () => {
    if (editor && state) {
      // Focus the editor and position cursor at the end of the trigger text
      editor._tiptapEditor
        ?.chain()
        .focus()
        .setTextSelection({ from: state.to, to: state.to })
        .run();
    }
  };

  if (!state) return null;

  return (
    <div ref={ref}>
      <Command ref={commandRef}>
        <CommandInput ref={inputRef} placeholder="Filter similar files…" />
        <CommandList>
          {SimilarFiles["The Roman Empire"].map((it) => (
            <CommandItem
              className="cursor-pointer"
              key={it.id}
              onSelect={() => {
                // 1) remove the trigger text: [[ … |
                editor._tiptapEditor
                  ?.chain()
                  .focus()
                  .setTextSelection({ from: state.from, to: state.to })
                  .deleteSelection()
                  .run();

                // 2) insert your inline node (reuse your existing inline spec)
                editor.insertInlineContent([
                  { type: "fileLink", props: { name: it.title, path: it.file_path } },
                  // or { type: "similarLink", props: { name: it.title, link: it.href } },
                ]);

                // // 3) ensure editor stays focused after insertion
                // setTimeout(() => {
                //   editor._tiptapEditor?.chain().focus().run();
                // }, 0);

                onClose();
              }}
            >
              {it.title}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}
