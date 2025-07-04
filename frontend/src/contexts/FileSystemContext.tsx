// frontend/src/contexts/FileSystemContext.tsx

interface FileSystemContextProps {
}

const FileSystemContext: React.FC<FileSystemContextProps> = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={`bg-primary text-primary-foreground h-full flex flex-co`}>
            {children}
        </div>
    )
}

export default FileSystemContext