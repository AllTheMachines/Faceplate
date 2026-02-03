# Requirements: Faceplate v2.0

**Defined:** 2026-02-03
**Core Value:** Visually design a plugin UI and export code that works in JUCE WebView2 without manual fixups.

## v2.0 Requirements

Requirements for Pro Licensing milestone.

### Rebranding

- [ ] **BRAND-01**: All references to 'allthecode' updated to 'AllTheMachines' in codebase
- [ ] **BRAND-02**: All references to 'vst3-webview-ui-designer' updated to 'Faceplate'
- [ ] **BRAND-03**: Package.json name, title, and metadata reflect 'Faceplate' branding
- [ ] **BRAND-04**: Documentation updated with new branding

### Feature Gating System

- [ ] **GATE-01**: Element registry includes `isPro` boolean for each element type
- [ ] **GATE-02**: Pro elements show lock icon overlay in palette when unlicensed
- [ ] **GATE-03**: Pro elements can be dragged to canvas but show "Pro" badge
- [ ] **GATE-04**: Attempting to export project with Pro elements while unlicensed shows upgrade prompt
- [ ] **GATE-05**: /generate-ui command checks license before executing
- [ ] **GATE-06**: /generate-vst command checks license before executing

### Pro Element Classification

- [ ] **PRO-01**: ASCII elements marked as Pro (ASCII Art, ASCII Button, ASCII Slider)
- [ ] **PRO-02**: Advanced meters marked as Pro (RMS, VU, PPM, True Peak, LUFS, K-System, GR, Correlation, Stereo Width)
- [ ] **PRO-03**: All visualizations marked as Pro (12 types)
- [ ] **PRO-04**: All specialized audio elements marked as Pro (13 types)
- [ ] **PRO-05**: Basic Meter element remains Free

### License Validation

- [ ] **LIC-01**: License settings panel with key input field in Settings/Preferences area
- [ ] **LIC-02**: Validate button calls Polar.sh API and shows success/error feedback
- [ ] **LIC-03**: Valid license stored in localStorage with 7-day cache
- [ ] **LIC-04**: License status displayed (Free / Pro / Expired / Revoked)
- [ ] **LIC-05**: Deactivate/Clear license button to reset to Free
- [ ] **LIC-06**: Automatic background revalidation when cache expires
- [ ] **LIC-07**: Graceful offline handling - use cached status when network unavailable

### Zustand Store

- [ ] **STORE-01**: LicenseSlice added to store with isPro, license, validation state
- [ ] **STORE-02**: useLicense hook for components to check Pro status
- [ ] **STORE-03**: License state persists across sessions via localStorage

### Export Blocking

- [ ] **EXP-01**: Export to JUCE checks for Pro elements in project
- [ ] **EXP-02**: If Pro elements found and license is Free, show modal with list of Pro elements
- [ ] **EXP-03**: Modal offers options: Remove Pro Elements / Enter License Key / Cancel
- [ ] **EXP-04**: Preview export works regardless of license (for testing)

### UI/UX

- [ ] **UI-01**: Pro badge/icon consistent across palette, canvas, and property panel
- [ ] **UI-02**: License status indicator in header or settings
- [ ] **UI-03**: Upgrade prompt links to Polar.sh purchase page

## Out of Scope

| Feature | Reason |
|---------|--------|
| Server-side validation | Not needed - repo is private, client-side sufficient |
| Activation/device limits | Browser apps don't have stable device IDs |
| Multiple license tiers | Single Pro tier is sufficient for v2.0 |
| Offline-first design | 7-day cache is sufficient grace period |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRAND-01 | Phase 50 | Pending |
| BRAND-02 | Phase 50 | Pending |
| BRAND-03 | Phase 50 | Pending |
| BRAND-04 | Phase 50 | Pending |
| GATE-01 | Phase 51 | Pending |
| GATE-02 | Phase 51 | Pending |
| GATE-03 | Phase 51 | Pending |
| GATE-04 | Phase 52 | Pending |
| GATE-05 | Phase 52 | Pending |
| GATE-06 | Phase 52 | Pending |
| PRO-01 | Phase 51 | Pending |
| PRO-02 | Phase 51 | Pending |
| PRO-03 | Phase 51 | Pending |
| PRO-04 | Phase 51 | Pending |
| PRO-05 | Phase 51 | Pending |
| LIC-01 | Phase 52 | Pending |
| LIC-02 | Phase 52 | Pending |
| LIC-03 | Phase 52 | Pending |
| LIC-04 | Phase 52 | Pending |
| LIC-05 | Phase 52 | Pending |
| LIC-06 | Phase 52 | Pending |
| LIC-07 | Phase 52 | Pending |
| STORE-01 | Phase 51 | Pending |
| STORE-02 | Phase 51 | Pending |
| STORE-03 | Phase 51 | Pending |
| EXP-01 | Phase 52 | Pending |
| EXP-02 | Phase 52 | Pending |
| EXP-03 | Phase 52 | Pending |
| EXP-04 | Phase 52 | Pending |
| UI-01 | Phase 51 | Pending |
| UI-02 | Phase 52 | Pending |
| UI-03 | Phase 52 | Pending |

**Coverage:**
- v2.0 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after milestone v2.0 definition*
