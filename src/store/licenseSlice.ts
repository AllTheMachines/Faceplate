/**
 * License State Management
 *
 * Manages Pro license state with localStorage persistence.
 * License data includes key, email, and expiration timestamp.
 * Validation state tracks whether license has been verified.
 *
 * localStorage key: 'faceplate-license'
 * Cache duration: 7 days before requiring revalidation
 */

import { StateCreator } from 'zustand'

export interface LicenseData {
  key: string
  email: string
  validUntil: number // Unix timestamp ms
}

export interface LicenseSlice {
  // License state
  isPro: boolean
  license: LicenseData | null
  validationState: 'unchecked' | 'validating' | 'valid' | 'invalid' | 'expired'
  lastValidation: number | null

  // Actions
  setLicense: (license: LicenseData | null) => void
  setValidationState: (state: LicenseSlice['validationState']) => void
  clearLicense: () => void
}

export const createLicenseSlice: StateCreator<LicenseSlice, [], [], LicenseSlice> = (set) => ({
  isPro: false,
  license: null,
  validationState: 'unchecked',
  lastValidation: null,

  setLicense: (license) => {
    // Persist to localStorage
    if (license) {
      localStorage.setItem('faceplate-license', JSON.stringify({
        license,
        lastValidation: Date.now(),
      }))
    } else {
      localStorage.removeItem('faceplate-license')
    }

    set({
      license,
      isPro: !!license,
      validationState: license ? 'valid' : 'invalid',
      lastValidation: license ? Date.now() : null,
    })
  },

  setValidationState: (validationState) => set({ validationState }),

  clearLicense: () => {
    localStorage.removeItem('faceplate-license')
    set({
      license: null,
      isPro: false,
      validationState: 'unchecked',
      lastValidation: null,
    })
  },
})

/**
 * Initialize license state from localStorage on app load
 * Checks for 7-day cache expiry and returns partial state to merge
 */
export function initializeLicenseFromStorage(): Partial<LicenseSlice> {
  try {
    const stored = localStorage.getItem('faceplate-license')
    if (!stored) return {}

    const { license, lastValidation } = JSON.parse(stored)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
    const isExpired = !lastValidation || (Date.now() - lastValidation) > SEVEN_DAYS

    return {
      license: isExpired ? null : license,
      isPro: !isExpired && !!license,
      validationState: isExpired ? 'expired' : (license ? 'valid' : 'unchecked'),
      lastValidation: isExpired ? null : lastValidation,
    }
  } catch {
    return {}
  }
}
