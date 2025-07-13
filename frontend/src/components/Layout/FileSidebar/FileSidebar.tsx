// frontend/src/components/Layout/FileSidebar/FileSidebar.tsx
import React, { useState, useEffect } from 'react'
import { FileSidebarProps, FileItem } from './utils'
import {
    ChevronRight,
    ChevronDown,
    Folder
} from 'lucide-react'
import { getDisplayTitle } from '../TitleBar/utils'
import { Button } from '../../../../shadcn/ui/button'
import { cn } from '../../../../lib/utils'
import { useFileSystem } from '@/src/contexts/FileSystemContext'

const FileSidebar: React.FC<FileSidebarProps> = ({
    vaultPath,
}) => {
    const [files, setFiles] = useState<FileItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const { currentFilePath, readFile } = useFileSystem()

    // TODO: Instead of mock system, connect to Tauri API
    const mockFileSystem: FileItem[] = [
        {
            name: 'Notes',
            absPath: '/Users/milaiwi/Documents/notes',
            type: 'directory',
            expanded: true,
            children: [
                { name: 'Daily Notes.md', absPath: '/Users/milaiwi/Documents/notes/Daily_Notes.md', type: 'file', timeCreated: Date.now() },
                { name: 'Project Ideas.md', absPath: '/Users/milaiwi/Documents/notes/Project_Ideas.md', type: 'file', timeCreated: Date.now() },
                {
                    name: 'Archive',
                    absPath: '/Users/milaiwi/Documents/notes/Archive',
                    type: 'directory',
                    children: [
                        { name: 'Old Notes.md', absPath: '/Users/milaiwi/Documents/notes/Archive/Old_Notes.md', type: 'file', timeCreated: Date.now() }
                    ],
                    timeCreated: Date.now(),
                }
            ],
            timeCreated: Date.now()
        },
        {
            name: 'Documents',
            absPath: '/vault/Documents',
            type: 'directory',
            children: [
                { name: 'README.md', absPath: '/vault/Documents/README.md', type: 'file', timeCreated: Date.now() },
                { name: 'TODO.md', absPath: '/vault/Documents/TODO.md', type: 'file', timeCreated: Date.now() }
            ],
            timeCreated: Date.now(),
        }
    ]

    useEffect(() => {
        if (vaultPath) {
            setLoading(true)
            setTimeout(() => {
                setFiles(mockFileSystem)
                setLoading(false)
            }, 500)
        } else {
            setFiles([])
        }
    }, [vaultPath])

    const toggleDirectory = (path: string) => {
        const updateExpanded = (items: FileItem[]): FileItem[] => {
            return items.map(item => {
                if (item.absPath === path && item.type === 'directory')
                    return { ...item, expanded: !item.expanded }
                if (item.children)
                    return { ...item, children: updateExpanded(item.children) }
                return item
            })
        }

        setFiles(updateExpanded(files))
    }

    const renderFileItem = (item: FileItem, depth: number = 0) => {
        const isSelected = currentFilePath === item.absPath
        const paddingLeft = depth * 16 + 8

        return (
            <div key={item.absPath}>
                <Button
                    variant={isSelected ? "fileItemActive" : "fileItem"}
                    size="fileItem"
                    className={cn(
                        "w-full",
                        `pl-[${paddingLeft}px]`
                    )}
                    style={{ paddingLeft }} 
                    onClick={() => {
                        if (item.type === 'directory')
                            toggleDirectory(item.absPath)
                        else
                            readFile(item.absPath)
                    }}
                >
                    {item.type === 'directory' && (
                        <>
                            {item.expanded ? (
                                <ChevronDown size={14} className="text-muted-foreground" />
                            ) : (
                                <ChevronRight size={14} className="text-muted-foreground" />
                            )}
                            {/* <Folder size={14} className="mr-2 text-accent-primary" /> */}
                        </>
                    )}
                    <span className="truncate">{getDisplayTitle(item.name)}</span>
                </Button>
                
                {item.type === 'directory' && item.expanded && item.children && (
                    <div>
                        {item.children.map(child => renderFileItem(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    if (!vaultPath) {
        return (
            <div className="w-64 border-r border-border p-4 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <Folder size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a vault to begin</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-64 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
                <h2 className="text-sm font-medium text-foreground truncate">
                    {vaultPath.split('/').pop() || 'Vault'}
                </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary mx-auto"></div>
                        <p className="mt-2 text-xs">Loading files...</p>
                    </div>
                ) : (
                    <div className="py-2">
                        {files.map(item => renderFileItem(item))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FileSidebar