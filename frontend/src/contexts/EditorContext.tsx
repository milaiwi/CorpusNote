import React, {
    createContext,
    useContext,
    ReactNode,
    useMemo,
    useState,
    useCallback,
    useRef,
} from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteSchema, defaultInlineContentSpecs, BlockNoteEditor } from '@blocknote/core';
import { FileItem } from '../components/layout/FileSidebar/utils';

import { makeFileLink } from '../components/layout/EditorManager/lib/editor/extensions/RichTextLink';
import RichTextLink from '../components/layout/EditorManager/lib/editor/extensions/RichTextLink';
import { SimilarTrigger } from '../components/layout/EditorManager/lib/editor/SimilarTrigger';

type OpenFileHandler = (path: string | FileItem) => Promise<void>;

interface SimilarUI {
    query: string,
    from: number,
    to: number,
}

interface EditorContextType {
    editor: any | null;
    registerOpenFileHandler: (handler: OpenFileHandler | null) => void;
    similarUI: SimilarUI | null;
    setSimilarUI: (similarUI: SimilarUI | null) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
    const [similarUI, setSimilarUI] = useState<SimilarUI | null>(null)

    const openFileHandlerRef = useRef<OpenFileHandler | null>(null);

    // This function allows a component to register its handler with the context
    const registerOpenFileHandler = useCallback((handler: OpenFileHandler | null) => {
        openFileHandlerRef.current = handler;
    }, []);

    const openFileProxy = useCallback(async (fileToOpen: FileItem | string) => {
        if (openFileHandlerRef.current) {
            await openFileHandlerRef.current(fileToOpen);
        } else {
            console.warn("EditorContext: No open file handler is registered. Cannot open file from link.");
        }
    }, []);

    // Create the custom schema using the proxy function
    const FileLink = makeFileLink(openFileProxy);
    const schema = BlockNoteSchema.create({
        inlineContentSpecs: {
            ...defaultInlineContentSpecs,
            fileLink: FileLink,
        }
    });

    const editor = useCreateBlockNote({
        schema,
        _tiptapOptions: {
            extensions: [
                RichTextLink,
                SimilarTrigger.configure({
                    onOpen: ({ query, from, to }, view) => {
                        setSimilarUI({ query, from, to })
                    },
                    onClose: () => setSimilarUI(null)
                })
            ],
        },
    })

    const value = useMemo(() => ({
        editor,
        registerOpenFileHandler,
        similarUI,
        setSimilarUI,
    }), [editor, registerOpenFileHandler, similarUI]);

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

// 3. Create a custom hook for easy consumption
export const useEditor = () => {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};