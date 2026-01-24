import { create } from 'zustand'
import type { Template } from '../types/template'

// Import template JSON files
import effectTemplate from '../../templates/effect-starter.json'
import instrumentTemplate from '../../templates/instrument-starter.json'

interface TemplateStore {
  templates: Template[]
  selectedTemplate: Template | null
  selectTemplate: (template: Template | null) => void
  getTemplatesByCategory: (category: string) => Template[]
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [
    effectTemplate as unknown as Template,
    instrumentTemplate as unknown as Template,
  ],
  
  selectedTemplate: null,
  
  selectTemplate: (template) => set({ selectedTemplate: template }),
  
  getTemplatesByCategory: (category) => {
    return get().templates.filter(t => t.category === category)
  },
}))