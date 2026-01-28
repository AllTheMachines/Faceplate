import { ReactNode } from 'react'
import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'

interface ThreePanelLayoutProps {
  children: ReactNode
  bottomPanel?: ReactNode
  showBottomPanel?: boolean
}

export function ThreePanelLayout({ children, bottomPanel, showBottomPanel = false }: ThreePanelLayoutProps) {
  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-100" style={{ display: 'grid', gridTemplateColumns: '250px 1fr 300px' }}>
      <LeftPanel />
      <div className="flex flex-col h-screen">
        {/* Canvas area */}
        <div className={`relative overflow-hidden ${showBottomPanel ? 'h-1/2' : 'h-full'}`}>
          {children}
        </div>

        {/* Bottom panel (history) */}
        {showBottomPanel && bottomPanel && (
          <>
            <div className="h-1 bg-gray-700 flex-shrink-0" />
            <div className="h-1/2 overflow-hidden">
              {bottomPanel}
            </div>
          </>
        )}
      </div>
      <RightPanel />
    </div>
  )
}
