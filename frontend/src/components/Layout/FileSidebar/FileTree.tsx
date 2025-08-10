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

async function readSingleDirectoryContent(vaultPath: string, directoryPath: string | string[], parent?: FileItem): Promise<FileItem[]> {
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
                        parent: parent,
                    };

                    // If it's a directory, recursively read its contents
                    if (entry.children) {
                        fileItem.children = await readSingleDirectoryContent(vaultPath, entry.path, fileItem);
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
 * Rename an item in the file tree
 * @param files - The file tree
 * @param oldPath - The path of the item to rename
 * @param newName - The new name of the item
 * @returns The updated file tree with the item renamed and sorted
 */
export const renameItemInFileTree = (files: FileItem[], oldPath: string, newName: string): FileItem[] => {
    return files.map(file => {
        if (file.absPath === oldPath) {
            // Found the item to rename
            const newPath = file.absPath.substring(0, file.absPath.lastIndexOf('/') + 1) + newName
            
            const renamedFile = { 
                ...file, 
                name: newName, 
                absPath: newPath,
                children: file.children
            }
            
            return renamedFile
        } else if (file.children) {
            // Recursively search in children
            const updatedChildren = renameItemInFileTree(file.children, oldPath, newName)
            
            // If we found and renamed the item in children, sort the children
            if (updatedChildren !== file.children) {
                return {
                    ...file,
                    children: sortFiles(updatedChildren)
                }
            }
            
            return {
                ...file,
                children: updatedChildren
            }
        }
        return file
    })
}

/**
 * Remove an item from the file tree
 * @param files - The file tree
 * @param itemPath - The path of the item to remove
 * @returns The updated file tree with the item removed
 */
export const removeItemFromFileTree = (files: FileItem[], itemPath: string): FileItem[] => {
    return files.map(file => {
        if (file.children) {
            // Check if any child matches the path to remove
            const hasItemToRemove = file.children.some(child => child.absPath === itemPath)
            
            if (hasItemToRemove) {
                // Remove the item from this directory's children
                const updatedChildren = file.children.filter(child => child.absPath !== itemPath)
                return {
                    ...file,
                    children: updatedChildren
                }
            } else {
                // Recursively search in children
                const updatedChildren = removeItemFromFileTree(file.children, itemPath)
                
                // Only update if children actually changed
                if (updatedChildren !== file.children) {
                    return {
                        ...file,
                        children: updatedChildren
                    }
                }
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