// frontend/src/components/Layout/TitleBar/Titlebar
import React from 'react'
import { getDisplayTitle, handleWindowControl } from './utils';
import { Circle, Minimize2, Square, X } from 'lucide-react';
import { useFileSystem } from '@/src/contexts/FileSystemContext';



// TODO:
//  - Need to change button and other containers to shadcn objects
//  - Need to define default colors for borders
const TitleBar: React.FC = () => {    
    const { currentFilePath } = useFileSystem()

    // {/* TODO: Set up custom color schemes for the border*/}        
    return (
        <div 
            className="p-3 border-b border-gray-700 flex items-center justify-between px-4 select-none"
            data-tauri-drag-region="true" // Allows dragging the window in Tauri
        >
            {/* Left side - Traffic lights (macOS style) or empty space */}
            <div className="flex items-center space-x-2">
                <div className="flex space-x-2 md:hidden"> {/* Show on mobile/web */}
                <button
                    onClick={() => handleWindowControl('close')}
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
                >
                    <Circle size={8} className="fill-current opacity-0 hover:opacity-100" />
                </button>
                <button
                    onClick={() => handleWindowControl('minimize')}
                    className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600"
                />
                <button
                    onClick={() => handleWindowControl('maximize')}
                    className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600"
                />
                </div>
            </div>

            {/* Center - Title */}
            <div className="flex-1 flex justify-center">
                <h1 className="text-sm font-medium text-gray-200 truncate max-w-md">
                    {getDisplayTitle(currentFilePath)}
                </h1>
            </div>

            {/* Right side - Window controls (Windows/Linux style) */}
            <div className="hidden md:flex items-center space-x-1">
                <button
                    onClick={() => handleWindowControl('minimize')}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Minimize"
                >
                    <Minimize2 size={12} className="text-gray-400" />
                </button>
                <button
                    onClick={() => handleWindowControl('maximize')}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Maximize"
                >
                    <Square size={12} className="text-gray-400" />
                </button>
                <button
                    onClick={() => handleWindowControl('close')}
                    className="p-1 hover:bg-red-600 rounded transition-colors"
                    title="Close"
                >
                    <X size={12} className="text-gray-400 hover:text-white" />
                </button>
            </div>
        </div>
    )
} 

export default TitleBar