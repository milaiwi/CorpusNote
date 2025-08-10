import React from 'react'
import {
    File,
    Search,
    SquarePen,
    FolderPlus,
    Vault,
    Settings,
} from 'lucide-react'
import { VaultSelectorDialog } from '../../dialog/VaultSelectorDialog'
import { NewNoteDialog } from '../../dialog/NewNoteDialog'
import { NewDirectoryDialog } from '../../dialog/NewDirectoryDialog'
import { SettingsDialog } from '../../dialog/Settings/AppSettingsDialog'

export interface IconProps {
  id: string;  // 'file', 'search', etc..
  icon: React.ComponentType<{ size?: number; className?: string }>; // Icon to display
  label: string; // Label for element (display on hover)
  action?: (openDialog: (component: React.ReactNode) => void) => void; // callback function on selection
}

const FileIcon: IconProps = {
    id: 'file',
    icon: File,
    label: 'File',
}

const SearchIcon: IconProps = {
    id: 'search',
    icon: Search,
    label: 'Search',
}

const NewNoteIcon: IconProps = {
    id: 'new-note',
    icon: SquarePen,
    label: 'New Note',
    action: (openDialog) => {
        openDialog(
            <NewNoteDialog />
        )
    }
}

const NewDirectoryIcon: IconProps = {
    id: 'new-directory',
    icon: FolderPlus,
    label: 'New Directory',
    action: (openDialog) => {
        openDialog(
            <NewDirectoryDialog />
        )
    }
}

const OpenVaultIcon: IconProps = {
    id: 'open-vault',
    icon: Vault,
    label: 'Open Vault',
    action: (openDialog) => {
        openDialog(
            <VaultSelectorDialog />
        )
    }
}

const SettingsIcon: IconProps ={ 
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    action: (openDialog) => {
        openDialog(
            <SettingsDialog />
        )
    }
}

export const topLevelIcons: IconProps[] = [
    FileIcon,
    SearchIcon,
    NewNoteIcon,
    NewDirectoryIcon,
] 

export const bottomLevelIcons: IconProps[] = [
    OpenVaultIcon,
    SettingsIcon,
]

export {
    FileIcon,
    SearchIcon,
    NewNoteIcon,
    NewDirectoryIcon,
    OpenVaultIcon,
}
