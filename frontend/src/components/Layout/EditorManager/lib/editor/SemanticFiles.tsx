import { SearchResult } from "../../../../../contexts/Semantics/types"
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../../../../../shadcn/ui/command"
import { useEffect, useRef } from "react"
import { useAppSettings } from "../../../../../contexts/AppContext"
import { getRelativePath } from "../../../../../../lib/utils"

interface SemanticFilesProps {
    similarFiles: SearchResult[]
    rect?: { top: number; left: number; bottom: number; right: number }
    onFileSelect?: (file: SearchResult) => void
    onClose?: () => void
    open: boolean
}

export const SemanticFilePopover: React.FC<SemanticFilesProps> = ({ 
    similarFiles, 
    rect, 
    onFileSelect, 
    onClose,
    open
}) => {
    const { vaultPath } = useAppSettings()
    const contentRef = useRef<HTMLDivElement>(null)
    
    const handleValueChange = (value: string) => {
        const selectedFile = similarFiles.find(file => file.file_path === value);
        if (selectedFile && onFileSelect) {
            onFileSelect(selectedFile);
        }
    }

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                if (onClose) onClose();
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div 
            ref={contentRef}
            style={{
                position: 'fixed',
                bottom: `calc(100vh - ${rect?.top || 0}px)`, 
                left: rect?.left || 0,
                zIndex: 1000,
            }}
        >
            <Command className="w-[300px] rounded-lg border shadow-md">
                <CommandList>
                    <CommandGroup heading="Similar files">
                        {similarFiles.map((file) => (
                            <CommandItem 
                                key={file.file_path} 
                                value={file.file_path}
                                onSelect={() => handleValueChange(file.file_path)}
                                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                            >
                                {getRelativePath(file.file_path, vaultPath)}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
                <CommandInput 
                    placeholder="Type to search or select a file..." 
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            if (onClose) onClose();
                        }
                    }}
                />
            </Command>
        </div>
    )
}