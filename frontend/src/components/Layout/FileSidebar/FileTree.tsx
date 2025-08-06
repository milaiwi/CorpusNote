// frontend/src/components/Layout/FileSidebar/FileTree.tsx
import { FileEntry, readDir } from '@tauri-apps/api/fs';
import { FileItem } from './utils';

/**
    interface FileEntry {
        path: string;
        name?: string;
        children?: FileEntry[];
    }
*/

async function readSingleDirectoryContent(directoryPath: string | string[]): Promise<FileItem[]> {
    try {
        const directoryContents: FileItem[] = [];

        if (typeof directoryPath === 'string') {
            // Single directory selection
            console.log(`Beginning reading entries from: ${directoryPath}`);
            const entries = await readDir(directoryPath, { recursive: false });

            for (const entry of entries) {
                if (validDisplayableFile(entry)) {
                    const fileItem: FileItem = {
                        // @ts-ignore
                        name: entry.name,
                        absPath: entry.path,
                        type: entry.children ? 'directory' : 'file',  
                    };

                    // If it's a directory, recursively read its contents
                    if (entry.children) {
                        fileItem.children = await readSingleDirectoryContent(entry.path);
                        fileItem.expanded = fileItem.children.length > 0;
                    }

                    directoryContents.push(fileItem);
                }
            }
        }

        return directoryContents;
    } catch (err) {
        console.error('Error reading directory contents:', err);
        return [];
    }
}

/**
 * Sort files: directories first, then files, both alphabetically
 * @param files - The files to sort
 * @returns The sorted files
 */
export const sortFiles = (files: FileItem[]) => {
    return files.sort((a, b) => {
        if (a.type === 'directory' && b.type === 'file') return -1
        if (a.type === 'file' && b.type === 'directory') return 1
        return a.name.localeCompare(b.name)
    })
}

const validDisplayableFile = (entry: FileEntry) => {
    return entry.name && !entry.name.startsWith('.') && entry.path
}

export default readSingleDirectoryContent