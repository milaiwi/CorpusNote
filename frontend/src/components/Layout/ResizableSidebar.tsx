import React, { useRef, useEffect, useState } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../../../shadcn/ui/resizable'
import FileSidebar from './FileSidebar/FileSidebar'
import { IconSidebarOptions } from './IconSidebar/IconSidebar'
import { cn } from '../../../lib/utils'

interface ResizableSidebarProps {
  vaultPath: string
  selectedFile: string | null
  onFileSelect: (filePath: string) => void
  activeOption: IconSidebarOptions
  setActiveOption: (option: IconSidebarOptions) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  children: React.ReactNode
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  vaultPath,
  selectedFile,
  onFileSelect,
  activeOption,
  setActiveOption,
  isCollapsed,
  onToggleCollapse,
  children,
}) => {
  const [panelSize, setPanelSize] = useState<number>(25) // Default size in percent
  const previousSizeRef = useRef<number>(25)

  // Save the last known size when resizing
  const handleResize = (sizes: number[]) => {
    if (sizes.length > 0) {
      const newSize = sizes[0]
      setPanelSize(newSize)
      previousSizeRef.current = newSize
    }
  }

  // Restore previous size when expanding
  useEffect(() => {
    if (!isCollapsed && previousSizeRef.current !== panelSize) {
      setPanelSize(previousSizeRef.current)
    }
  }, [isCollapsed])

  return (
    <ResizablePanelGroup direction="horizontal" onLayout={handleResize} className="h-full w-full">
      {/* Sidebar Panel */}
      <ResizablePanel
        minSize={20}
        maxSize={30}
        defaultSize={panelSize}
        className={cn(
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'min-w-0 max-w-0 shrink-0 basis-0 overflow-hidden' : 'min-w-[15%] max-w-[30%]'
        )}
      >
        <div
          className={cn(
            'h-full transition-transform duration-300 ease-in-out',
            isCollapsed ? '-translate-x-full' : 'translate-x-0'
          )}
        >
          <FileSidebar
            vaultPath={vaultPath}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            activeOption={activeOption}
            setActiveOption={setActiveOption}
            isCollapsed={isCollapsed}
            onToggleCollapse={onToggleCollapse}
          />
        </div>
      </ResizablePanel>

      {/* Resize Handle */}
      {!isCollapsed && <ResizableHandle withHandle />}

      {/* Editor Panel */}
      <ResizablePanel>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default ResizableSidebar
