/**
 * Preview Shortcut Hook
 * Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac) opens browser preview
 */

import { useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import toast from 'react-hot-toast'
import { useStore } from '../store'
import {
  previewHTMLExport,
  previewMultiWindowExport,
} from '../services/export'
import type { ElementConfig } from '../types/elements'

export function usePreviewShortcut(enabled = true) {
  const allElements = useStore((state) => state.elements)
  const windows = useStore((state) => state.windows)
  const activeWindow = useStore((state) => state.getActiveWindow())
  const getLayersInOrder = useStore((state) => state.getLayersInOrder)

  // Helper to get all elements including children (for containers)
  const getElementsWithChildren = useCallback((windowElementIds: string[]): ElementConfig[] => {
    const result: ElementConfig[] = []
    const seen = new Set<string>()

    const addWithChildren = (id: string) => {
      if (seen.has(id)) return
      seen.add(id)

      const el = allElements.find(e => e.id === id)
      if (!el) return

      result.push(el)

      // If container, recursively add children via parentId relationship
      const children = allElements.filter(child => child.parentId === id)
      for (const child of children) {
        addWithChildren(child.id)
      }
    }

    for (const id of windowElementIds) {
      addWithChildren(id)
    }

    return result
  }, [allElements])

  // Helper to sort elements by layer order
  const sortElementsByLayerOrder = useCallback((elements: ElementConfig[]): ElementConfig[] => {
    const orderedLayers = getLayersInOrder()
    const layerOrderMap = new Map(orderedLayers.map((layer, index) => [layer.id, index]))

    return [...elements].sort((a, b) => {
      const layerA = a.layerId || 'default'
      const layerB = b.layerId || 'default'
      const orderA = layerOrderMap.get(layerA) ?? 0
      const orderB = layerOrderMap.get(layerB) ?? 0

      if (orderA !== orderB) {
        return orderA - orderB
      }

      return (a.zIndex || 0) - (b.zIndex || 0)
    })
  }, [getLayersInOrder])

  const openPreview = useCallback(async () => {
    if (!activeWindow) {
      toast.error('No active window to preview')
      return
    }

    const hasMultipleWindows = windows.length > 1

    toast.loading('Opening preview...', { id: 'preview' })

    const result = hasMultipleWindows
      ? await previewMultiWindowExport({
          windows: windows.map(w => ({
            id: w.id,
            name: w.name,
            elements: sortElementsByLayerOrder(getElementsWithChildren(w.elementIds)),
            width: w.width,
            height: w.height,
            backgroundColor: w.backgroundColor,
          })),
          activeWindowId: activeWindow.id,
          enableResponsiveScaling: true,
        })
      : await previewHTMLExport({
          elements: sortElementsByLayerOrder(getElementsWithChildren(activeWindow.elementIds)),
          canvasWidth: activeWindow.width,
          canvasHeight: activeWindow.height,
          backgroundColor: activeWindow.backgroundColor,
          enableResponsiveScaling: true,
        })

    if (result.success) {
      toast.success('Preview opened', { id: 'preview' })
    } else {
      const errorMessage = result.error || 'Preview failed'
      const hint = errorMessage.includes('Popup blocked')
        ? ' Enable popups for this site.'
        : ''
      toast.error(errorMessage + hint, { id: 'preview' })
    }
  }, [activeWindow, windows, sortElementsByLayerOrder, getElementsWithChildren])

  // Keyboard shortcut: Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac)
  useHotkeys(
    'ctrl+shift+p, meta+shift+p',
    (e) => {
      e.preventDefault()
      openPreview()
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
      enabled,
    },
    [openPreview, enabled]
  )

  return { openPreview }
}
