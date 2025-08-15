// frontend/src/contexts/AppContext
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'
import { useFileCache } from './FileCache'
import { OllamaModel } from '../components/models/ollama'
import { useAppSettings } from './AppContext'
import runIndexingPipeline from '../../../backend/domain/index/run-workflow'
import { useFileSystem } from './FileSystemContext'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteEditor } from '@blocknote/core'
import HuggingFaceEmbed from '../../../backend/domain/llm/huggingfaceembed'
import { Embedding } from '../../../backend/domain/llm/embedding'

interface AIContextType {
    configuredModels: OllamaModel[],
    selectedModel: OllamaModel | null,
    setSelectedModel: (model: OllamaModel | null) => void
    editor: BlockNoteEditor
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
    const [embeddingModel, setEmbeddingModel] = useState<Embedding | null>(null)
    const { prefetchOllamaModels } = useFileCache()
    const { settings, vaultPath } = useAppSettings()
    const { vaultTree } = useFileSystem()

    const editor = useCreateBlockNote()

    useEffect(() => {
        const fetchModels = async () => {
            const _models = await prefetchOllamaModels()
            if (_models)
                setConfiguredModels(_models.models)
        }
        fetchModels()
    }, [])

    useEffect(() => {
        const loadEmbeddingModel = async () => {
            const embeddingModel = settings?.embeddingModel

            // Defaults to hugging face so do not need to check for undefined
            if (embeddingModel.embeddingModelType === "huggingface") {
                const huggingFacePipeline = new HuggingFaceEmbed(embeddingModel.embeddingModelName!)
                const embeddingPipeline = await huggingFacePipeline.getInstance(embeddingModel.embeddingModelName!)
                setEmbeddingModel(embeddingPipeline)
            }    
        }

        loadEmbeddingModel()
    }, [settings])

    useEffect(() => {
        if (vaultTree.length > 0 && embeddingModel) {
            console.log(`[AIContext] Running indexing pipeline...`)
            const files = vaultTree[0].children
            const parseMarkdownToBlocks = editor.tryParseMarkdownToBlocks.bind(editor)

            runIndexingPipeline(
                vaultPath,
                files,
                parseMarkdownToBlocks,
                embeddingModel!,
            )
        }
    }, [vaultTree, embeddingModel])

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
            editor,
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