import * as React from "react";
import { useMemo } from "react";
import { SearchResult } from "../../../../../contexts/Semantics/types";
import { useAppSettings } from "../../../../../contexts/AppContext";
import { getRelativePath } from "../../../../../../lib/utils";

import {
  FloatingCommand,
  type FloatingCommandItem,
} from "../../../../../../shadcn/ui/FloatingCommand";
import { useSearchSemanticContext } from "../../../../../contexts/Semantics/SearchSemanticContext";
import { useFileSystem } from "../../../../../contexts/FileSystemContext";

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
  const { getCachedSimilarFilesForFile } = useSearchSemanticContext();
  const { currentOpenedFile } = useFileSystem();
  const { vaultPath } = useAppSettings();

  const items: FloatingCommandItem[] = useMemo(
    () =>
      getCachedSimilarFilesForFile(currentOpenedFile?.absPath || "").map((f) => {
        const rel = getRelativePath(f.file_path, vaultPath);
        return {
          id: f.file_path,
          value: rel || f.file_path,
          label: rel || f.file_path,
          ...f,
        };
      }),
    [currentOpenedFile, vaultPath]
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
      renderItem={(it) => <div className="truncate">{it.label ?? it.value}</div>}
      onSelect={(it) => {
        // it contains all SearchResult fields via the spread operator in items mapping
        onFileSelect?.(it as unknown as SearchResult);
        onClose?.();
      }}
    />
  );
};
