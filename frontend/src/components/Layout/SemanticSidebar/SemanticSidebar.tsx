import { invoke } from "@tauri-apps/api/tauri";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAIContext } from "../../../contexts/AIContext";
import { getFileNameFromPath } from "../FileSidebar/utils";
import { useFileSystem } from "../../../contexts/FileSystemContext";
import { extractTextFromBlocks } from "../EditorManager/utils/blockUtils";

interface SemanticSidebarProps {
    onClose: () => void;
}

const SemanticSidebar: React.FC<SemanticSidebarProps> = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const { editorInitialBlocks } = useFileSystem()
    const { embeddingModel } = useAIContext()
    const { currentOpenedFile, loadFileIntoEditor, getFileItemFromPath } = useFileSystem()
    
    useEffect(() => {
        const search = async () => {
            console.log("Embedding model: ", embeddingModel)
            if (!embeddingModel) {
                console.log("No embedding model available yet")
                return
            }

            if (!editorInitialBlocks) {
                console.log("Loading editor markdown...")
                return
            }
            
            setIsLoading(true)
            setError(null)
            
            try {
                // Extract text content from each block's content array
                const query = extractTextFromBlocks(editorInitialBlocks)
                console.log(`Query: ${query}`)
                const queryVector = Array.from(await embeddingModel.embed(query))
                const results: string = await invoke("search", {
                    name: "indexing_table",
                    query: query,
                    queryVector: queryVector,
                    limit: 10
                })

                const resultsJson = JSON.parse(results)
                console.log("Search results: ", resultsJson)
                setSearchResults(resultsJson)
            } catch (err) {
                console.error("Search failed:", err)
                setError(err instanceof Error ? err.message : "Search failed")
            } finally {
                setIsLoading(false)
            }
        }

        search()
    }, [embeddingModel, editorInitialBlocks, currentOpenedFile])

    return (
        <div className="flex flex-col overflow-y-auto h-full">
            <div className="flex items-center justify-between h-[45px] border-b border-border border-l px-4">
                <h3 className="text-sm font-medium text-gray-200">Semantic Search</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-700 rounded transition-colors cursor-pointer"
                    title="Hide semantic search"
                >
                    <X size={16} className="text-gray-400" />
                </button>
            </div>
            
            {!embeddingModel ? (
                <div className="flex-1 p-4">
                    <div className="text-gray-400 text-center mt-8">
                        <div className="animate-pulse">Loading embedding model...</div>
                        <div className="text-sm mt-2">Please wait while the AI model initializes.</div>
                    </div>
                </div>
            ) : isLoading ? (
                <div className="flex-1 p-4">
                    <div className="text-gray-400 text-center mt-8">
                        <div className="animate-pulse">Searching...</div>
                    </div>
                </div>
            ) : error ? (
                <div className="flex-1 p-4">
                    <div className="text-red-400 text-center mt-8">
                        <div>Error: {error}</div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-4">
                    {searchResults.length > 0 ? (
                        <div>
                            <h4 className="font-medium mb-4">Related Notes ({searchResults.length - 1})</h4>
                            <div className="space-y-3">
                                {searchResults.map((result, index) => (
                                    result.file_path != currentOpenedFile?.absPath && (
                                        <button 
                                            key={index} 
                                            className="p-3 border border-border rounded-lg cursor-pointer"
                                            onClick={() => {
                                                console.log("Opening file: ", result.file_path)
                                                loadFileIntoEditor(getFileItemFromPath(result.file_path)!)
                                            }}
                                        >
                                            <div className="text-sm text-gray-300 font-medium truncate">{getFileNameFromPath(result.file_path || '')}</div>
                                            <div className="text-sm text-gray-400 mt-1">{result.text.substring(0, 150)}...</div>
                                        </button>          
                                    )                              
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center mt-8">
                            No results found for "hitler"
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SemanticSidebar;