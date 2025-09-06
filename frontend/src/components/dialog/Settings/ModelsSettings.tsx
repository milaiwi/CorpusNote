import React from 'react'
import { SettingsRow } from './utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../../shadcn/ui/dropdown-menu'
import { Button } from '../../../../shadcn/ui/button'
import { OllamaModel } from '../../models/ollama'
import { useAppSettings } from '../../../contexts/AppContext'
import { LanguageModel } from '../../../../../backend/domain/llm/LanguageModel'


interface ModelsSettingsProps {
    configuredModels: LanguageModel[],
    selectedModel: LanguageModel | null,
    setSelectedModel: (model: OllamaModel | null) => void
}

export const ModelsSettings: React.FC<ModelsSettingsProps> = ({ configuredModels, selectedModel, setSelectedModel }) => {
    const { updateSettings } = useAppSettings()

    const handleModelChange = (model: LanguageModel | null) => {
        setSelectedModel(model)
        updateSettings({
            selectedLocalModelId: model?.getIdentifier(),
        })
    }

    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Models Settings</h3>
            {/* Add your models settings form here */}
            <SettingsRow title="Models" description="Configure AI models and language settings.">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' className="truncate w-full">{selectedModel ? selectedModel.getDisplayName() : "Select Model"}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {configuredModels.map((_model) => (
                            <DropdownMenuItem key={_model.getIdentifier()} onClick={() => handleModelChange(_model)}>{_model.getDisplayName()}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>

                </DropdownMenu>
            </SettingsRow>
        </div>
    )
}