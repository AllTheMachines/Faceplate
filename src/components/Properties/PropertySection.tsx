import { HelpButton } from '../common/HelpButton'
import type { HelpContent } from '../../content/help/types'

interface PropertySectionProps {
  title: string
  children: React.ReactNode
  helpContent?: HelpContent
  /** Element type for contextual bug reports */
  elementType?: string
}

export function PropertySection({ title, children, helpContent, elementType }: PropertySectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        {helpContent && <HelpButton content={helpContent} elementType={elementType} />}
      </div>
      <div>{children}</div>
    </div>
  )
}
