// frontend/src/contexts/AppContext
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'
import { useFileCache } from './FileCache'
import { useAppSettings } from './AppContext'
import runIndexingPipeline from '../../../backend/domain/index/run-workflow'
import { useFileSystem } from './FileSystemContext'
import HuggingFaceEmbed from '../../../backend/domain/llm/huggingfaceembed'
import { Embedding } from '../../../backend/domain/llm/embedding'
import { useEditor } from './EditorContext'
import { LanguageModel } from '../../../backend/domain/llm/LanguageModel'
import { LocalModel } from '../../../backend/domain/llm/LocalModel'

interface AIContextType {
    availableModels: LanguageModel[],
    activeModel: LanguageModel | null,
    setActiveModel: (model: LanguageModel | null) => void,
    embeddingModel: Embedding | null,
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
    const [availableModels, setAvailableModels] = useState<LanguageModel[]>([])
    const [activeModel, setActiveModel] = useState<LanguageModel | null>(null)
    const [embeddingModel, setEmbeddingModel] = useState<Embedding | null>(null)

    const { prefetchOllamaModels } = useFileCache()
    const { settings, vaultPath } = useAppSettings()
    const { vaultTree, flattedFiles } = useFileSystem()
    const { editor } = useEditor()

    useEffect(() => {
        const fetchAndSetModels = async () => {
            const allModels: LanguageModel[] = []

            const localModels = await prefetchOllamaModels()
            if (localModels) {
                localModels.models.forEach((model) => {
                    allModels.push(new LocalModel(model.model))
                })
            }

            setAvailableModels(allModels)
        }
        
        fetchAndSetModels()
    }, [])

    useEffect(() => {
        const loadEmbeddingModel = async () => {
            const embeddingModel = settings?.embeddingModel

            // Defaults to hugging face so do not need to check for undefined
            if (embeddingModel && embeddingModel.embeddingModelType === "huggingface") {
                try {
                    const huggingFacePipeline = new HuggingFaceEmbed(embeddingModel.embeddingModelName!)
                    const embeddingPipeline = await huggingFacePipeline.getInstance(embeddingModel.embeddingModelName!)
                    setEmbeddingModel(embeddingPipeline)
                } catch (error) {
                    console.error("Failed to load embedding model:", error)
                }
            }    
        }

        loadEmbeddingModel()
    }, [settings])

    useEffect(() => {
        if (vaultTree.length > 0 && embeddingModel) {
            const parseMarkdownToBlocks = editor.tryParseMarkdownToBlocks.bind(editor)

            runIndexingPipeline(
                vaultPath,
                flattedFiles,
                parseMarkdownToBlocks,
                embeddingModel!,
            )
        }
    }, [vaultTree, embeddingModel])

    // Load the previous selected model from settings
    useEffect(() => {
        console.log(`[AIContext] Setting active model to ${settings?.selectedLocalModelId}`)
        if (settings?.selectedLocalModelId && availableModels.length > 0) {
            const model = availableModels.find(m => m.getIdentifier() === settings.selectedLocalModelId)
            console.log(`[AIContext] Setting active model to ${model?.getDisplayName()}`)
            setActiveModel(model)
        } else {
            setActiveModel(null)
        }
    }, [settings?.selectedLocalModelId, availableModels])

    const value = useMemo(
        () => ({    
            availableModels,
            activeModel,
            setActiveModel,
            embeddingModel,
        }),
        [availableModels, activeModel, setActiveModel, embeddingModel]
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