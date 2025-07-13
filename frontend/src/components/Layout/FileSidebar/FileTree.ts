import { FileEntry, readDir } from '@tauri-apps/api/fs';
import { FileItem } from './utils';

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

const validDisplayableFile = (entry: FileEntry) => {
    return entry.name && !entry.name.startsWith('.') && entry.path
}

export default readSingleDirectoryContent