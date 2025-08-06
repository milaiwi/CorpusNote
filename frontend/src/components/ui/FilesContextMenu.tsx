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
} from "lucide-react"

interface FilesContextMenuProps {
    children: React.ReactNode;
    item: FileItem;
}

export function FilesContextMenu({ 
    children, 
    item, 
}: FilesContextMenuProps) {

    const handleRename = () => {
        // TODO: Implement rename functionality
        console.log('Rename:', item.name);
    };
    
    const handleCopyPath = () => {
        // TODO: Implement copy path functionality
        navigator.clipboard.writeText(item.absPath);
        console.log('Copy path:', item.absPath);
    };

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
                <ContextMenuItem onClick={handleRename} className="cursor-pointer">
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