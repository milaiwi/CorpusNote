import * as React from "react";
import { useMemo } from "react";
import { SearchResult } from "../../../../../contexts/Semantics/types";
import { useAppSettings } from "../../../../../contexts/AppContext";
import { getRelativePath } from "../../../../../../lib/utils";

import {
  FloatingCommand,
  type FloatingCommandItem,
} from "../../../../../../shadcn/ui/FloatingCommand";

const similarFiles = {
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
  

interface SemanticFilesProps {
  /** Anchor rect for the caret/selection (e.g., from posToDOMRect) */
  rect?: { top: number; left: number; bottom: number; right: number } | null;
  onFileSelect?: (file: SearchResult) => void;
  onClose?: () => void;
  open: boolean;
}

export const SemanticFilePopover: React.FC<SemanticFilesProps> = ({
  rect,
  onFileSelect,
  onClose,
  open,
}) => {
  const { vaultPath } = useAppSettings();

  const items: FloatingCommandItem[] = useMemo(
    () =>
      similarFiles["The Roman Empire"].map((f) => {
        const rel = getRelativePath(f.file_path, vaultPath);
        return {
          id: f.file_path,
          value: rel || f.file_path,
          label: rel || f.file_path,
          ...f,
        };
      }),
    [similarFiles, vaultPath]
  );

  return (
    <FloatingCommand
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose?.();
      }}
      anchorRect={rect ?? null}
      items={items}
      className="w-[300px] rounded-lg border shadow-md"
      placement="bottom-start"
      width={300}
      maxWidth={360}
      emptyText="No similar files"
      placeholder="Type to search or select a file…"
      // Optional: custom row rendering (keeps text truncated nicely)
      renderItem={(it) => <div className="truncate">{it.label ?? it.value}</div>}
      onSelect={(it) => {
        // it includes the original SearchResult fields via the spread above
        const selected =
          similarFiles["The Roman Empire"].find((s) => s.file_path === (it as any).file_path) || (it as any);
        onFileSelect?.(selected as SearchResult);
        onClose?.();
      }}
    />
  );
};
