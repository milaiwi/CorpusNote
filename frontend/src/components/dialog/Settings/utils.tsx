// frontend/src/components/dialog/Settings/utils.tsx
import React from 'react'

interface SettingsRowProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  border?: boolean
}

/**
 * Renders a settings row with title, description, and component
 * Layout: Title and description on the left (stacked), component on the right
 */
export const SettingsRow: React.FC<SettingsRowProps> = ({
  title,
  description,
  children,
  className = "",
  border = false
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 ${border ? "border-b border-border last:border-b-0" : ""} ${className}`}>
      {/* Left side - Title and Description */}
      <div className="w-[60%] min-w-0">
        <h3 className="text-sm font-medium text-foreground mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {/* Right side - Component */}
      <div className="w-[40%] flex justify-end">
        {children}
      </div>
    </div>
  )
}

