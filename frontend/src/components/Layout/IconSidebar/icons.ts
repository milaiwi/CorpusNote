import React from 'react'
import {
    File,
    Search,
    SquarePen,
    FolderPlus,
    Vault
} from 'lucide-react'

interface IconProps {
  id: string;  // 'file', 'search', etc..
  icon: React.ComponentType<{ size?: number; className?: string }>; // Icon to display
  label: string; // Label for element (display on hover)
  action?: () => void; // callback function on selection
}

// TODO: Create three different levels (top, center, bottom)
const icons: IconProps[] = [
    {
        id: 'files',
        icon: File,
        label: 'Files',
    },
    {
        id: 'search',
        icon: Search,
        label: 'Search',
    },
    {
        id: 'new-note',
        icon: SquarePen,
        label: 'New Note',
    },
    {
        id: 'new-directory',
        icon: FolderPlus,
        label: 'New Directory',
    },
    {
        id: 'open-vault',
        icon: Vault,
        label: 'Open Vault',
    }
]

export default icons