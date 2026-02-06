
// Basic Design Tokens for the button
// These map to CSS custom properties
export const buttonTokens = {
  '--btn-bg': '#3b82f6',
  '--btn-text': '#ffffff',
  '--btn-radius': '0.5rem',
  '--btn-padding': '0.75rem 1.5rem',
  '--btn-font-size': '1rem',
  '--btn-font-weight': '600',
  '--btn-hover-opacity': '0.9',
} as const;

export type ButtonTokens = typeof buttonTokens;
