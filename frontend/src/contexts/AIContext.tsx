// frontend/src/contexts/AppContext
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'
import { useFileCache } from './FileCache'
import { OllamaModel } from '../components/models/ollama'

interface AIContextType {
    configuredModels: OllamaModel[],
    selectedModel: OllamaModel | null,
    setSelectedModel: (model: OllamaModel | null) => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export const AIProvider = ({ children }: { children: ReactNode }) => {
    const [configuredModels, setConfiguredModels] = useState<OllamaModel[]>([])
    const [selectedModel, setSelectedModel] = useState<OllamaModel | null>(null)
    const { prefetchOllamaModels } = useFileCache()

    useEffect(() => {
        const fetchModels = async () => {
            const _models = await prefetchOllamaModels()
            if (_models) {
                setConfiguredModels(_models.models)
            }
        }
        fetchModels()
    }, [])

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