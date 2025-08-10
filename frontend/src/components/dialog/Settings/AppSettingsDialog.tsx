// frontend/src/components/dialog/AppSettingsDialog.tsx
import React, { useState } from 'react'
import { DialogHeader, DialogTitle } from '../../../../shadcn/ui/dialog'
import { GenericDialog } from '../../ui/GenericDialog'
import { useDialog } from '../../../contexts/DialogContext'
import { cn } from '../../../../lib/utils'
import { ModelsSettings } from './ModelsSettings'
import { useAIContext } from '../../../contexts/AIContext'

enum SettingsHeader {
    General = 'General',
    Appearance = 'Appearance',
    Models = 'Models',
    Privacy = 'Privacy',
    About = 'About',
}

// Placeholder components for each settings section
const GeneralSettings: React.FC = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">General Settings</h3>
        <p className="text-sm text-muted-foreground">
            Configure general application settings and preferences.
        </p>
        {/* Add your general settings form here */}
    </div>
)

const AppearanceSettings: React.FC = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Appearance Settings</h3>
        <p className="text-sm text-muted-foreground">
            Customize the look and feel of the application.
        </p>
        {/* Add your appearance settings form here */}
    </div>
)

const PrivacySettings: React.FC = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Privacy Settings</h3>
        <p className="text-sm text-muted-foreground">
            Manage your privacy and data preferences.
        </p>
        {/* Add your privacy settings form here */}
    </div>
)

const AboutSettings: React.FC = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">About</h3>
        <p className="text-sm text-muted-foreground">
            Information about the application and version details.
        </p>
        {/* Add your about content here */}
    </div>
)

export const SettingsDialog: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(true)
    const [selectedHeader, setSelectedHeader] = useState<SettingsHeader>(SettingsHeader.General)
    const { closeDialog } = useDialog()
    const { configuredModels, selectedModel, setSelectedModel } = useAIContext()

    const settingsHeaders = [
        { key: SettingsHeader.General, label: 'General' },
        { key: SettingsHeader.Appearance, label: 'Appearance' },
        { key: SettingsHeader.Models, label: 'Models' },
        { key: SettingsHeader.Privacy, label: 'Privacy' },
        { key: SettingsHeader.About, label: 'About' },
    ]

    const renderContent = () => {
        switch (selectedHeader) {
            case SettingsHeader.General:
                return <GeneralSettings />
            case SettingsHeader.Appearance:
                return <AppearanceSettings />
            case SettingsHeader.Models:
                return <ModelsSettings configuredModels={configuredModels} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
            case SettingsHeader.Privacy:
                return <PrivacySettings />
            case SettingsHeader.About:
                return <AboutSettings />
            default:
                return <GeneralSettings />
        }
    }

    return (
        <GenericDialog className="min-w-[600px] px-1" isOpen={isOpen} onOpenChange={(open) => {
            if (!open) {
                closeDialog()
            }
        }}>
            <DialogHeader className="gap-4">
                <DialogTitle className="hidden"></DialogTitle>
                <div className="flex gap-6 min-h-[400px]">
                    {/* Left Sidebar - Settings Navigation */}
                    <div className="border-r border-border px-2 w-32">
                        <nav className="flex flex-col gap-2">
                            {settingsHeaders.map((header) => (
                                <button
                                    key={header.key}
                                    onClick={() => setSelectedHeader(header.key)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 text-xs rounded-md transition-colors",
                                        "hover:bg-[var(--button)] cursor-pointer",
                                        selectedHeader === header.key ? "bg-[var(--button)]" : ""
                                    )}
                                >
                                    {header.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 pl-2 pr-4">
                        {renderContent()}
                    </div>
                </div>
            </DialogHeader>
        </GenericDialog>
    )
}