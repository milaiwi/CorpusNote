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
    Folder
} from "lucide-react"
import { RenameDialog } from "../dialog/RenameDialog"
import { useDialog } from "../../contexts/DialogContext";
import { NewNoteDialog } from "../dialog/NewNoteDialog";
import { NewDirectoryDialog } from "../dialog/NewDirectoryDialog";
import { useFileSystem } from "../../contexts/FileSystemContext";

interface FilesContextMenuProps {
    children: React.ReactNode;
    item: FileItem;
}

export function FilesContextMenu({ 
    children, 
    item, 
}: FilesContextMenuProps) {
    const { openDialog } = useDialog()
    const { handleRemove } = useFileSystem()
    
    const handleCopyPath = () => {
        navigator.clipboard.writeText(item.absPath);
    };
    
    const handleNewNote = (directoryPath: string) => {
        openDialog(<NewNoteDialog directoryPath={directoryPath} />)
    }

    const handleNewDirectory = (directoryPath: string) => {
        openDialog(<NewDirectoryDialog directoryPath={directoryPath} />)
    }

    const handleDelete = async () => {
        const [success, error] = await handleRemove(item)
        if (success) {
            console.log('File deleted:', item.name)
        } else {
            console.error('Error deleting file:', error)
        }
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-36">    
                {item.isDirectory && (
                    <>
                        <ContextMenuItem onClick={() => handleNewDirectory(item.absPath)} className="cursor-pointer">
                            <Folder size={8} />
                            <span className="text-xs">New Directory</span>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleNewNote(item.absPath)} className="cursor-pointer">
                            <File size={8} />
                            <span className="text-xs">New Note</span>
                        </ContextMenuItem>
                    </>
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