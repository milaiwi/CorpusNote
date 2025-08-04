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
import { useFileSystem } from '../../../contexts/FileSystemContext'

const FileSidebar: React.FC<FileSidebarProps> = ({
    selectedFile,
    onFileSelect
}) => {
    const { vaultTree: files, expandedDirectories, handleDirectoryToggle } = useFileSystem()
    const [loading, setLoading] = useState<boolean>(false)

    const renderFileItem = (item: FileItem, depth: number = 0) => {
        const isSelected = selectedFile === item.absPath
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
                            handleDirectoryToggle(item.absPath)
                        else
                            onFileSelect(item.absPath)
                    }}
                >
                    {item.type === 'directory' && (
                        <>
                            {expandedDirectories.get(item.absPath) ? (
                                <ChevronDown size={14} className="text-muted-foreground" />
                            ) : (
                                <ChevronRight size={14} className="text-muted-foreground" />
                            )}
                            {/* <Folder size={14} className="mr-2 text-accent-primary" /> */}
                        </>
                    )}
                    <span className="truncate">{getDisplayTitle(item.name)}</span>
                </Button>
                
                {item.type === 'directory' && expandedDirectories.get(item.absPath) && item.children && (
                    <div>
                        {item.children.map(child => renderFileItem(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    if (!files) {
        return (
            <div className="w-64 border-r border-border p-4 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <Folder size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">There are no files in this vault</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-64 border-r border-border flex flex-col">
            {/* <div className="p-3 border-b border-border">
                <h2 className="text-sm font-medium text-foreground truncate">
                    {vaultPath.split('/').pop() || 'Vault'}
                </h2>
            </div> */}
            
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