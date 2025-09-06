// frontend/src/components/Layout/TitleBar/Titlebar
import React from 'react'
import { getDisplayTitle } from './utils';
import { PanelLeft, PanelRight } from 'lucide-react';
import { FileItem } from '../FileSidebar/utils';
import { useFileSystem } from '../../../contexts/FileSystemContext';
import { Button } from '../../../../shadcn/ui/button';

interface TitleBarProps {
    selectedFile: FileItem | null;
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
    onToggleSemanticSearch?: () => void;
}

// TODO:
//  - Need to change button and other containers to shadcn objects
//  - Need to define default colors for borders
const TitleBar: React.FC<TitleBarProps> = ({selectedFile, isSidebarCollapsed = false, onToggleSidebar, onToggleSemanticSearch }) => {
    const { currentOpenedFile } = useFileSystem()
    return (
        <div 
            className="border-b border-border flex items-center justify-between px-4 select-none h-[45px]"
            data-tauri-drag-region="true" // Allows dragging the window in Tauri
        >
            <div className="flex items-center space-x-2">
                {isSidebarCollapsed && onToggleSidebar && (
                    <Button
                        onClick={onToggleSidebar}
                        variant="sidebar"
                        size="sidebarIcon"
                    >
                        <PanelLeft size={16} className="text-gray-400" />
                    </Button>
                )}
            </div>

            {/* Center - Title */}
            <div className="flex-1 flex justify-center">
                <h1 className="text-sm font-medium text-gray-200 truncate max-w-md">
                    {currentOpenedFile?.isDirty && '*'} {getDisplayTitle(selectedFile?.name || '')}
                </h1>
            </div>

            {/* Right side - Window controls (Windows/Linux style) */}
            <div className="hidden md:flex items-center space-x-1">
                <Button
                    onClick={onToggleSemanticSearch}
                    variant="sidebar"
                    size="sidebarIcon"
                >
                    <PanelRight size={16} className="text-gray-400" />
                </Button>
            </div>
        </div>
    )
} 

export default TitleBar