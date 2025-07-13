// frontend/src/components/Layout/MainLayout.tsx
import React, { useState } from 'react'
import TitleBar from './TitleBar/Titlebar';
import FileSidebar from './FileSidebar/FileSidebar';
import FileSystemProvider from '../../contexts/FileSystemContext';
import IconSidebar, { IconSidebarOptions } from './IconSidebar/IconSidebar';
import { ThemeProvider } from '../../contexts/ThemeContext';
import EditorManager from './EditorManager/EditorManager';
import { useAppSettings } from '../Settings/AppSettings';

interface MainLayoutProps {
    className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ className = '' }) => {
    const [activeOption, setActiveOption] = useState<IconSidebarOptions>('files')
    const { vaultPath } = useAppSettings()

    // setVaultPathFn('/Users/milaiwi')

    return (
        <ThemeProvider>
            <FileSystemProvider vaultPath={vaultPath}>
                <div className="h-screen flex flex-1">
                    {vaultPath === undefined ? (
                        <h1>Make sure vault is not undefined</h1>
                    ) : (
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
                                />
                            </div>

                            <div className="flex flex-col flex-1">
                                {/* Title Bar*/}
                                <TitleBar />

                                {/* Editor Window */}
                                <EditorManager />
                            </div>
                        </div>
                    )}
                </div>
            </FileSystemProvider>
        </ThemeProvider>
    )
}

export default MainLayout