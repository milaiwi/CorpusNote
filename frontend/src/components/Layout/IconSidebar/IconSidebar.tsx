import React from 'react'
import { IconProps, topLevelIcons, bottomLevelIcons } from './icons'

type iconSidebarOptions = 'files' | 'search' | 'new-note' | 'new-directory' | 'open-vault'

interface IconSidebarProps {
    option: iconSidebarOptions
}

interface DisplayIconProps {
    icons: IconProps[]
    option: iconSidebarOptions
}

// TODO: Change this to use shadcn
const IconSidebar: React.FC<IconSidebarProps> = ({ option }) => {
    return (
        <div className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col justify-between items-center py-2">
            <DisplayIcons icons={topLevelIcons} option={option} />
            <DisplayIcons icons={bottomLevelIcons} option={option} />
        </div>
    )
}

const DisplayIcons: React.FC<DisplayIconProps> = ({ icons, option }) => {
    return (
        <div>
            {icons.map((item) => {
                const Icon = item.icon;
                {/* TODO: change to nextjs conditional css */}
                const isActive = item.id === 'vault' && option;
                
                return (
                <button
                    key={item.id}
                    onClick={item.action}
                    className={`
                    w-8 h-8 mb-2 rounded flex items-center justify-center
                    transition-colors duration-200 cursor-pointer
                    ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    }
                    `}
                    title={item.label}
                >
                    <Icon size={16} />
                </button>
                );
            })}
        </div>
    )
}

export default IconSidebar