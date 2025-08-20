// frontend/src/components/Layout/TitleBar/Titlebar
import React from 'react'
import { getDisplayTitle, handleWindowControl } from './utils';
import { PanelLeft, PanelRight } from 'lucide-react';
import { FileItem } from '../FileSidebar/utils';

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
    // {/* TODO: Set up custom color schemes for the border*/}        
    return (
        <div 
            className="border-b border-border flex items-center justify-between px-4 select-none h-[45px]"
            data-tauri-drag-region="true" // Allows dragging the window in Tauri
        >
            <div className="flex items-center space-x-2">
                {isSidebarCollapsed && onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                        title="Show sidebar"
                    >
                        <PanelLeft size={16} className="text-gray-400" />
                    </button>
                )}
            </div>

            {/* Center - Title */}
            <div className="flex-1 flex justify-center">
                <h1 className="text-sm font-medium text-gray-200 truncate max-w-md">
                    {getDisplayTitle(selectedFile?.name || '')}
                </h1>
            </div>

            {/* Right side - Window controls (Windows/Linux style) */}
            <div className="hidden md:flex items-center space-x-1">
                <button
                    onClick={onToggleSemanticSearch}
                    className="p-1 hover:bg-gray-700 rounded transition-colors cursor-pointer"
                    title="Toggle semantic search"
                >
                    <PanelRight size={16} className="text-gray-400" />
                </button>
            </div>
        </div>
    )
} 

export default TitleBar