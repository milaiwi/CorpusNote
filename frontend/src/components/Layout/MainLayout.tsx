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
import { AppProvider } from '../../contexts/AppContext';
import { useAppSettings } from '../../contexts/AppContext';
import { AIProvider } from '../../contexts/AIContext';

interface MainLayoutProps {
    className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ className = '' }) => {
    // TODO: Move this up to a startup page -> sets the vault path and configurations
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [activeOption, setActiveOption] = useState<IconSidebarOptions>('files')
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
    const { vaultPath } = useAppSettings()

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

    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <AppProvider>
                    <FileCacheProvider queryClient={queryClient}>
                        <FileSystemProvider>
                            <AIProvider>
                                <DialogProvider>
                                    <MainLayout />
                                </DialogProvider>
                            </AIProvider>
                        </FileSystemProvider>
                    </FileCacheProvider>
                </AppProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

export default MainPageLayout