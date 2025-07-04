// frontend/src/components/Layout/MainLayout.tsx
import React, { useState } from 'react'
import TitleBar from './TitleBar/Titlebar';
import FileSidebar from './FileSidebar/FileSidebar';
import FileSystemContext from '@/src/contexts/FileSystemContext';
import IconSidebar, { IconSidebarOptions } from './IconSidebar/IconSidebar';
import { ThemeProvider } from '@/src/contexts/ThemeContext';

interface MainLayoutProps {
    className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ className = '' }) => {
    // TODO: Move this up to a startup page -> sets the vault path and configurations
    const [vaultPath, setVaultPath] = useState<string | null>("/Users/memo/documents")
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [activeOption, setActiveOption] = useState<IconSidebarOptions>('files')

    return (
        <ThemeProvider>
            <FileSystemContext>
                <div className="h-screen flex flex-col">
                    {/* Title Bar*/}
                    <TitleBar
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                    />

                    {/* Main Content Area */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* IconSidebar */}
                        <IconSidebar
                            activeOption={activeOption}
                            onOptionChange={setActiveOption}
                        />

                        {/* File Sidebar */}
                        <FileSidebar
                            vaultPath={vaultPath}
                            selectedFile={selectedFile}
                            onFileSelect={setSelectedFile}
                        />

                        {/* Editor Window */}
                        {}
                    </div>
                </div>
            </FileSystemContext>
        </ThemeProvider>
    )
}

export default MainLayout