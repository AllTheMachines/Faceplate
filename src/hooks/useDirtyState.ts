import { useStore } from '../store'

export function useDirtyState() {
  // Call isDirty() inside selector to get reactive value
  const isDirty = useStore((state) => state.isDirty())
  const lastSavedTimestamp = useStore((state) => state.lastSavedTimestamp)

  return {
    isDirty,
    lastSavedTimestamp,
  }
}
