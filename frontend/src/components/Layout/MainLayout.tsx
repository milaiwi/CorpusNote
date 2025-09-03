// frontend/src/components/layout/MainLayout.tsx
import React, { useState, useRef } from 'react';
import TitleBar from './TitleBar/Titlebar';
import FileSystemProvider from '../../contexts/FileSystemContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IconSidebarOptions } from './IconSidebar/IconSidebar';
import { ThemeProvider } from '../../contexts/ThemeContext';
import FileCacheProvider from '../../contexts/FileCache';
import { DialogProvider } from '../../contexts/DialogContext';
import { AppProvider } from '../../contexts/AppContext';
import { useAppSettings } from '../../contexts/AppContext';
import { AIProvider } from '../../contexts/AIContext';
import dynamic from "next/dynamic";
import FileSidebar from './FileSidebar/FileSidebar';
import { useFileSystem } from '../../contexts/FileSystemContext';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '../../../shadcn/ui/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import SemanticSidebar from './SemanticSidebar/SemanticSidebar';
import { SearchSemanticProvider } from '../../contexts/Semantics/SearchSemanticContext';
import EmptyPage from './Misc/EmptyPage';

// Prevent the editor manager from being loaded immediately on the server side
const EditorManager = dynamic(() => import('./EditorManager/EditorManager'), {
    ssr: false,
});

const MainLayout: React.FC = () => {
    const [activeOption, setActiveOption] = useState<IconSidebarOptions>('files');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
    const [isSemanticSearchOpen, setIsSemanticSearchOpen] = useState<boolean>(false);
    const { currentOpenedFile } = useFileSystem();
    

    // Create a ref to imperatively control the left panel
    const leftPanelRef = useRef<ImperativePanelHandle>(null);

    // This single handler will be used by both the TitleBar and the FileSidebar
    const handleToggleFileSidebar = () => {
        const panel = leftPanelRef.current;
        if (panel) {
            // Use the panel's internal state to decide whether to expand or collapse
            if (panel.isCollapsed()) {
                panel.expand();
            } else {
                panel.collapse();
            }
        }
    };

    return (
        <ResizablePanelGroup direction="horizontal" className="h-screen w-full">
            {/* Left Sidebar - Files and Icons */}
            <ResizablePanel
                ref={leftPanelRef}
                collapsible={true}
                collapsedSize={0}
                minSize={15}
                maxSize={30} // Capped at 30% of the window width
                defaultSize={20}
                onCollapse={() => setIsSidebarCollapsed(true)}
                onExpand={() => setIsSidebarCollapsed(false)}
            >
                <FileSidebar
                    selectedFile={currentOpenedFile}
                    activeOption={activeOption}
                    setActiveOption={setActiveOption}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={handleToggleFileSidebar} // Use the new handler
                />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Editor Panel - Takes remaining space */}
            <ResizablePanel defaultSize={60} minSize={40}>
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    {currentOpenedFile ? (
                        <div>
                            <TitleBar
                                selectedFile={currentOpenedFile}
                                isSidebarCollapsed={isSidebarCollapsed}
                                onToggleSidebar={handleToggleFileSidebar} // Use the new handler
                                onToggleSemanticSearch={() => setIsSemanticSearchOpen(!isSemanticSearchOpen)}
                            />
                            <EditorManager />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-w-0 h-full">
                            <EmptyPage />
                        </div>
                    )}
                </div>
            </ResizablePanel>

            {/* Right Sidebar - Semantic Search (conditionally rendered) */}
            {isSemanticSearchOpen && (
                <>
                    <ResizableHandle withHandle />
                    <ResizablePanel
                        collapsible={true}
                        collapsedSize={0}
                        minSize={15}
                        maxSize={30} // Capped at 30% of the window width
                        defaultSize={20}
                        onCollapse={() => setIsSemanticSearchOpen(false)}
                    >
                        <SemanticSidebar onClose={() => setIsSemanticSearchOpen(false)} />
                    </ResizablePanel>
                </>
            )}
        </ResizablePanelGroup>
    );
};

const MainPageLayout = () => {
    const queryClient = new QueryClient();

    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <AppProvider>
                    <FileCacheProvider>
                        <FileSystemProvider>
                            <AIProvider>
                                <SearchSemanticProvider>
                                    <DialogProvider>
                                        <MainLayout />
                                    </DialogProvider>
                                </SearchSemanticProvider>
                            </AIProvider>
                        </FileSystemProvider>
                    </FileCacheProvider>
                </AppProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

export default MainPageLayout;
