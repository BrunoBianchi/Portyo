/**
 * Block component types and shared utilities for the new React-based block rendering system.
 * 
 * This replaces the old html-generator.ts → dangerouslySetInnerHTML → DOM scan pattern
 * with proper React components that receive BioBlock data as props.
 */

import type { BioBlock } from '~/contexts/bio.context';

/** Global button design settings from the bio Design page */
export interface GlobalButtonStyle {
    buttonStyle?: string;
    buttonRadius?: string;
    buttonShadow?: string;
    buttonColor?: string;
    buttonTextColor?: string;
}

export interface BlockComponentProps {
    block: BioBlock;
    /** The bio ID for API calls */
    bioId?: string;
    /** Global accent color from the bio theme */
    accentColor?: string;
    /** Whether this is being rendered in the editor preview */
    isPreview?: boolean;
    /** Global button design settings from bio Design page */
    globalButtonStyle?: GlobalButtonStyle;
}

export interface BlockWrapperProps {
    block: BioBlock;
    children: React.ReactNode;
    className?: string;
}

/**
 * Shadow presets matching the html-generator.ts values
 */
export const SHADOW_PRESETS: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
    glow: '0 0 20px rgba(0,0,0,0.15)',
    // Design page presets
    soft: '0 2px 8px rgba(0,0,0,0.08)',
    strong: '0 4px 14px rgba(0,0,0,0.15)',
    hard: '4px 4px 0px rgba(0,0,0,0.2)',
};

/**
 * Entrance animation CSS keyframes → class names for block entrance effects
 */
export const ENTRANCE_ANIMATIONS: Record<string, React.CSSProperties> = {
    'fade-in': { animation: 'fadeIn 0.6s ease-out forwards', opacity: 0 },
    'slide-up': { animation: 'slideUp 0.6s ease-out forwards', opacity: 0, transform: 'translateY(20px)' },
    'slide-down': { animation: 'slideDown 0.6s ease-out forwards', opacity: 0, transform: 'translateY(-20px)' },
    'slide-left': { animation: 'slideLeft 0.6s ease-out forwards', opacity: 0, transform: 'translateX(20px)' },
    'slide-right': { animation: 'slideRight 0.6s ease-out forwards', opacity: 0, transform: 'translateX(-20px)' },
    'zoom-in': { animation: 'zoomIn 0.6s ease-out forwards', opacity: 0, transform: 'scale(0.95)' },
    'zoom-out': { animation: 'zoomOut 0.6s ease-out forwards', opacity: 0, transform: 'scale(1.05)' },
    'flip': { animation: 'flip 0.6s ease-out forwards', opacity: 0, transform: 'perspective(600px) rotateX(15deg)' },
    'bounce': { animation: 'bounce 0.8s ease-out forwards', opacity: 0, transform: 'translateY(20px)' },
};

/**
 * Translate Design page buttonRadius to block-level buttonShape
 */
export const radiusToShape = (radius?: string): string | undefined => {
    if (!radius) return undefined;
    const map: Record<string, string> = {
        'square': 'square',
        'round': 'rounded',
        'rounder': 'rounded',
        'full': 'pill',
    };
    return map[radius];
};

/**
 * Safely escape HTML entities in user-provided text
 */
export const escapeHtml = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Resolve shadow from preset name or custom value
 */
export const resolveShadow = (shadow?: string, shadowColor?: string): string => {
    if (!shadow || shadow === 'none') return 'none';
    const preset = SHADOW_PRESETS[shadow];
    if (preset && shadowColor) {
        return preset.replace(/rgba?\([^)]+\)/g, shadowColor);
    }
    return preset || shadow;
};
