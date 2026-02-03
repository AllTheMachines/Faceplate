/**
 * License Settings Dialog
 *
 * Allows users to enter and validate their Pro license key.
 * Integrates with Polar.sh for license validation.
 */

import { useState } from 'react'
import { useLicense } from '../../hooks/useLicense'
import { validateLicenseKey } from '../../services/licenseService'

interface LicenseSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function LicenseSettings({ isOpen, onClose }: LicenseSettingsProps) {
  const { isPro, license, isValidating, isExpired, setLicense, clearLicense } = useLicense()
  const [licenseKey, setLicenseKey] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleValidate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key')
      return
    }

    setValidating(true)
    setError(null)
    setSuccess(false)

    const result = await validateLicenseKey(licenseKey)

    setValidating(false)

    if (result.success && result.license) {
      setLicense(result.license)
      setSuccess(true)
      setLicenseKey('')
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || 'Validation failed')
    }
  }

  const handleDeactivate = () => {
    clearLicense()
    setLicenseKey('')
    setError(null)
    setSuccess(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !validating) {
      handleValidate()
    }
  }

  if (!isOpen) return null

  // Mask license key for display
  const maskedKey = license?.key
    ? `${license.key.slice(0, 8)}...${license.key.slice(-4)}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">License Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPro
                ? 'bg-violet-600 text-white'
                : isExpired
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}>
              {isPro ? 'Pro' : isExpired ? 'Expired' : 'Free'}
            </div>
            {license?.email && (
              <span className="text-sm text-gray-400">{license.email}</span>
            )}
          </div>

          {isPro ? (
            /* Licensed state */
            <div className="space-y-4">
              <div className="bg-gray-900 rounded p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">License Key:</span>
                  <span className="text-gray-300 font-mono">{maskedKey}</span>
                </div>
                {license?.validUntil && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Valid Until:</span>
                    <span className="text-gray-300">
                      {new Date(license.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDeactivate}
                className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
              >
                Deactivate License
              </button>
            </div>
          ) : (
            /* Unlicensed state */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter License Key
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  disabled={validating}
                />
              </div>

              <button
                onClick={handleValidate}
                disabled={validating || !licenseKey.trim()}
                className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
              >
                {validating ? 'Validating...' : 'Activate License'}
              </button>

              {/* Get license link */}
              <div className="text-center">
                <a
                  href="https://polar.sh/all-the-machines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  Get a Pro License →
                </a>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Success display */}
          {success && (
            <div className="bg-green-900/30 border border-green-700 rounded p-3 text-sm text-green-300">
              License activated successfully!
            </div>
          )}

          {/* Info text */}
          <p className="text-xs text-gray-500">
            A Pro license unlocks 51 specialized elements including professional meters,
            visualizations, curves, and specialized audio controls.
          </p>
        </div>
      </div>
    </div>
  )
}
