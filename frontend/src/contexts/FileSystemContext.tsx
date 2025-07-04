// frontend/src/contexts/FileSystemContext.tsx

interface FileSystemContextProps {
}

const FileSystemContext: React.FC<FileSystemContextProps> = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={`h-full flex flex-col bg-gray-900 text-gray-100`}>
            {children}
        </div>
    )
}

export default FileSystemContext