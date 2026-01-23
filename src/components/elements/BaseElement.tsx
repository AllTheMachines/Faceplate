import React from 'react'
import { ElementConfig } from '../../types/elements'

interface BaseElementProps {
  element: ElementConfig
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
}

export function BaseElement({ element, children, onClick }: BaseElementProps) {
  const style = React.useMemo(
    () => ({
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      zIndex: element.zIndex,
      visibility: element.visible ? ('visible' as const) : ('hidden' as const),
      pointerEvents: element.locked ? ('none' as const) : ('auto' as const),
      cursor: element.locked ? 'default' : 'pointer',
      userSelect: 'none' as const,
    }),
    [
      element.x,
      element.y,
      element.width,
      element.height,
      element.rotation,
      element.zIndex,
      element.visible,
      element.locked,
    ]
  )

  return (
    <div data-element-id={element.id} style={style} onClick={onClick}>
      {children}
    </div>
  )
}
