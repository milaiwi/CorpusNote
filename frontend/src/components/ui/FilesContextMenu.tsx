import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "../../../shadcn/ui/context-menu"
import { FileItem } from "../layout/FileSidebar/utils"
import {
    Trash2, 
    Copy, 
    Type,
    File,
} from "lucide-react"
import { RenameDialog } from "../dialog/RenameDialog"
import { useDialog } from "../../contexts/DialogContext";
import { NewNoteDialog } from "../dialog/NewNoteDialog";

interface FilesContextMenuProps {
    children: React.ReactNode;
    item: FileItem;
}

export function FilesContextMenu({ 
    children, 
    item, 
}: FilesContextMenuProps) {
    const { openDialog } = useDialog()
    
    const handleCopyPath = () => {
        navigator.clipboard.writeText(item.absPath);
        console.log('Copy path:', item.absPath);
    };
    
    const handleNewNote = (directoryPath: string) => {
        openDialog(<NewNoteDialog directoryPath={directoryPath} />)
    }

    const handleDelete = () => {
        // TODO: Implement delete functionality
        console.log('Delete:', item.name);
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-16">    
                {item.isDirectory && (
                    <ContextMenuItem onClick={() => handleNewNote(item.absPath)} className="cursor-pointer">
                        <File size={8} />
                        <span className="text-xs">New Note</span>
                    </ContextMenuItem>
                )}

                <ContextMenuItem onClick={() => openDialog(<RenameDialog item={item} />)} className="cursor-pointer">
                    <Type size={8} />
                    <span className="text-xs">Rename</span>
                </ContextMenuItem>
                
                <ContextMenuItem onClick={handleCopyPath} className="cursor-pointer">
                    <Copy size={8} />
                    <span className="text-xs">Copy path</span>
                </ContextMenuItem>
                
                <ContextMenuSeparator />
                
                <ContextMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950 cursor-pointer"
                >
                    <Trash2 size={8} />
                    <span className="text-xs">Delete</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}