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
    isDirty?: boolean, // Whether the file has been modified and not saved
}

export interface FileSidebarProps {
    vaultPath: string | null,
    selectedFile: FileItem | null;
    onFileSelect: (file: FileItem) => void;
    activeOption: IconSidebarOptions;
    setActiveOption: (option: IconSidebarOptions) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

