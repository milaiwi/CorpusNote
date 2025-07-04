// frontend/src/components/Layout/MainLayout.tsx
import React, { useState } from 'react'
import TitleBar from './TitleBar/Titlebar';
import FileSidebar from './FileSidebar/FileSidebar';
import FileSystemContext from '@/src/contexts/FileSystemContext';
import IconSidebar from './IconSidebar/IconSidebar';

interface MainLayoutProps {
    className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ className = '' }) => {
    // TODO: Move this up to a startup page -> sets the vault path and configurations
    const [vaultPath, setVaultPath] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<string | null>(null)

    return (
        <FileSystemContext>
            {/* TODO: Define custom color schemes for re-usability */}
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
                        option={"files"}
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
    )
}

export default MainLayout