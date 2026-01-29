import { StateCreator } from 'zustand'

// Simplified font type for UI consumption
export interface CustomFont {
  family: string          // CSS font-family value
  name: string            // Display name (from fullName or family)
  format: 'ttf' | 'otf' | 'woff' | 'woff2'
  category: 'custom'      // Always 'custom' for user fonts
  weights?: FontWeightInfo[]  // Available weights with actual names
}

export interface FontWeightInfo {
  value: number           // Numeric weight (100-900)
  actualName: string      // Actual weight name from font (e.g., "Light", "Medium")
}

export interface FontsSlice {
  // State
  customFonts: CustomFont[]           // Loaded custom fonts
  fontsDirectoryPath: string | null   // Display path of selected directory
  fontsLoading: boolean               // True during scan/load
  fontsError: string | null           // Last error message
  lastScanTime: number | null         // Timestamp of last successful scan

  // Actions
  setCustomFonts: (fonts: CustomFont[]) => void
  setFontsDirectoryPath: (path: string | null) => void
  setFontsLoading: (loading: boolean) => void
  setFontsError: (error: string | null) => void
  setLastScanTime: (time: number | null) => void
  clearFontsState: () => void
}

export const createFontsSlice: StateCreator<FontsSlice, [], [], FontsSlice> = (set) => ({
  // Initial state
  customFonts: [],
  fontsDirectoryPath: null,
  fontsLoading: false,
  fontsError: null,
  lastScanTime: null,

  // Actions
  setCustomFonts: (fonts) => set({ customFonts: fonts, fontsError: null }),

  setFontsDirectoryPath: (path) => set({ fontsDirectoryPath: path }),

  setFontsLoading: (loading) => set({ fontsLoading: loading }),

  setFontsError: (error) => set({ fontsError: error }),

  setLastScanTime: (time) => set({ lastScanTime: time }),

  clearFontsState: () => set({
    customFonts: [],
    fontsDirectoryPath: null,
    fontsLoading: false,
    fontsError: null,
    lastScanTime: null,
  }),
})
