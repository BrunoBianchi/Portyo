import React from 'react';

// In a real app, these would come from the Theme Context
const DEFAULT_STYLES = {
  '--btn-bg': '#3b82f6',
  '--btn-text': '#ffffff',
  '--btn-radius': '8px',
  '--btn-padding-sm': '8px 16px',
  '--btn-padding-md': '12px 24px',
  '--btn-padding-lg': '16px 32px',
} as React.CSSProperties;

interface ButtonData {
  text?: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
}

interface ButtonProps {
  data: ButtonData;
  // Tokens could also be passed as props or read from context
  tokens?: typeof DEFAULT_STYLES;
}

export const ButtonBlock: React.FC<ButtonProps> = ({ data, tokens = DEFAULT_STYLES }) => {
    const { 
        text = 'Click Me', 
        url = '#', 
        variant = 'primary', 
        size = 'md',
        isFullWidth = false
    } = data;

    // Construct component-specific styles based on variant
    // In a full implementation, we'd map "variant" to specific tokens
    const style: React.CSSProperties = {
        ...tokens,
        display: isFullWidth ? 'flex' : 'inline-flex',
        width: isFullWidth ? '100%' : 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        textDecoration: 'none',
        cursor: 'pointer',
        border: variant === 'outline' ? '2px solid var(--btn-bg)' : 'none',
        backgroundColor: variant === 'outline' || variant === 'ghost' ? 'transparent' : 'var(--btn-bg)',
        color: variant === 'outline' ? 'var(--btn-bg)' : (variant === 'ghost' ? '#333' : 'var(--btn-text)'),
        padding: `var(--btn-padding-${size})`,
        borderRadius: 'var(--btn-radius)',
        fontSize: size === 'lg' ? '1.25rem' : (size === 'sm' ? '0.875rem' : '1rem'),
        fontWeight: 600,
        transition: 'all 0.2s ease',
    };

    return (
        <a href={url} style={style} className="unified-button">
            {text}
        </a>
    );
};
