import { X } from "lucide-react";


interface SemanticSidebarProps {
    onClose: () => void;
}

const SemanticSidebar: React.FC<SemanticSidebarProps> = ({ onClose }) => {
    return (
        <div className="flex flex-col">
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
            <div className="flex-1 p-4">
                <div className="text-gray-400 text-center mt-8">
                    Semantic search functionality coming soon...
                </div>
            </div>
        </div>
    )
}

export default SemanticSidebar;