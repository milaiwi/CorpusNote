import { SearchResult } from "../../../../../contexts/Semantics/types"

interface DummyTemplateProps {
    similarFiles: SearchResult[]
    rect?: { top: number; left: number; bottom: number; right: number }
    onFileSelect?: (file: SearchResult) => void
    onClose?: () => void
}

export const DummyTemplate: React.FC<DummyTemplateProps> = ({ 
    similarFiles, 
    rect, 
    onFileSelect, 
    onClose 
}) => {
    console.log('similarFiles', similarFiles)
    
    const style: React.CSSProperties = {
        position: 'fixed',
        bottom: `calc(100vh - ${rect.top}px)`, 
        left: rect.left,
        width: '50%',
        maxHeight: '400px',
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        color: 'black',
        borderRadius: 8,
        padding: 16,
        zIndex: 1000,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'auto',
    }

    const handleFileClick = (file: SearchResult) => {
        if (onFileSelect) {
            onFileSelect(file);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
            onClose();
        }
    }

    return (
        <div 
            style={style} 
            onKeyDown={handleKeyDown}
            tabIndex={0}
            data-popover="true"
        >
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 12 
            }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    Similar files
                </h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: '#6b7280'
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {similarFiles.map((file) => (
                    <li 
                        key={file.file_path}
                        onClick={() => handleFileClick(file)}
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderRadius: 4,
                            marginBottom: 4,
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                    >
                        {file.file_path}
                    </li>
                ))}
            </ul>
        </div>
    )
}