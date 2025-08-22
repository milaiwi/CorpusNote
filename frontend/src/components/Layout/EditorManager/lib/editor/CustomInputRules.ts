import { InputRule } from "./InputRules";

const similarFileRule: InputRule = {
    regex: new RegExp("\\[\\[(.+?)\\s*\\|$"),
    action: (editor, match, context) => {
        const linkText = match[1].trim()
        console.log(`[[${linkText}]]`)
        
        if (context.searchSimilarUsingCurrentFile) {
            context.searchSimilarUsingCurrentFile()
        }
    }
}


export const customInputRules: InputRule[] = [
    similarFileRule
]