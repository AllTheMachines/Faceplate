# Polar.sh License Key Validation Integration Research

**Researched:** 2026-02-03
**Confidence:** HIGH (based on official Polar.sh documentation)
**Context:** Client-side license validation for Faceplate Pro features

---

## Executive Summary

Polar.sh provides a **client-side-safe** license validation API that can be called directly from browser applications without authentication. The `/customer-portal/license-keys/validate` endpoint is explicitly designed for public clients (desktop apps, mobile apps, and by extension, browser SPAs).

**Key Finding:** No backend required for basic license validation. The endpoint is unauthenticated and CORS-enabled for client-side use.

---

## 1. API Endpoint for License Validation

### Endpoint
```
POST https://api.polar.sh/v1/customer-portal/license-keys/validate
```

### Authentication
**None required.** This endpoint is explicitly designed for public clients:

> "This endpoint doesn't require authentication and can be safely used on a public client, like a desktop application or a mobile app."
> - [Polar.sh Official Documentation](https://polar.sh/docs/api-reference/customer-portal/license-keys/validate)

### Environments
| Environment | Base URL |
|-------------|----------|
| Production | `https://api.polar.sh/v1` |
| Sandbox | `https://sandbox-api.polar.sh/v1` |

---

## 2. Request Format

### Required Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | string | The license key to validate |
| `organization_id` | UUID | Your Polar.sh organization ID |

### Optional Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `activation_id` | UUID | Specific activation to validate against |
| `benefit_id` | UUID | Filter by specific benefit |
| `customer_id` | UUID | Filter by specific customer |
| `increment_usage` | integer | Increment usage counter |
| `conditions` | object | Key-value validation conditions (max 50 pairs) |

### Example Request
```typescript
const response = await fetch('https://api.polar.sh/v1/customer-portal/license-keys/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    key: 'FACEPLATE-2CA57A34-E191-4290-A394-XXXXXX',
    organization_id: 'your-org-uuid-here',
  }),
});
```

---

## 3. Response Format

### Success Response (200)

```typescript
interface ValidatedLicenseKey {
  id: string;                    // UUID
  created_at: string;            // ISO datetime
  modified_at: string | null;    // ISO datetime
  organization_id: string;       // UUID
  customer_id: string;           // UUID
  customer: {
    id: string;
    email: string;
    name: string | null;
    // ... other customer fields
  };
  benefit_id: string;            // UUID
  key: string;                   // Full license key
  display_key: string;           // Masked key (e.g., "****-E304DA")
  status: 'granted' | 'revoked' | 'disabled';
  limit_activations: number | null;
  usage: number;
  limit_usage: number | null;
  validations: number;           // Total validation count
  last_validated_at: string;     // ISO datetime
  expires_at: string | null;     // ISO datetime (null = never expires)
  activation: {                  // Present if activation_id provided
    id: string;
    label: string;
    meta: object;
    created_at: string;
  } | null;
}
```

### Status Values
| Status | Meaning | Action |
|--------|---------|--------|
| `granted` | License is active and valid | Unlock Pro features |
| `revoked` | License has been revoked (subscription cancelled) | Lock Pro features |
| `disabled` | License has been disabled by admin | Lock Pro features |

### Error Responses

**404 - License Not Found**
```json
{
  "type": "ResourceNotFound",
  "detail": "License key not found"
}
```

**422 - Validation Error**
```json
{
  "type": "HTTPValidationError",
  "detail": [
    {
      "loc": ["body", "organization_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 4. Rate Limits

| Type | Limit |
|------|-------|
| Unauthenticated validation | **3 requests per second** |
| Authenticated API calls | 300 requests per minute |

When rate limited, you'll receive:
- HTTP 429 Too Many Requests
- `Retry-After` header indicating wait time

**Implication for Faceplate:** Do NOT validate on every action. Validate once per session with caching.

---

## 5. License Key Format

Polar.sh license keys use a **brandable prefix** format:

```
PREFIX-UUID4
```

Examples:
- `POLAR-2CA57A34-E191-4290-A394-XXXXXX`
- `FACEPLATE-1C285B2D-6CE6-4BC7-B8BE-ADB6A7E304DA`
- `MYAPP-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

The prefix is configurable when creating the license key benefit in Polar.sh dashboard.

---

## 6. Client-Side vs Server-Side Considerations

### Client-Side (Recommended for Faceplate)

**Pros:**
- No backend infrastructure required
- Direct API access from browser
- Simpler architecture
- Lower latency

**Cons:**
- License key visible in browser (but keys aren't secret anyway)
- Validation can be bypassed by determined users (acceptable for UI tools)

**Security Note:** For a UI designer tool, client-side validation is appropriate. The "worst case" is someone unlocks Pro features without paying - they can't steal data or harm others. This differs from server-side software where validation must be trusted.

### Server-Side (Not Required)

Use the `/v1/license-keys/validate` endpoint (authenticated) if you need:
- Server-side gating of features
- Trusted validation for security-critical features
- Webhook integration for license events

---

## 7. Implementation Recommendations

### Basic Validation Flow

```typescript
// src/services/licenseService.ts

const POLAR_ORG_ID = 'your-organization-uuid';  // From Polar dashboard
const STORAGE_KEY = 'faceplate_license';

interface StoredLicense {
  key: string;
  validatedAt: number;  // timestamp
  status: 'granted' | 'revoked' | 'disabled';
  expiresAt: string | null;
  customerId: string;
  tier?: string;  // If using multiple tiers
}

export async function validateLicenseKey(key: string): Promise<StoredLicense | null> {
  try {
    const response = await fetch(
      'https://api.polar.sh/v1/customer-portal/license-keys/validate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: key.trim(),
          organization_id: POLAR_ORG_ID,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;  // Invalid key
      }
      throw new Error(`Validation failed: ${response.status}`);
    }

    const data = await response.json();

    const license: StoredLicense = {
      key: data.display_key,  // Store masked version
      validatedAt: Date.now(),
      status: data.status,
      expiresAt: data.expires_at,
      customerId: data.customer_id,
    };

    // Cache in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));

    return license;
  } catch (error) {
    console.error('License validation error:', error);
    throw error;
  }
}

export function isProLicenseValid(): boolean {
  const cached = getCachedLicense();
  if (!cached) return false;

  // Check status
  if (cached.status !== 'granted') return false;

  // Check expiration
  if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
    return false;
  }

  return true;
}

export function getCachedLicense(): StoredLicense | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearLicense(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

### Validation Timing Strategy

```typescript
const REVALIDATION_INTERVAL = 7 * 24 * 60 * 60 * 1000;  // 7 days in ms

export function shouldRevalidate(): boolean {
  const cached = getCachedLicense();
  if (!cached) return true;

  const timeSinceValidation = Date.now() - cached.validatedAt;
  return timeSinceValidation > REVALIDATION_INTERVAL;
}

export async function initializeLicense(): Promise<void> {
  const cached = getCachedLicense();

  if (!cached) return;  // No license stored

  // Revalidate if stale (but don't block UI)
  if (shouldRevalidate()) {
    try {
      // Full key needed for revalidation - would need to store securely
      // For Faceplate, we might just prompt user to re-enter if validation fails
      await validateLicenseKey(cached.key);
    } catch (error) {
      // Network error - use cached status (graceful degradation)
      console.warn('Could not revalidate license, using cached status');
    }
  }
}
```

### React Hook

```typescript
// src/hooks/useLicense.ts
import { useState, useEffect, useCallback } from 'react';
import {
  validateLicenseKey,
  isProLicenseValid,
  getCachedLicense,
  clearLicense,
  type StoredLicense
} from '../services/licenseService';

interface UseLicenseResult {
  isPro: boolean;
  license: StoredLicense | null;
  isValidating: boolean;
  error: string | null;
  validate: (key: string) => Promise<boolean>;
  deactivate: () => void;
}

export function useLicense(): UseLicenseResult {
  const [license, setLicense] = useState<StoredLicense | null>(getCachedLicense());
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = license?.status === 'granted' &&
    (!license.expiresAt || new Date(license.expiresAt) > new Date());

  const validate = useCallback(async (key: string): Promise<boolean> => {
    setIsValidating(true);
    setError(null);

    try {
      const result = await validateLicenseKey(key);

      if (!result) {
        setError('Invalid license key');
        return false;
      }

      if (result.status !== 'granted') {
        setError(`License is ${result.status}`);
        setLicense(result);
        return false;
      }

      setLicense(result);
      return true;
    } catch (err) {
      setError('Could not validate license. Please check your connection.');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const deactivate = useCallback(() => {
    clearLicense();
    setLicense(null);
    setError(null);
  }, []);

  return {
    isPro,
    license,
    isValidating,
    error,
    validate,
    deactivate,
  };
}
```

---

## 8. Caching & Offline Handling

### Recommended Strategy for Faceplate

1. **Validate on first entry** - When user enters key, validate immediately
2. **Cache validation result** - Store in localStorage with timestamp
3. **Trust cache for 7 days** - Don't re-validate on every session
4. **Graceful offline degradation** - If network fails, use cached status
5. **Background revalidation** - When cache is stale, revalidate in background

### What to Store

```typescript
interface LicenseCache {
  // Masked key for display (don't store full key)
  displayKey: string;

  // Full key for revalidation (or require re-entry)
  // For browser app, localStorage isn't secure anyway
  fullKey: string;

  // Validation result
  status: 'granted' | 'revoked' | 'disabled';

  // Timestamps
  validatedAt: number;
  expiresAt: string | null;

  // Optional metadata
  customerId: string;
  customerEmail?: string;
}
```

### Offline Behavior

```typescript
export async function checkLicenseWithFallback(): Promise<boolean> {
  const cached = getCachedLicense();

  // No cached license = not Pro
  if (!cached) return false;

  // Check if already expired
  if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
    return false;
  }

  // If cache is fresh, trust it
  if (!shouldRevalidate()) {
    return cached.status === 'granted';
  }

  // Try to revalidate
  try {
    const result = await validateLicenseKey(cached.fullKey);
    return result?.status === 'granted';
  } catch (error) {
    // Network error - use cached status (offline tolerance)
    console.warn('Offline mode - using cached license status');
    return cached.status === 'granted';
  }
}
```

---

## 9. Security Considerations

### Client-Side Realities

For a browser-based UI tool, accept these truths:

1. **License keys are not secrets** - Anyone with a valid key can share it
2. **Client-side validation can be bypassed** - Determined users can modify JS
3. **This is acceptable** - UI tools don't handle sensitive data

### Mitigations

| Risk | Mitigation |
|------|------------|
| Key sharing | Polar.sh supports activation limits (e.g., 3 devices) |
| JS tampering | Accept it - the economics don't justify more protection |
| Stale validation | Periodic revalidation (weekly) |
| Key exposure in storage | Use masked `display_key` for UI, full key only for validation |

### What NOT to Do

- Don't obfuscate the validation code (waste of time)
- Don't try to detect DevTools (annoying and bypassable)
- Don't block basic functionality (creates frustration)

### Better Approach

- Focus on making Pro features genuinely valuable
- Make purchasing easy and affordable
- Trust that most users will pay for good software

---

## 10. Finding Your Organization ID

Your Polar.sh organization ID is required for all validation calls.

### Where to Find It

1. Go to [Polar.sh Dashboard](https://polar.sh/dashboard)
2. Navigate to **Settings > General**
3. Your organization ID is displayed, or you can:
   - Use the API: `GET https://api.polar.sh/v1/organizations/{slug}`
   - Copy from URL: `https://polar.sh/dashboard/{org_slug}/...`

### Store It Safely

```typescript
// src/config/polar.ts
export const POLAR_CONFIG = {
  organizationId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  // Use sandbox for development
  baseUrl: import.meta.env.DEV
    ? 'https://sandbox-api.polar.sh/v1'
    : 'https://api.polar.sh/v1',
};
```

---

## 11. TypeScript SDK Option

Polar provides an official TypeScript SDK that can simplify integration.

### Installation

```bash
npm install @polar-sh/sdk
```

### Usage

```typescript
import { Polar } from '@polar-sh/sdk';

// For client-side validation, no access token needed
const polar = new Polar();

const result = await polar.customerPortal.licenseKeys.validate({
  key: 'FACEPLATE-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
  organizationId: 'your-org-uuid',
});

if (result.status === 'granted') {
  // Unlock Pro features
}
```

### Standalone Functions (Tree-Shaking)

For smaller bundle size:

```typescript
import { PolarCore } from '@polar-sh/sdk/core.js';
import { customerPortalLicenseKeysValidate } from '@polar-sh/sdk/funcs/customerPortalLicenseKeysValidate.js';

const polar = new PolarCore();

const res = await customerPortalLicenseKeysValidate(polar, {
  key: 'FACEPLATE-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
  organizationId: 'your-org-uuid',
});

if (res.ok) {
  console.log(res.value);
}
```

### SDK vs Direct Fetch

| Approach | Pros | Cons |
|----------|------|------|
| SDK | Type safety, tree-shaking, retries | Extra dependency (~50KB) |
| Direct fetch | Zero dependencies, full control | Manual error handling |

**Recommendation for Faceplate:** Direct fetch is sufficient. The validation API is simple enough that the SDK overhead isn't justified.

---

## 12. Activation vs Validation

Polar.sh supports two flows. Understanding the difference:

### Validation Only (Recommended for Faceplate)

- Simple: Just validate the key
- No device tracking
- User can use key on unlimited devices
- Best for: SaaS, browser apps, unlimited seat licenses

### Activation + Validation

- First: Activate key on device (creates activation instance)
- Then: Validate with activation_id
- Limits key to N devices
- User must deactivate to move to new device
- Best for: Desktop apps, per-seat licenses

**For Faceplate:** Use validation only. Browser apps don't have stable device identifiers, and the complexity isn't worth it for a UI design tool.

---

## 13. Implementation Checklist

- [ ] Get organization ID from Polar.sh dashboard
- [ ] Create license key benefit in Polar.sh (set prefix, e.g., "FACEPLATE")
- [ ] Implement validation service (`licenseService.ts`)
- [ ] Add license settings UI (key input, validation status)
- [ ] Create `useLicense` hook for React components
- [ ] Gate Pro features with `isPro` check
- [ ] Add localStorage caching with 7-day revalidation
- [ ] Handle network errors gracefully
- [ ] Test with sandbox environment first
- [ ] Switch to production when ready

---

## Sources

- [Polar.sh License Key Validation API](https://polar.sh/docs/api-reference/customer-portal/license-keys/validate)
- [Polar.sh License Keys Feature Documentation](https://polar.apidocumentation.com/documentation/features/benefits/license-keys)
- [Polar.sh API Overview](https://polar.sh/docs/api-reference/introduction)
- [Polar.sh TypeScript SDK](https://github.com/polarsource/polar-js)
- [Polar.sh SDK NPM Package](https://www.npmjs.com/package/@polar-sh/sdk)
- [Software License Management with Polar.sh (Community Guide)](https://skatkov.com/posts/2025-05-11-software-license-management-for-dummies)
- [Polar.sh Authentication Documentation](https://docs.polar.sh/api/authentication)
