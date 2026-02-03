/**
 * License Hook
 *
 * Provides access to license state from any component.
 * Returns isPro boolean and license management functions.
 */

import { useStore } from '../store'

export function useLicense() {
  const isPro = useStore((state) => state.isPro)
  const validationState = useStore((state) => state.validationState)
  const license = useStore((state) => state.license)
  const setLicense = useStore((state) => state.setLicense)
  const clearLicense = useStore((state) => state.clearLicense)

  return {
    isPro,
    isValidating: validationState === 'validating',
    isExpired: validationState === 'expired',
    license,
    setLicense,
    clearLicense,
  }
}
