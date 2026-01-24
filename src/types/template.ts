import type { ElementConfig } from './elements'

export interface Template {
  version: string
  name: string
  description: string
  category: 'effect' | 'instrument' | 'utility'
  metadata: {
    canvasWidth: number
    canvasHeight: number
    backgroundColor: string
    created: string
    author: string
    recommendedVST3Repo?: string
  }
  elements: ElementConfig[]
}