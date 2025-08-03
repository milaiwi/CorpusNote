// frontend/src/components/Layout/MainLayout.tsx
import React, { useState } from 'react'
import TitleBar from './TitleBar/Titlebar';
import FileSidebar from './FileSidebar/FileSidebar';
import FileSystemContext from '../../contexts/FileSystemContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import IconSidebar, { IconSidebarOptions } from './IconSidebar/IconSidebar';
import { ThemeProvider } from '../../contexts/ThemeContext';
import EditorManager from './EditorManager/EditorManager';
import FileCacheProvider from '../../contexts/FileCache';

interface MainLayoutProps {
    className?: string;
    vaultPath: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ className = '', vaultPath = '/Users/memo/documents' }) => {
    // TODO: Move this up to a startup page -> sets the vault path and configurations
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [activeOption, setActiveOption] = useState<IconSidebarOptions>('files')

    return (
        <div className="h-screen flex flex-1">
            <div className="flex flex-1 overflow-hidden">
                {/* IconSidebar */}
                <div className="bg-secondary flex">
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
                </div>

                <div className="flex flex-col flex-1">
                    {/* Title Bar*/}
                    <TitleBar
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                    />

                    {/* Editor Window */}
                    <EditorManager />
                </div>
            </div>
        </div>
    )
}


const MainPageLayout = () => {
    const queryClient = new QueryClient()
    const [vaultPath, setVaultPath] = useState<string | null>("/Users/memo/documents")

    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <FileCacheProvider queryClient={queryClient} vaultPath={vaultPath}>
                    <FileSystemContext>
                        <MainLayout
                            vaultPath={vaultPath}
                        />
                    </FileSystemContext>
                </FileCacheProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

export default MainPageLayout