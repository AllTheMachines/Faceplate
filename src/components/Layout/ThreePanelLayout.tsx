import { ReactNode } from 'react'
import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'

interface ThreePanelLayoutProps {
  children: ReactNode
}

export function ThreePanelLayout({ children }: ThreePanelLayoutProps) {
  return (
    <div className="grid grid-cols-[250px_1fr_300px] h-screen w-screen bg-gray-900 text-gray-100">
      <LeftPanel />
      <div className="relative overflow-hidden">
        {children}
      </div>
      <RightPanel />
    </div>
  )
}
