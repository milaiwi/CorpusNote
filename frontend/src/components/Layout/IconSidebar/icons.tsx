import React, { ReactNode } from 'react'
import {
    File,
    Search,
    SquarePen,
    FolderPlus,
    Vault
} from 'lucide-react'
import { VaultSelectorDialog } from '../../dialogs/VaultSelectorDialog';


export interface IconProps {
  id: string;  // 'file', 'search', etc..
  icon: React.ComponentType<{ size?: number; className?: string }>; // Icon to display
  label: string; // Label for element (display on hover)
  action?: (openDialog: (component: React.ReactNode) => void) => void
}

export const topLevelIcons: IconProps[] = [
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
] 

export const bottomLevelIcons: IconProps[] = [
    {
        id: 'open-vault',
        icon: Vault,
        label: 'Open Vault',
        action: (openDialog) => {
            openDialog(
                <VaultSelectorDialog />
            )
        }
    }
]

