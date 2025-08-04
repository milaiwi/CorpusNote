import { LucideIcon } from "lucide-react"
import { Button } from "../../shadcn/ui/button"


type ShadcnComponentProps = {
    icon: any
    description?: string
}

/**
 * https://ui.shadcn.com/docs/components/button#:~:text=Link-,Icon,-Preview
 * 
 * @returns Button using secondary variant from shadcn with ONLY the icon
 */
export const ButtonIcon: React.FC<ShadcnComponentProps> = ({ icon: Icon }) => {
  return (
    <Button variant="secondary" size="icon">
      <Icon />
    </Button>
  )
}

/**
 * https://ui.shadcn.com/docs/components/button#:~:text=%7D-,With%20Icon,-Preview
 * 
 * @param icon: the lucide-react icon to display next to the text
 * @param description: the description or text to accompany the icon 
 * @returns Button using an outline variant from shadcn with the icon AND text
 *  
 */
export const ButtonWithIcon: React.FC<ShadcnComponentProps> = ({ icon: Icon, description }) => {
  return (
    <Button variant="outline" size="sm">
      <Icon /> {description}
    </Button>
  )
}