import { StateCreator } from 'zustand'
import { Asset } from '../types/asset'

export interface AssetsSlice {
  // State
  assets: Asset[]
  customCategories: string[]  // User-added categories beyond defaults

  // Actions
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void
  removeAsset: (id: string) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  setAssets: (assets: Asset[]) => void  // Replace all assets (for project load)
  getAsset: (id: string) => Asset | undefined
  getAssetsByCategory: (category: string) => Asset[]
  addCustomCategory: (category: string) => void
  removeCustomCategory: (category: string) => void
}

export const createAssetsSlice: StateCreator<AssetsSlice, [], [], AssetsSlice> = (
  set,
  get
) => ({
  // Default state
  assets: [],
  customCategories: [],

  // Actions
  addAsset: (assetData) =>
    set((state) => ({
      assets: [
        ...state.assets,
        {
          ...assetData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        },
      ],
    })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== id),
    })),

  updateAsset: (id, updates) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === id ? { ...asset, ...updates } : asset
      ),
    })),

  setAssets: (assets) =>
    set(() => ({
      assets,
    })),

  // Selector helper
  getAsset: (id) => {
    return get().assets.find((asset) => asset.id === id)
  },

  getAssetsByCategory: (category) => {
    return get().assets.filter((asset) => asset.categories.includes(category))
  },

  addCustomCategory: (category) =>
    set((state) => ({
      customCategories: state.customCategories.includes(category)
        ? state.customCategories
        : [...state.customCategories, category],
    })),

  removeCustomCategory: (category) =>
    set((state) => ({
      customCategories: state.customCategories.filter((cat) => cat !== category),
    })),
})
