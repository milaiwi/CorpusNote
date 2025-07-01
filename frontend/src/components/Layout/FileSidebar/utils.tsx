// frontend/src/components/Layout/FileSidebar/utils
export interface FileItem {
    name: string;   // name of the file
    absPath: string; // absolute path of ifle
    type: 'file' | 'directory';
    timeCreated: number,
    timeModified?: number,
    currentPosition?: number, // current cursor position
    mimeType?: string, // image, text file, etc..
    children?: FileItem[], // directory children
    expanded?: boolean, // currently showing children
}

export interface FileSidebarProps {
    vaultPath: string | null,
    selectedFile: string | null;
    onFileSelect: (filePath: string) => void;
}

