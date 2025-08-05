// frontend/src/components/layout/MainLayout.tsx
import React, { useState } from 'react'
import TitleBar from './TitleBar/Titlebar';
import ResizableSidebar from './ResizableSidebar';
import FileSystemProvider from '../../contexts/FileSystemContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IconSidebarOptions } from './IconSidebar/IconSidebar';
import { ThemeProvider } from '../../contexts/ThemeContext';
import EditorManager from './EditorManager/EditorManager';
import FileCacheProvider from '../../contexts/FileCache';
import { DialogProvider } from '../../contexts/DialogContext';

interface MainLayoutProps {
    className?: string;
    vaultPath: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ className = '', vaultPath = '/Users/memo/documents' }) => {
    // TODO: Move this up to a startup page -> sets the vault path and configurations
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [activeOption, setActiveOption] = useState<IconSidebarOptions>('files')
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)

    return (
        <div className="h-screen flex flex-1">
            <ResizableSidebar
                vaultPath={vaultPath}
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                activeOption={activeOption}
                setActiveOption={setActiveOption}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
                <div className="flex flex-col flex-1">
                    {/* Title Bar*/}
                    <TitleBar
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    />

                    {/* Editor Window */}
                    <EditorManager
                        selectedFile={selectedFile}
                    />
                </div>
            </ResizableSidebar>
        </div>
    )
}


const MainPageLayout = () => {
    const queryClient = new QueryClient()
    const [vaultPath, setVaultPath] = useState<string | null>("/Users/milaiwi/documents/notes")

    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <FileCacheProvider queryClient={queryClient} vaultPath={vaultPath}>
                    <FileSystemProvider vaultPath={vaultPath}>
                        <DialogProvider>
                            <MainLayout
                                vaultPath={vaultPath}
                            />
                        </DialogProvider>
                    </FileSystemProvider>
                </FileCacheProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

export default MainPageLayout