// frontend/src/components/ui/SidebarButton.tsx
import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from '../../../shadcn/ui/button'
import { cn } from '../../../lib/utils'

interface SidebarButtonProps {
  icon: LucideIcon
  label?: string
  isActive?: boolean
  onClick?: () => void
  className?: string
  showTooltip?: boolean
}

/**
 * Icon-only sidebar button
 */
export const SidebarIconButton: React.FC<SidebarButtonProps> = ({
  icon: Icon,
  label,
  isActive = false,
  onClick,
  className,
  showTooltip = true
}) => {
  return (
    <Button
      variant={isActive ? "sidebarActive" : "sidebar"}
      size="sidebarIcon"
      onClick={onClick}
      className={cn(className)}
      title={showTooltip ? label : undefined}
    >
      <Icon size={16} />
    </Button>
  )
}

/**
 * Sidebar button with icon and text
 */
export const SidebarTextButton: React.FC<SidebarButtonProps> = ({
  icon: Icon,
  label,
  isActive = false,
  onClick,
  className
}) => {
  return (
    <Button
      variant={isActive ? "sidebarActive" : "sidebar"}
      size="sidebarSm"
      onClick={onClick}
      className={cn(className)}
    >
      <Icon size={16} className="shrink-0" />
      {label && <span className="truncate">{label}</span>}
    </Button>
  )
}

/**
 * Adaptive sidebar button that switches between icon-only and text based on content
 */
export const SidebarButton: React.FC<SidebarButtonProps> = (props) => {
  return props.label ? 
    <SidebarTextButton {...props} /> : 
    <SidebarIconButton {...props} />
}