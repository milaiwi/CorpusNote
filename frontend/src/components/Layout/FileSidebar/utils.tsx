// frontend/src/components/Layout/FileSidebar/utils
import { IconSidebarOptions } from "../IconSidebar/IconSidebar";

export interface FileItem {
    name: string;   // name of the file
    absPath: string; // absolute path of ifle
    isDirectory: boolean;
    timeCreated?: number,
    timeModified?: number,
    currentPosition?: number, // current cursor position
    mimeType?: string, // image, text file, etc..
    children?: FileItem[], // directory children
    expanded?: boolean, // currently showing children
    parent?: FileItem, // parent of the file
}

export interface FileSidebarProps {
    vaultPath: string | null,
    selectedFile: string | null;
    onFileSelect: (filePath: string) => void;
    activeOption: IconSidebarOptions;
    setActiveOption: (option: IconSidebarOptions) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

