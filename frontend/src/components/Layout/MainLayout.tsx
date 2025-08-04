// frontend/src/components/Layout/MainLayout.tsx
import React, { useState } from 'react'
import TitleBar from './TitleBar/Titlebar';
import FileSidebar from './FileSidebar/FileSidebar';
import FileSystemProvider from '../../contexts/FileSystemContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IconSidebarOptions } from './IconSidebar/IconSidebar';
import { ThemeProvider } from '../../contexts/ThemeContext';
import EditorManager from './EditorManager/EditorManager';
import FileCacheProvider from '../../contexts/FileCache';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '../../../shadcn/ui/resizable'
import { Button } from '../../../shadcn/ui/button'
import { cn } from '../../../lib/utils'
import { PanelLeft } from 'lucide-react'

interface MainLayoutProps {
    className?: string;
    vaultPath: string;
}

interface FileSidebarHeaderProps {
    onToggleCollapse?: () => void;
    isCollapsed?: boolean;
}

const FileSidebarHeader: React.FC<FileSidebarHeaderProps> = ({ onToggleCollapse, isCollapsed = false }) => {
    return (
        <div className="flex w-full justify-end h-[45px] border-b border-border items-center">
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

const MainLayout: React.FC<MainLayoutProps> = ({ className = '', vaultPath = '/Users/memo/documents' }) => {
    // TODO: Move this up to a startup page -> sets the vault path and configurations
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [activeOption, setActiveOption] = useState<IconSidebarOptions>('files')
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)

    return (
        <div className="h-screen flex flex-1">
            <ResizablePanelGroup direction="horizontal">
                {!isSidebarCollapsed && (
                    <>
                        <ResizablePanel minSize={20} maxSize={30} defaultSize={25}>  
                            {/* File Sidebar */}
                            <FileSidebar
                                vaultPath={vaultPath}
                                selectedFile={selectedFile}
                                onFileSelect={setSelectedFile}
                                activeOption={activeOption}
                                setActiveOption={setActiveOption}
                                isCollapsed={isSidebarCollapsed}
                                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            />
                        </ResizablePanel>
                    </>
                )}
                {/* BUG: If we put this inside above, it goes the opposite direction */}
                {!isSidebarCollapsed && (
                    <ResizableHandle withHandle />
                )}
                <ResizablePanel>
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
                </ResizablePanel>
            </ResizablePanelGroup>
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
                        <MainLayout
                            vaultPath={vaultPath}
                        />
                    </FileSystemProvider>
                </FileCacheProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

export default MainPageLayout