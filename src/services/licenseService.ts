/**
 * License Service - Polar.sh Integration
 *
 * Validates license keys against Polar.sh API.
 * Uses the public customer portal endpoint (no auth required).
 */

import type { LicenseData } from '../store/licenseSlice'

// Polar.sh configuration
const POLAR_API_URL = 'https://api.polar.sh/v1/customer-portal/license-keys/validate'
const ORGANIZATION_ID = 'f32fbf3a-aa2f-4eaa-858d-5fe29303e096'

export interface PolarValidationResponse {
  id: string
  organization_id: string
  customer_id: string
  customer: {
    id: string
    email: string
    name: string | null
  }
  key: string
  display_key: string
  status: 'granted' | 'revoked' | 'disabled'
  usage: number
  limit_usage: number | null
  validations: number
  limit_activations: number | null
  last_validated_at: string
  expires_at: string | null
  created_at: string
  modified_at: string | null
}

export interface ValidationResult {
  success: boolean
  license?: LicenseData
  error?: string
  status?: 'valid' | 'expired' | 'revoked' | 'invalid'
}

/**
 * Validate a license key against Polar.sh API
 */
export async function validateLicenseKey(key: string): Promise<ValidationResult> {
  try {
    const response = await fetch(POLAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: key.trim(),
        organization_id: ORGANIZATION_ID,
      }),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'License key not found',
          status: 'invalid',
        }
      }

      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.detail || `Validation failed (${response.status})`,
        status: 'invalid',
      }
    }

    const data: PolarValidationResponse = await response.json()

    // Check status
    if (data.status === 'revoked') {
      return {
        success: false,
        error: 'License key has been revoked',
        status: 'revoked',
      }
    }

    if (data.status === 'disabled') {
      return {
        success: false,
        error: 'License key has been disabled',
        status: 'invalid',
      }
    }

    // Check expiration
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at).getTime()
      if (expiresAt < Date.now()) {
        return {
          success: false,
          error: 'License key has expired',
          status: 'expired',
        }
      }
    }

    // Valid license
    const license: LicenseData = {
      key: data.key,
      email: data.customer?.email || '',
      validUntil: data.expires_at
        ? new Date(data.expires_at).getTime()
        : Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year if no expiration
    }

    return {
      success: true,
      license,
      status: 'valid',
    }
  } catch (error) {
    // Network error - could be offline
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        status: 'invalid',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'invalid',
    }
  }
}

/**
 * Check if a cached license needs revalidation (7-day cache)
 */
export function needsRevalidation(lastValidation: number | null): boolean {
  if (!lastValidation) return true
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
  return Date.now() - lastValidation > SEVEN_DAYS
}
