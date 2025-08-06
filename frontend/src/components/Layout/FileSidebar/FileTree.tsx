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

async function readSingleDirectoryContent(vaultPath: string, directoryPath: string | string[]): Promise<FileItem[]> {
    try {
        let directoryContents: FileItem[] = [];

        if (typeof directoryPath === 'string') {
            // Single directory selection
            const entries = await readDir(directoryPath, { recursive: false });

            for (const entry of entries) {
                if (validDisplayableFile(entry)) {
                    const fileItem: FileItem = {
                        // @ts-ignore
                        name: entry.name,
                        absPath: entry.path,
                        isDirectory: entry.children ? true : false,
                    };

                    // If it's a directory, recursively read its contents
                    if (entry.children) {
                        fileItem.children = await readSingleDirectoryContent(vaultPath, entry.path);
                        fileItem.expanded = fileItem.children.length > 0;
                    }

                    directoryContents.push(fileItem);
                }
            }
        }

        // Sort the directory contents before returning
        return sortFiles(directoryContents);
    } catch (err) {
        console.error('Error reading directory contents:', err);
        return [];
    }
}

/**
 * Find a directory in the file tree by its path and add a new item to it
 * @param files - The file tree
 * @param targetPath - The path of the directory to find
 * @param newItem - The new item to add
 * @returns Updated file tree with the new item added and sorted
 */
export const addItemToDirectory = (files: FileItem[], vaultPath: string, targetPath: string, newItem: FileItem): FileItem[] => {
    // Handle root level additions
    if (targetPath === vaultPath) {
        return sortFiles([...files, newItem])
    }

    // Handle subdirectory additions
    return files.map(file => {
        if (file.absPath === targetPath) {
            // Found the target directory, add the new item and sort children
            const updatedChildren = file.children ? [...file.children, newItem] : [newItem]
            return {
                ...file,
                children: sortFiles(updatedChildren)
            }
        } else if (file.children) {
            // Recursively search in children
            return {
                ...file,
                children: addItemToDirectory(file.children, vaultPath, targetPath, newItem)
            }
        }
        return file
    })
}


/**
 * Sort files: directories first, then files, both alphabetically
 * @param files - The files to sort
 * @returns The sorted files
 */
export const sortFiles = (files: FileItem[]) => {
    return files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
    })
}

const validDisplayableFile = (entry: FileEntry) => {
    return entry.name && !entry.name.startsWith('.') && entry.path
}

export default readSingleDirectoryContent