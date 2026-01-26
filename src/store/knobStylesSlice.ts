import { StateCreator } from 'zustand'
import { KnobStyle } from '../types/knobStyle'

export interface KnobStylesSlice {
  // State
  knobStyles: KnobStyle[]

  // Actions
  addKnobStyle: (style: Omit<KnobStyle, 'id' | 'createdAt'>) => void
  removeKnobStyle: (id: string) => void
  updateKnobStyle: (id: string, updates: Partial<KnobStyle>) => void
  setKnobStyles: (styles: KnobStyle[]) => void  // For project load
  getKnobStyle: (id: string) => KnobStyle | undefined
}

export const createKnobStylesSlice: StateCreator<KnobStylesSlice, [], [], KnobStylesSlice> = (
  set,
  get
) => ({
  // Default state
  knobStyles: [],

  // Actions
  addKnobStyle: (styleData) =>
    set((state) => ({
      knobStyles: [
        ...state.knobStyles,
        {
          ...styleData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        },
      ],
    })),

  removeKnobStyle: (id) =>
    set((state) => ({
      knobStyles: state.knobStyles.filter((style) => style.id !== id),
    })),

  updateKnobStyle: (id, updates) =>
    set((state) => ({
      knobStyles: state.knobStyles.map((style) =>
        style.id === id ? { ...style, ...updates } : style
      ),
    })),

  setKnobStyles: (styles) =>
    set(() => ({
      knobStyles: styles,
    })),

  getKnobStyle: (id) => {
    return get().knobStyles.find((style) => style.id === id)
  },
})
