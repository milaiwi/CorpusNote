import { InputRule } from "./InputRules";
import { DummyTemplate } from "./SemanticFiles";

const similarFileRule: InputRule = {
    regex: new RegExp("\\[\\[(.+?)\\s*\\|$"),
    action: (editor, match, context, setPopover) => {
        const linkText = match[1].trim()
        
        // Get cached similar files synchronously
        if (context.getCurrentFileSimilarFiles) {
            const similarFiles = context.getCurrentFileSimilarFiles()
            
            const { from, to } = editor._tiptapEditor.state.selection
            const rect = editor._tiptapEditor.view.coordsAtPos(from)
            console.log('rect', rect)
            
            if (similarFiles.length > 0) {
                setPopover(
                    <DummyTemplate 
                        similarFiles={similarFiles} 
                        rect={rect}
                        onFileSelect={(_) => {
                            setPopover(null);
                        }}
                        onClose={() => {
                            // Handle manual close
                            setPopover(null);
                        }}
                    />
                );
            }
        }
    }
}

export const customInputRules: InputRule[] = [
    similarFileRule
]