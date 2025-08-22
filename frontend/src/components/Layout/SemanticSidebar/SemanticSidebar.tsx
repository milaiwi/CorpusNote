import { X } from "lucide-react";
import { getFileNameFromPath } from "../FileSidebar/utils";
import { useFileSystem } from "../../../contexts/FileSystemContext";
import { useSearchSemanticContext } from "../../../contexts/Semantics/SearchSemanticContext";

interface SemanticSidebarProps {
    onClose: () => void;
}

const SemanticSidebar: React.FC<SemanticSidebarProps> = ({ onClose }) => {
    const { loadFileIntoEditor, getFileItemFromPath } = useFileSystem()
    const { searchResults, isLoading, error } = useSearchSemanticContext()

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
            
            {error ? (
                <div className="flex-1 p-4">
                    <div className="text-red-400 text-center mt-8">
                        <div>Error: {error}</div>
                    </div>
                </div>
            ) : isLoading ? (
                <div className="flex-1 p-4">
                    <div className="text-gray-400 text-center mt-8">
                        <div className="animate-pulse">Searching...</div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-4">
                    {searchResults.length > 0 ? (
                        <div>
                            <h4 className="font-medium mb-4">Related Notes ({searchResults.length})</h4>
                            <div className="space-y-3">
                                {searchResults.map((result, index) => (
                                    <button 
                                        key={index} 
                                        className="p-3 border border-border rounded-lg cursor-pointer"
                                        onClick={() => {
                                            loadFileIntoEditor(getFileItemFromPath(result.file_path)!)
                                        }}
                                    >
                                        <div className="text-sm text-gray-300 font-medium truncate">{getFileNameFromPath(result.file_path || '')}</div>
                                        <div className="text-sm text-gray-400 mt-1">{result.text.substring(0, 150)}...</div>
                                    </button>                       
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center mt-8">
                            No results found. Open a file to search for similar files.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SemanticSidebar;