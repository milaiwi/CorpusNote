// frontend/src/contexts/AppContext
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'
import { useFileCache } from './FileCache'
import { OllamaModel } from '../components/models/ollama'
import { useAppSettings } from './AppContext'

interface AIContextType {
    configuredModels: OllamaModel[],
    selectedModel: OllamaModel | null,
    setSelectedModel: (model: OllamaModel | null) => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

/**
 * AIContext is a context that provides the configured models and the selected model to the app.
 * It handles all the logic for fetching and interacting with the models.
 * 
 * @param children - The children of the AIProvider
 * @returns The AIContext
 */
export const AIProvider = ({ children }: { children: ReactNode }) => {
    const [configuredModels, setConfiguredModels] = useState<OllamaModel[]>([])
    const [selectedModel, setSelectedModel] = useState<OllamaModel | null>(null)
    const { prefetchOllamaModels } = useFileCache()
    const { settings } = useAppSettings()

    useEffect(() => {
        const fetchModels = async () => {
            const _models = await prefetchOllamaModels()
            if (_models)
                setConfiguredModels(_models.models)
        }
        fetchModels()
    }, [])

    // Load the previous selected model from settings
    useEffect(() => {
        const selectedLocalModel = settings?.selectedLocalModel
        if (selectedLocalModel) {
            setSelectedModel(configuredModels.find(model => model.model === selectedLocalModel) ?? null)
        }
    }, [settings, configuredModels])    

    const value = useMemo(
        () => ({    
            configuredModels,
            selectedModel,
            setSelectedModel,
        }),
        [configuredModels, selectedModel, setSelectedModel]
    )

    return (
        <AIContext.Provider value={value}>
            {children}
        </AIContext.Provider>
    )
}

export const useAIContext = () => {
    const context = useContext(AIContext)
    if (context === undefined)
        throw new Error('useAIContext must be used within a AIProvider')
    return context
}