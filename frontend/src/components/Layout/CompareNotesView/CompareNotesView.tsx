// frontend/src/components/layout/CompareNotesView/CompareNotesView.tsx
import { useState, useEffect } from "react";
import { FileItem } from "../FileSidebar/utils";
import { useAIContext } from "../../../contexts/AIContext";
import { useFileCache } from "../../../contexts/FileCache";
import { X } from "lucide-react";
import { Button } from "../../../../shadcn/ui/button";
import { runAITask } from "../../../lib/ai";
import { compareNotesPrompt } from "../../../lib/ai/prompt";
import ReactMarkdown from "react-markdown";
import { Block } from "@blocknote/core";
import { useEditor } from "../../../contexts/EditorContext";

interface CompareNotesViewProps {
    files: [FileItem, FileItem] | null;
    onClose: () => void;
}

const CompareNotesView: React.FC<CompareNotesViewProps> = ({ files, onClose }) => {
    const [comparison, setComparison] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { activeModel } = useAIContext();
    const { readFileAndCache } = useFileCache();
    const { editor } = useEditor();

    useEffect(() => {
        if (!files) return

        const performComparison = async () => {
            setIsLoading(true)
            setError(null)
            setComparison('')

            try {
                if (!activeModel) throw new Error('No AI model selected.')
                
                const [noteAContent, noteBContent] = await Promise.all([
                    readFileAndCache(files[0]),
                    readFileAndCache(files[1]),
                ])

                const noteAMarkdown = await editor.blocksToMarkdownLossy(noteAContent.content as Block[])
                const noteBMarkdown = await editor.blocksToMarkdownLossy(noteBContent.content as Block[])

                console.log(noteAMarkdown)
                console.log(noteBMarkdown)

                if (noteAContent === null || noteBContent === null)
                    throw new Error('Could not read the content of one or both notes.')
                
                const result = await runAITask(activeModel, compareNotesPrompt, {
                    fileA: files[0],
                    fileB: files[1],
                    noteAContent: noteAMarkdown,
                    noteBContent: noteBMarkdown,
                })

                console.log(result)
                setComparison(result)
            } catch (err) {
                setError(err.message || 'An unkown error occurred.')
            } finally {
                setIsLoading(false)
            }
        }

        performComparison()
    }, [files, activeModel, readFileAndCache])

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Note Comparison</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X size={16} />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {isLoading && <p>Comparing notes...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {comparison && (
                    <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{comparison}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CompareNotesView