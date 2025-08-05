// frontend/src/components/Layout/FileSidebar/FileSidebar.tsx
import React, { useState, useEffect } from 'react'
import { FileSidebarProps, FileItem } from './utils'
import {
    ChevronRight,
    ChevronDown,
    Folder,
    PanelLeft
} from 'lucide-react'
import { getDisplayTitle } from '../TitleBar/utils'
import { Button } from '../../../../shadcn/ui/button'
import { cn } from '../../../../lib/utils'
import { useFileSystem } from '../../../contexts/FileSystemContext'
import { IconGroup } from '../IconSidebar/IconSidebar'
import { bottomLevelIcons, topLevelIcons } from '../IconSidebar/icons'
import { ThemeToggle } from '../../ui/ThemeToggle'

const FileSidebar: React.FC<FileSidebarProps> = ({
    selectedFile,
    onFileSelect,
    activeOption,
    setActiveOption,
    isCollapsed = false,
    onToggleCollapse
}) => {
    const { vaultTree: files, expandedDirectories, handleDirectoryToggle } = useFileSystem()
    const [loading, setLoading] = useState<boolean>(false)

    const renderFileItem = (item: FileItem, depth: number = 0) => {
        const isSelected = selectedFile === item.absPath
        const paddingLeft = depth * 16 + 8
        return (
            <div key={item.absPath}>
                <Button
                    variant={isSelected ? "item_generic_active" : "item_generic"}
                    size="fileItem"
                    className={cn(
                        "w-full",
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
        <div className="flex flex-col h-full border-r border-border">
            {/* Header */}
            <FileSidebarHeader onToggleCollapse={onToggleCollapse} isCollapsed={isCollapsed} />
      
            {/* Top Icon Group */}
            <IconGroup
                icons={topLevelIcons}
                activeOption={activeOption}
                onOptionChange={setActiveOption}
                className="justify-center"
            />
        
            {/* File Content - Takes remaining space */}
            <div className="flex-1 overflow-y-auto px-4">
                {loading ? (
                    <div className="p-4 text-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary mx-auto"></div>
                        <p className="mt-2 text-xs">Loading files...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 py-2">
                        {files.map(item => renderFileItem(item))}
                    </div>
                )}
            </div>

            {/* Bottom Icon Group */}
            <div className="px-2 py-2">
                <IconGroup
                    icons={bottomLevelIcons}
                    activeOption={activeOption}
                    onOptionChange={setActiveOption}
                    customIcons={[<ThemeToggle />]}
                />
            </div>
        </div>
    )      
}

interface FileSidebarHeaderProps {
    onToggleCollapse?: () => void;
    isCollapsed?: boolean;
}

const FileSidebarHeader: React.FC<FileSidebarHeaderProps> = ({ onToggleCollapse, isCollapsed = false }) => {
    return (
        <div className="flex justify-end h-[45px] border-b border-border items-center">
            <Button 
                variant="item_generic" 
                size="icon"
                onClick={onToggleCollapse}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <PanelLeft size={16} className={cn(
                    "transition-transform duration-300",
                    isCollapsed && "rotate-180"
                )} />
            </Button>
        </div>
    )
}

export default FileSidebar