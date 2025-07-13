import { FileEntry } from "@tauri-apps/api/fs";

// frontend/src/components/Layout/FileSidebar/utils
export type FileType = 'file' | 'directory';

export interface FileItem {
    name: string;   // name of the file
    absPath: string; // absolute path of ifle
    type: FileType;
    timeCreated?: number,
    timeModified?: number,
    currentPosition?: number, // current cursor position
    mimeType?: string, // image, text file, etc..
    children?: FileItem[], // directory children
    expanded?: boolean, // currently showing children
}

export interface FileSidebarProps {
    vaultPath: string,
}

