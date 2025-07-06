import React from 'react'
import { SidebarIconButton } from '../../ui/SidebarButton';
import { IconProps, topLevelIcons, bottomLevelIcons } from './icons'
import { ThemeToggle } from '../../ui/ThemeToggle';
import { LucideIcon } from 'lucide-react';
import { useDialog } from '@/src/contexts/DialogContext';

export type IconSidebarOptions = 'files' | 'search' | 'new-note' | 'new-directory' | 'open-vault'

interface IconSidebarProps {
    activeOption: IconSidebarOptions
    onOptionChange?: (option: IconSidebarOptions) => void
    className?: string
}

interface IconGroupProps {
    icons: IconProps[]
    activeOption: IconSidebarOptions
    onOptionChange?: (option: IconSidebarOptions) => void
    openDialog: (dialog: React.ReactNode) => void
}

// TODO: Change this to use shadcn
const IconSidebar: React.FC<IconSidebarProps> = ({
    activeOption,
    onOptionChange,
    className = ""
}) => {
    const { openDialog } = useDialog()

    return (
        <div className={`
            w-12
            border-r border-gray-200 dark:border-gray-800
            flex flex-col justify-between items-center py-2
            ${className}
        `}>
            <IconGroup
                icons={topLevelIcons}
                activeOption={activeOption}
                onOptionChange={onOptionChange}
                openDialog={openDialog}
            />

            <div className="flex flex-col items-center gap-2">
                <IconGroup 
                    icons={bottomLevelIcons} 
                    activeOption={activeOption} 
                    onOptionChange={onOptionChange}
                    openDialog={openDialog}
                />
                <ThemeToggle />
            </div>

        </div>
    )
}

const IconGroup: React.FC<IconGroupProps> = ({
    icons,
    activeOption,
    onOptionChange,
    openDialog,
}) => {

    return (
        <div className="flex flex-col gap2">
            {icons.map((item) => {
                const Icon = item.icon
                const isActive = item.id === activeOption
                
                const handleClick = () => {
                    if (item.action) {
                        item.action(openDialog)
                        return
                    }

                    if (onOptionChange && item.id !== activeOption) {
                        onOptionChange(item.id as IconSidebarOptions)
                    }
                }

                return (
                    <SidebarIconButton
                        key={item.id}
                        icon={Icon as LucideIcon}
                        label={item.label}
                        isActive={isActive}
                        onClick={handleClick}
                    />
                );
            })}
        </div>
    )
}

export default IconSidebar