/**
 * Font Configuration System
 *
 * BACKUP: Original fonts are Outfit (sans) + Fraunces (display)
 * To restore: set FONT_PRESET to 'classic'
 *
 * Font Presets:
 *
 * 1. FOUNDER - Clean Modern Pro (LOCAL FONT)
 *    - Satoshi for everything (Black for titles, Regular for body)
 *    - Modern, professional, avec du caractère
 *
 * 2. TITAN - Maximum Impact, Industrial Strength
 *    - Display: Bebas Neue (condensed, aggressive, action)
 *    - Sans: Barlow (industrial, German engineering vibes)
 *
 * 3. DISRUPTOR - Tech Forward, Startup Energy
 *    - Display: Syne (geometric, unique, memorable)
 *    - Sans: Manrope (modern, excellent readability)
 *
 * 4. EMPIRE - Bold Premium, Confidence
 *    - Display: Unbounded (futuristic, confident)
 *    - Sans: Plus Jakarta Sans (premium, professional)
 *
 * 5. CLASSIC - Original fonts (backup)
 *    - Display: Fraunces (soft serif)
 *    - Sans: Outfit (clean geometric)
 */

export type FontPreset = 'founder' | 'titan' | 'disruptor' | 'empire' | 'classic'

// ============================================
// CHANGE THIS TO SWITCH FONT PRESETS
// ============================================
export const FONT_PRESET: FontPreset = 'classic'

export const fontPresets = {
  founder: {
    name: 'Founder',
    description: 'Clean Modern Pro - Satoshi pour tout',
    isLocal: true, // Uses local @font-face, not Google Fonts
    display: {
      name: 'Satoshi',
      weights: [400, 500, 700, 900],
    },
    sans: {
      name: 'Satoshi',
      weights: [400, 500, 700, 900],
    },
  },
  titan: {
    name: 'Titan',
    description: 'Maximum Impact - Pour ceux qui veulent dominer',
    isLocal: false,
    display: {
      name: 'Bebas Neue',
      className: 'bebas-neue',
      weights: [400],
    },
    sans: {
      name: 'Barlow',
      className: 'barlow',
      weights: [400, 500, 600, 700],
    },
  },
  disruptor: {
    name: 'Disruptor',
    description: 'Tech Forward - Pour les innovateurs',
    isLocal: false,
    display: {
      name: 'Syne',
      className: 'syne',
      weights: [400, 500, 600, 700, 800],
    },
    sans: {
      name: 'Manrope',
      className: 'manrope',
      weights: [400, 500, 600, 700],
    },
  },
  empire: {
    name: 'Empire',
    description: 'Bold Premium - Pour bâtir un empire',
    isLocal: false,
    display: {
      name: 'Unbounded',
      className: 'unbounded',
      weights: [400, 500, 600, 700, 800, 900],
    },
    sans: {
      name: 'Plus Jakarta Sans',
      className: 'plus-jakarta-sans',
      weights: [400, 500, 600, 700],
    },
  },
  classic: {
    name: 'Classic',
    description: 'Original - Élégant et raffiné',
    isLocal: false,
    display: {
      name: 'Fraunces',
      className: 'fraunces',
      weights: [400, 500, 600, 700],
      axes: ['SOFT', 'WONK', 'opsz'],
    },
    sans: {
      name: 'Outfit',
      className: 'outfit',
      weights: [400, 500, 600, 700],
    },
  },
} as const

export const currentPreset = fontPresets[FONT_PRESET]
