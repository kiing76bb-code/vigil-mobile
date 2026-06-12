/**
 * Vigil design tokens — the single source of truth for all visual values.
 * Reference THEME everywhere. Zero inline colors anywhere else in the app.
 */

export const THEME = {
  colors: {
    background: '#0B0F19', // Deep Obsidian Blue — primary background
    surface: '#06060F',    // Deeper black — card backgrounds
    green: '#00E676',      // Vigil Kinetic Green — CTAs, target hits, savings
    cyan: '#00B0FF',       // Electric Cyan — radar pulse, watching status
    yellow: '#FFD600',     // Alert Yellow — price drop warning badges
    white: '#F0EEF8',      // Off-white — primary text
    muted: '#4A4E5A',      // Muted gray — secondary text, disabled
    border: '#1A1F2E',     // Subtle border — card edges
  },
  font: {
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 17,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  animation: {
    tabFadeMs: 100,        // tab switch opacity fade
    barcodePopMs: 150,     // scale pop + haptic on scan
    targetBurstMs: 250,    // radial particle burst (spring)
    savingsRollMs: 600,    // rolling counter duration
    dohertyBudgetMs: 400,  // every interaction resolves visually within this
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    pill: 999,
  },
} as const;

export type Theme = typeof THEME;
