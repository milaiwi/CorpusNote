import React from 'react'
import { SidebarIconButton } from '../../ui/SidebarButton';
import { IconProps } from '../../layout/IconSidebar/icons'
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export type IconSidebarOptions = 'files' | 'search' | 'new-note' | 'new-directory'


interface IconGroupProps {
    icons: IconProps[]
    activeOption: IconSidebarOptions
    onOptionChange?: (option: IconSidebarOptions) => void
    className?: string
    customIcons?: React.ReactNode[]
    openDialog: (dialog: React.ReactNode) => void
}

export const IconGroup: React.FC<IconGroupProps> = ({
    icons,
    activeOption,
    onOptionChange,
    openDialog,
    className = "",
    customIcons = []
}) => {
    return (
        <div className={cn("flex gap-1 w-full", className)}>
            {icons.map((item) => {
                const Icon = item.icon
                const isActive = item.id === activeOption

                const handleClick = () => {
                    console.log("handleClick", item.action)
                    if (item.action) {
                        console.log("opening dialog")
                        item.action(openDialog)
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

            {/* Custom icons */}
            {customIcons.map((customIcon, index) => {
                return (
                    <div key={index}>
                        {customIcon}
                    </div>
                )
            })}
        </div>
    )
}