import { InputRule } from "./InputRules";

const similarFileRule: InputRule = {
    regex: new RegExp("\\[\\[(.+?)\\s*\\|$"),
    action: (editor, match, context) => {
        const linkText = match[1].trim()
        console.log(`[[${linkText}]]`)
        
        // Get cached similar files synchronously
        if (context.getCurrentFileSimilarFiles) {
            const similarFiles = context.getCurrentFileSimilarFiles()
            console.log('Similar files found:', similarFiles.length)
            
            // You can now use the similarFiles data immediately
            // For example, show them in a dropdown, insert them, etc.
            if (similarFiles.length > 0) {
                console.log('First similar file:', similarFiles[0])
            }
        }
    }
}


export const customInputRules: InputRule[] = [
    similarFileRule
]