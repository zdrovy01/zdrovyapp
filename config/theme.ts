// Semantic color tokens. Values are CSS custom properties defined in
// globals.css, so switching `data-theme` on <html> re-skins the whole app
// (see config/appearance.ts). Each var has a dark-theme fallback so colors
// stay correct even before the stylesheet loads.

export const COLORS = {
  /** Primary brand / accent color */
  accent: "var(--c-accent, #F8FD03)",
  /** Text/icon color placed ON TOP of the accent color */
  onAccent: "var(--c-on-accent, #000000)",

  /** Page background */
  background: "var(--c-background, #000000)",
  /** Cards / containers */
  surface: "var(--c-surface, #0A0A0A)",
  /** Slightly raised surface (hairline-filled cards) */
  surfaceElevated: "var(--c-surface-2, rgba(255,255,255,0.04))",
  /** Subtle filled controls (inputs, chips) */
  fill: "var(--c-fill, rgba(118,118,128,0.24))",
  /** Selected segment in a segmented control */
  segActive: "var(--c-seg-active, rgba(120,120,128,0.5))",
  /** Progress-bar / ring track */
  track: "var(--c-track, #2A2A2A)",

  /** Text */
  text: "var(--c-text, #F5F5F5)",
  textSecondary: "var(--c-text-2, rgba(235,235,245,0.6))",
  textTertiary: "var(--c-text-3, rgba(235,235,245,0.4))",

  /** Hairline separators / thin borders */
  hairline: "var(--c-hairline, rgba(255,255,255,0.08))",
  hairlineStrong: "var(--c-hairline-2, rgba(255,255,255,0.15))",

  /** Status */
  danger: "var(--c-danger, #FF453A)",

  /** Modal / backdrop overlay */
  overlay: "var(--c-overlay, rgba(0,0,0,0.5))",
};
