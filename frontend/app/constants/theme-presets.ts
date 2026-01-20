// Theme styles interface (enhanced with animations and parallax)
export interface ThemeStyles {
    // Background
    bgType: string;
    bgColor: string;
    bgSecondaryColor: string;
    // Card container
    cardStyle: string;
    cardBackgroundColor: string;
    cardBorderColor: string;
    cardBorderWidth: number;
    cardBorderRadius: number;
    cardShadow: string;
    cardPadding: number;
    cardOpacity: number;
    cardBlur: number;
    // Typography
    usernameColor: string;
    font: string;
    // Layout
    maxWidth: number;
    // Profile
    imageStyle: string;
    // Parallax
    enableParallax: boolean;
    parallaxIntensity: number;
    parallaxDepth: number;
    // Floating Elements
    floatingElements: boolean;
    floatingElementsType: string; // circles, hearts, fire, stars, sparkles, music, leaves, snow, bubbles, confetti, diamonds, petals
    floatingElementsColor: string;
    floatingElementsDensity: number;
    floatingElementsSize: number;
    floatingElementsSpeed: number;
    floatingElementsOpacity: number;
    floatingElementsBlur: number;
    // Advanced
    customFontUrl?: string;
    customFontName?: string;
    buttonStyle?: string;
}

export interface ThemePreset {
    name: string;
    description: string;
    category: string;
    tier: "free" | "standard" | "pro";
    emoji: string;
    features?: string[];
    colors?: string[];
    styles: ThemeStyles;
    sampleBlocks: any[];
}

const sampleBlocks = [
    { id: "heading-1", type: "heading", title: "Welcome", align: "center", fontSize: "2xl", fontWeight: "bold" },
    { id: "text-1", type: "text", body: "Creative professional sharing work and passion.", align: "center" },
    { id: "button-1", type: "button", title: "Portfolio", href: "#", buttonStyle: "solid", buttonShape: "rounded" },
    { id: "socials-1", type: "socials", socials: { instagram: "user", twitter: "user" }, socialsLayout: "row" }
];

// Default values
const noEffects = { enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: false, floatingElementsType: "circles", floatingElementsColor: "#ffffff", floatingElementsDensity: 0, floatingElementsSize: 0, floatingElementsSpeed: 0, floatingElementsOpacity: 0, floatingElementsBlur: 0 };

export const THEME_PRESETS: ThemePreset[] = [
    // ============ ARCHITECTURE ============
    { name: "Blueprint", description: "Technical blueprint with grid lines", category: "architecture", tier: "free", emoji: "📐",
        features: ["Grid Layout", "Monospace", "Technical"], colors: ["#1e3a5f", "#ffffff", "#2d5a7b"],
        styles: { bgType: "blueprint", bgColor: "#1e3a5f", bgSecondaryColor: "#2d5a7b", cardStyle: "solid", cardBackgroundColor: "rgba(255,255,255,0.95)", cardBorderColor: "#1e3a5f", cardBorderWidth: 2, cardBorderRadius: 4, cardShadow: "lg", cardPadding: 32, cardOpacity: 95, cardBlur: 0, usernameColor: "#1e3a5f", font: "JetBrains Mono", maxWidth: 480, imageStyle: "square", ...noEffects }, sampleBlocks },
    { name: "Modern Minimal", description: "Clean white space with precision", category: "architecture", tier: "standard", emoji: "🏢",
        features: ["Clean", "Minimalist", "Professional"], colors: ["#ffffff", "#f5f5f5", "#000000"],
        styles: { bgType: "color", bgColor: "#ffffff", bgSecondaryColor: "#f5f5f5", cardStyle: "none", cardBackgroundColor: "transparent", cardBorderColor: "transparent", cardBorderWidth: 0, cardBorderRadius: 0, cardShadow: "none", cardPadding: 40, cardOpacity: 100, cardBlur: 0, usernameColor: "#000000", font: "Space Grotesk", maxWidth: 560, imageStyle: "circle", ...noEffects }, sampleBlocks },
    { name: "Brutalist", description: "Raw concrete with bold shadows", category: "architecture", tier: "pro", emoji: "🏗️",
        features: ["Bold Shadows", "Concrete", "Raw"], colors: ["#b0a89b", "#1a1a1a", "#f0ebe3"],
        styles: { bgType: "concrete", bgColor: "#b0a89b", bgSecondaryColor: "#8a8278", cardStyle: "solid", cardBackgroundColor: "#f0ebe3", cardBorderColor: "#1a1a1a", cardBorderWidth: 4, cardBorderRadius: 0, cardShadow: "2xl", cardPadding: 36, cardOpacity: 100, cardBlur: 0, usernameColor: "#1a1a1a", font: "Anton", maxWidth: 520, imageStyle: "square", ...noEffects }, sampleBlocks },
    { name: "Art Deco", description: "Elegant golden geometric patterns", category: "architecture", tier: "pro", emoji: "🏛️",
        features: ["Geometric", "Gold", "Luxurious", "Parallax"], colors: ["#1a1a2e", "#d4af37", "#0f0f23"],
        styles: { bgType: "geometric", bgColor: "#1a1a2e", bgSecondaryColor: "#d4af37", cardStyle: "solid", cardBackgroundColor: "#0f0f23", cardBorderColor: "#d4af37", cardBorderWidth: 2, cardBorderRadius: 8, cardShadow: "xl", cardPadding: 40, cardOpacity: 100, cardBlur: 0, usernameColor: "#d4af37", font: "Playfair Display", maxWidth: 500, imageStyle: "circle", enableParallax: true, parallaxIntensity: 30, parallaxDepth: 40, floatingElements: true, floatingElementsType: "diamonds", floatingElementsColor: "#d4af37", floatingElementsDensity: 8, floatingElementsSize: 20, floatingElementsSpeed: 25, floatingElementsOpacity: 0.15, floatingElementsBlur: 1 }, sampleBlocks },
    { name: "Ethereal Motion", description: "Dreamy gradients with smooth particles", category: "art", tier: "pro", emoji: "✨",
        features: ["Mesh Gradient", "Floating Particles", "Custom Font", "Glassmorphism"], colors: ["#a855f7", "#ec4899", "#ffffff"],
        styles: { bgType: "mesh-gradient", bgColor: "#a855f7", bgSecondaryColor: "#ec4899", cardStyle: "frosted", cardBackgroundColor: "rgba(255,255,255,0.1)", cardBorderColor: "rgba(255,255,255,0.2)", cardBorderWidth: 1, cardBorderRadius: 16, cardShadow: "xl", cardPadding: 32, cardOpacity: 10, cardBlur: 20, usernameColor: "#ffffff", font: "Custom", customFontName: "Dancing Script", customFontUrl: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap", buttonStyle: "glass", maxWidth: 500, imageStyle: "circle", enableParallax: true, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "sparkles", floatingElementsColor: "#ffffff", floatingElementsDensity: 40, floatingElementsSize: 30, floatingElementsSpeed: 15, floatingElementsOpacity: 0.4, floatingElementsBlur: 2 }, sampleBlocks },

    // ============ PROGRAMMING ============
    { name: "Dark Terminal", description: "Classic terminal with green text", category: "programming", tier: "free", emoji: "💾",
        features: ["Dark Mode", "Monospace", "Retro"], colors: ["#0d1117", "#39d353", "#21262d"],
        styles: { bgType: "color", bgColor: "#0d1117", bgSecondaryColor: "#161b22", cardStyle: "solid", cardBackgroundColor: "#21262d", cardBorderColor: "#30363d", cardBorderWidth: 1, cardBorderRadius: 6, cardShadow: "md", cardPadding: 24, cardOpacity: 100, cardBlur: 0, usernameColor: "#39d353", font: "JetBrains Mono", maxWidth: 520, imageStyle: "rounded", ...noEffects }, sampleBlocks },
    { name: "VS Code Dark", description: "Popular code editor dark theme", category: "programming", tier: "standard", emoji: "💻",
        features: ["IDE Inspired", "Dark", "Fira Code"], colors: ["#1e1e1e", "#569cd6", "#252526"],
        styles: { bgType: "color", bgColor: "#1e1e1e", bgSecondaryColor: "#252526", cardStyle: "solid", cardBackgroundColor: "#2d2d2d", cardBorderColor: "#3c3c3c", cardBorderWidth: 1, cardBorderRadius: 8, cardShadow: "lg", cardPadding: 28, cardOpacity: 100, cardBlur: 0, usernameColor: "#569cd6", font: "Fira Code", maxWidth: 540, imageStyle: "rounded", ...noEffects }, sampleBlocks },
    { name: "GitHub Light", description: "Clean professional interface", category: "programming", tier: "pro", emoji: "🐙",
        features: ["Light Mode", "Clean", "Professional"], colors: ["#ffffff", "#f6f8fa", "#1f2328"],
        styles: { bgType: "color", bgColor: "#ffffff", bgSecondaryColor: "#f6f8fa", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#d0d7de", cardBorderWidth: 1, cardBorderRadius: 6, cardShadow: "sm", cardPadding: 24, cardOpacity: 100, cardBlur: 0, usernameColor: "#1f2328", font: "Inter", maxWidth: 520, imageStyle: "circle", ...noEffects }, sampleBlocks },
    { name: "Cyberpunk Neon", description: "Futuristic neon with pink & cyan", category: "programming", tier: "pro", emoji: "🌃",
        features: ["Neon Glow", "Cyberpunk", "Animated"], colors: ["#0a0a0f", "#00ffff", "#ff00ff"],
        styles: { bgType: "mesh-gradient", bgColor: "#0a0a0f", bgSecondaryColor: "#ff00ff", cardStyle: "frosted", cardBackgroundColor: "rgba(20,20,35,0.7)", cardBorderColor: "#ff00ff", cardBorderWidth: 1, cardBorderRadius: 12, cardShadow: "xl", cardPadding: 28, cardOpacity: 70, cardBlur: 20, usernameColor: "#00ffff", font: "Orbitron", maxWidth: 500, imageStyle: "circle", enableParallax: true, parallaxIntensity: 40, parallaxDepth: 50, floatingElements: true, floatingElementsType: "sparkles", floatingElementsColor: "#00ffff", floatingElementsDensity: 20, floatingElementsSize: 25, floatingElementsSpeed: 12, floatingElementsOpacity: 0.3, floatingElementsBlur: 2 }, sampleBlocks },

    // ============ ONLYFANS ============
    { name: "Rose Gold", description: "Soft pink elegance with hearts", category: "onlyfans", tier: "standard", emoji: "🌹",
        features: ["Soft Pink", "Hearts", "Elegant"], colors: ["#fdf2f4", "#b76e79", "#fce7eb"],
        styles: { bgType: "gradient", bgColor: "#fdf2f4", bgSecondaryColor: "#fce7eb", cardStyle: "frosted", cardBackgroundColor: "rgba(255,255,255,0.85)", cardBorderColor: "#e8b4bc", cardBorderWidth: 1, cardBorderRadius: 24, cardShadow: "lg", cardPadding: 32, cardOpacity: 85, cardBlur: 15, usernameColor: "#b76e79", font: "Cormorant Garamond", maxWidth: 480, imageStyle: "circle", enableParallax: true, parallaxIntensity: 25, parallaxDepth: 30, floatingElements: true, floatingElementsType: "hearts", floatingElementsColor: "#ff6b9d", floatingElementsDensity: 15, floatingElementsSize: 20, floatingElementsSpeed: 15, floatingElementsOpacity: 0.25, floatingElementsBlur: 1 }, sampleBlocks },
    { name: "Midnight Glam", description: "Black & gold with sparkles", category: "onlyfans", tier: "standard", emoji: "✨",
        features: ["Gold Accents", "Sparkles", "Night Mode"], colors: ["#0a0a0a", "#d4af37", "#1a1a1a"],
        styles: { bgType: "color", bgColor: "#0a0a0a", bgSecondaryColor: "#1a1a1a", cardStyle: "solid", cardBackgroundColor: "#141414", cardBorderColor: "#d4af37", cardBorderWidth: 1, cardBorderRadius: 16, cardShadow: "xl", cardPadding: 32, cardOpacity: 100, cardBlur: 0, usernameColor: "#d4af37", font: "Bodoni Moda", maxWidth: 480, imageStyle: "circle", enableParallax: true, parallaxIntensity: 20, parallaxDepth: 25, floatingElements: true, floatingElementsType: "sparkles", floatingElementsColor: "#d4af37", floatingElementsDensity: 12, floatingElementsSize: 15, floatingElementsSpeed: 18, floatingElementsOpacity: 0.2, floatingElementsBlur: 0 }, sampleBlocks },
    { name: "Neon Nights", description: "Vibrant neon with fire particles", category: "onlyfans", tier: "pro", emoji: "🔥",
        features: ["Neon Pink", "Fire", "Bold"], colors: ["#1a0a2e", "#ff1493", "#2d1b4e"],
        styles: { bgType: "mesh-gradient", bgColor: "#1a0a2e", bgSecondaryColor: "#ff1493", cardStyle: "frosted", cardBackgroundColor: "rgba(45,27,78,0.75)", cardBorderColor: "#ff1493", cardBorderWidth: 2, cardBorderRadius: 20, cardShadow: "2xl", cardPadding: 28, cardOpacity: 75, cardBlur: 20, usernameColor: "#ff1493", font: "Montserrat", maxWidth: 460, imageStyle: "circle", enableParallax: true, parallaxIntensity: 45, parallaxDepth: 55, floatingElements: true, floatingElementsType: "fire", floatingElementsColor: "#ff6b35", floatingElementsDensity: 25, floatingElementsSize: 28, floatingElementsSpeed: 10, floatingElementsOpacity: 0.35, floatingElementsBlur: 3 }, sampleBlocks },
    { name: "Luxury Velvet", description: "Deep purple with diamonds", category: "onlyfans", tier: "pro", emoji: "💎",
        features: ["Velvet Purple", "Diamonds", "Rich"], colors: ["#1a0a20", "#c4b5fd", "#2a1530"],
        styles: { bgType: "gradient", bgColor: "#1a0a20", bgSecondaryColor: "#2d1535", cardStyle: "solid", cardBackgroundColor: "#2a1530", cardBorderColor: "#8b5cf6", cardBorderWidth: 1, cardBorderRadius: 20, cardShadow: "xl", cardPadding: 32, cardOpacity: 100, cardBlur: 0, usernameColor: "#c4b5fd", font: "Marcellus", maxWidth: 480, imageStyle: "circle", enableParallax: true, parallaxIntensity: 30, parallaxDepth: 40, floatingElements: true, floatingElementsType: "diamonds", floatingElementsColor: "#a78bfa", floatingElementsDensity: 12, floatingElementsSize: 22, floatingElementsSpeed: 20, floatingElementsOpacity: 0.25, floatingElementsBlur: 2 }, sampleBlocks },

    // ============ PHOTOGRAPHY ============
    { name: "Gallery White", description: "Minimalist gallery space", category: "photography", tier: "free", emoji: "🖼️",
        features: ["Clean White", "Gallery", "Focus on Content"], colors: ["#fafafa", "#1a1a1a", "#ffffff"],
        styles: { bgType: "color", bgColor: "#fafafa", bgSecondaryColor: "#f5f5f5", cardStyle: "none", cardBackgroundColor: "transparent", cardBorderColor: "transparent", cardBorderWidth: 0, cardBorderRadius: 0, cardShadow: "none", cardPadding: 48, cardOpacity: 100, cardBlur: 0, usernameColor: "#1a1a1a", font: "Libre Franklin", maxWidth: 600, imageStyle: "circle", ...noEffects }, sampleBlocks },
    { name: "Film Noir", description: "Vintage cinematic aesthetic", category: "photography", tier: "standard", emoji: "🎞️",
        features: ["Vintage", "Cinematic", "Noir"], colors: ["#1a1a1a", "#e0e0e0", "#0a0a0a"],
        styles: { bgType: "noise", bgColor: "#1a1a1a", bgSecondaryColor: "#2a2a2a", cardStyle: "solid", cardBackgroundColor: "#0a0a0a", cardBorderColor: "#404040", cardBorderWidth: 1, cardBorderRadius: 4, cardShadow: "lg", cardPadding: 32, cardOpacity: 100, cardBlur: 0, usernameColor: "#e0e0e0", font: "EB Garamond", maxWidth: 520, imageStyle: "rounded", ...noEffects }, sampleBlocks },
    { name: "Polaroid", description: "Nostalgic retro camera vibes", category: "photography", tier: "pro", emoji: "📷",
        features: ["Retro", "Cream", "Nostalgic"], colors: ["#f5f0e6", "#3d3426", "#d4c5a9"],
        styles: { bgType: "color", bgColor: "#f5f0e6", bgSecondaryColor: "#ebe5d8", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#d4c5a9", cardBorderWidth: 0, cardBorderRadius: 4, cardShadow: "xl", cardPadding: 40, cardOpacity: 100, cardBlur: 0, usernameColor: "#3d3426", font: "Courier Prime", maxWidth: 480, imageStyle: "square", ...noEffects }, sampleBlocks },
    { name: "Studio Pro", description: "Professional studio aesthetic", category: "photography", tier: "pro", emoji: "📸",
        features: ["Clean", "Studio", "High-End"], colors: ["#f8f9fa", "#212529", "#e9ecef"],
        styles: { bgType: "color", bgColor: "#f8f9fa", bgSecondaryColor: "#e9ecef", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#dee2e6", cardBorderWidth: 1, cardBorderRadius: 12, cardShadow: "md", cardPadding: 36, cardOpacity: 100, cardBlur: 0, usernameColor: "#212529", font: "DM Sans", maxWidth: 560, imageStyle: "circle", ...noEffects }, sampleBlocks },

    // ============ MUSIC ============
    { name: "Vinyl Records", description: "Warm vintage vinyl aesthetic", category: "music", tier: "free", emoji: "🎵",
        features: ["Vintage", "Warm", "Music"], colors: ["#1a1814", "#c9a959", "#302b25"],
        styles: { bgType: "noise", bgColor: "#1a1814", bgSecondaryColor: "#2a2520", cardStyle: "solid", cardBackgroundColor: "#302b25", cardBorderColor: "#c9a959", cardBorderWidth: 1, cardBorderRadius: 8, cardShadow: "lg", cardPadding: 28, cardOpacity: 100, cardBlur: 0, usernameColor: "#c9a959", font: "Abril Fatface", maxWidth: 480, imageStyle: "circle", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "music", floatingElementsColor: "#c9a959", floatingElementsDensity: 8, floatingElementsSize: 24, floatingElementsSpeed: 18, floatingElementsOpacity: 0.15, floatingElementsBlur: 0 }, sampleBlocks },
    { name: "Spotify Dark", description: "Modern streaming platform style", category: "music", tier: "standard", emoji: "🎧",
        features: ["Modern", "Dark", "Green Accent"], colors: ["#121212", "#1db954", "#282828"],
        styles: { bgType: "gradient", bgColor: "#121212", bgSecondaryColor: "#181818", cardStyle: "solid", cardBackgroundColor: "#282828", cardBorderColor: "#404040", cardBorderWidth: 0, cardBorderRadius: 8, cardShadow: "md", cardPadding: 24, cardOpacity: 100, cardBlur: 0, usernameColor: "#1db954", font: "Outfit", maxWidth: 500, imageStyle: "circle", ...noEffects }, sampleBlocks },
    { name: "Concert Lights", description: "Vibrant stage lighting", category: "music", tier: "pro", emoji: "🎤",
        features: ["Vibrant", "Parallax", "Neon"], colors: ["#0f0c29", "#e879f9", "#302b63"],
        styles: { bgType: "aurora", bgColor: "#0f0c29", bgSecondaryColor: "#e879f9", cardStyle: "frosted", cardBackgroundColor: "rgba(48,43,99,0.65)", cardBorderColor: "#a855f7", cardBorderWidth: 1, cardBorderRadius: 16, cardShadow: "2xl", cardPadding: 32, cardOpacity: 65, cardBlur: 25, usernameColor: "#e879f9", font: "Outfit", maxWidth: 480, imageStyle: "circle", enableParallax: true, parallaxIntensity: 50, parallaxDepth: 60, floatingElements: true, floatingElementsType: "music", floatingElementsColor: "#e879f9", floatingElementsDensity: 30, floatingElementsSize: 30, floatingElementsSpeed: 8, floatingElementsOpacity: 0.4, floatingElementsBlur: 4 }, sampleBlocks },
    { name: "Classical Elegant", description: "Sophisticated classical style", category: "music", tier: "pro", emoji: "🎻",
        features: ["Sophisticated", "Elegant", "Clean"], colors: ["#faf9f6", "#1a1612", "#c4a962"],
        styles: { bgType: "color", bgColor: "#faf9f6", bgSecondaryColor: "#f0ede5", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#c4a962", cardBorderWidth: 1, cardBorderRadius: 4, cardShadow: "sm", cardPadding: 40, cardOpacity: 100, cardBlur: 0, usernameColor: "#1a1612", font: "Crimson Pro", maxWidth: 520, imageStyle: "circle", ...noEffects }, sampleBlocks },

    // ============ FITNESS ============
    { name: "Gym Beast", description: "Dark energetic workout vibes", category: "fitness", tier: "free", emoji: "🏋️",
        features: ["Dark", "Energetic", "Red Accent"], colors: ["#0a0a0a", "#ef4444", "#141414"],
        styles: { bgType: "stripes", bgColor: "#0a0a0a", bgSecondaryColor: "#ef4444", cardStyle: "solid", cardBackgroundColor: "#141414", cardBorderColor: "#ef4444", cardBorderWidth: 2, cardBorderRadius: 8, cardShadow: "lg", cardPadding: 24, cardOpacity: 100, cardBlur: 0, usernameColor: "#ef4444", font: "Black Ops One", maxWidth: 500, imageStyle: "square", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "fire", floatingElementsColor: "#ef4444", floatingElementsDensity: 10, floatingElementsSize: 20, floatingElementsSpeed: 10, floatingElementsOpacity: 0.2, floatingElementsBlur: 1 }, sampleBlocks },
    { name: "Clean Health", description: "Fresh healthy green vibes", category: "fitness", tier: "standard", emoji: "🥗",
        features: ["Fresh", "Green", "Organic"], colors: ["#f0fdf4", "#166534", "#dcfce7"],
        styles: { bgType: "gradient", bgColor: "#f0fdf4", bgSecondaryColor: "#dcfce7", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#86efac", cardBorderWidth: 1, cardBorderRadius: 16, cardShadow: "md", cardPadding: 28, cardOpacity: 100, cardBlur: 0, usernameColor: "#166534", font: "Nunito", maxWidth: 520, imageStyle: "circle", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "leaves", floatingElementsColor: "#22c55e", floatingElementsDensity: 8, floatingElementsSize: 25, floatingElementsSpeed: 20, floatingElementsOpacity: 0.15, floatingElementsBlur: 1 }, sampleBlocks },
    { name: "Athletic Pro", description: "Dynamic sporty gradients", category: "fitness", tier: "pro", emoji: "💪",
        features: ["Dynamic", "Sporty", "Gradient"], colors: ["#1e3a5f", "#0ea5e9", "#f0f9ff"],
        styles: { bgType: "mesh-gradient", bgColor: "#1e3a5f", bgSecondaryColor: "#0ea5e9", cardStyle: "frosted", cardBackgroundColor: "rgba(30,58,95,0.8)", cardBorderColor: "#38bdf8", cardBorderWidth: 1, cardBorderRadius: 12, cardShadow: "xl", cardPadding: 28, cardOpacity: 80, cardBlur: 18, usernameColor: "#f0f9ff", font: "Rajdhani", maxWidth: 500, imageStyle: "circle", enableParallax: true, parallaxIntensity: 35, parallaxDepth: 45, floatingElements: true, floatingElementsType: "circles", floatingElementsColor: "#38bdf8", floatingElementsDensity: 15, floatingElementsSize: 20, floatingElementsSpeed: 12, floatingElementsOpacity: 0.25, floatingElementsBlur: 2 }, sampleBlocks },
    { name: "Yoga Zen", description: "Calm earthy mindfulness", category: "fitness", tier: "pro", emoji: "🧘",
        features: ["Calm", "Earthy", "Minimal"], colors: ["#faf7f4", "#5c4a3a", "#d4c4b0"],
        styles: { bgType: "gradient", bgColor: "#faf7f4", bgSecondaryColor: "#f5efe8", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#d4c4b0", cardBorderWidth: 0, cardBorderRadius: 24, cardShadow: "sm", cardPadding: 36, cardOpacity: 100, cardBlur: 0, usernameColor: "#5c4a3a", font: "Cormorant", maxWidth: 480, imageStyle: "circle", enableParallax: true, parallaxIntensity: 20, parallaxDepth: 25, floatingElements: true, floatingElementsType: "petals", floatingElementsColor: "#d4a574", floatingElementsDensity: 6, floatingElementsSize: 30, floatingElementsSpeed: 30, floatingElementsOpacity: 0.12, floatingElementsBlur: 0 }, sampleBlocks },

    // ============ FASHION ============
    { name: "Runway", description: "Clean editorial fashion", category: "fashion", tier: "free", emoji: "👠",
        features: ["Editorial", "High Fashion", "Clean"], colors: ["#ffffff", "#000000", "#fafafa"],
        styles: { bgType: "color", bgColor: "#ffffff", bgSecondaryColor: "#fafafa", cardStyle: "none", cardBackgroundColor: "transparent", cardBorderColor: "transparent", cardBorderWidth: 0, cardBorderRadius: 0, cardShadow: "none", cardPadding: 48, cardOpacity: 100, cardBlur: 0, usernameColor: "#000000", font: "Playfair Display", maxWidth: 560, imageStyle: "circle", ...noEffects }, sampleBlocks },
    { name: "Streetwear", description: "Urban bold street fashion", category: "fashion", tier: "standard", emoji: "🧢",
        features: ["Bold", "Urban", "Street"], colors: ["#0f0f0f", "#fbbf24", "#ffffff"],
        styles: { bgType: "stripes", bgColor: "#0f0f0f", bgSecondaryColor: "#fbbf24", cardStyle: "solid", cardBackgroundColor: "#171717", cardBorderColor: "#fbbf24", cardBorderWidth: 3, cardBorderRadius: 4, cardShadow: "xl", cardPadding: 24, cardOpacity: 100, cardBlur: 0, usernameColor: "#ffffff", font: "Bebas Neue", maxWidth: 480, imageStyle: "square", ...noEffects }, sampleBlocks },
    { name: "Haute Couture", description: "Luxurious high fashion", category: "fashion", tier: "pro", emoji: "👗",
        features: ["Luxury", "Dark", "Sophisticated"], colors: ["#1a1a1a", "#e5e5e5", "#ffffff"],
        styles: { bgType: "color", bgColor: "#1a1a1a", bgSecondaryColor: "#2a2a2a", cardStyle: "solid", cardBackgroundColor: "#0a0a0a", cardBorderColor: "#e5e5e5", cardBorderWidth: 1, cardBorderRadius: 0, cardShadow: "lg", cardPadding: 40, cardOpacity: 100, cardBlur: 0, usernameColor: "#ffffff", font: "Bodoni Moda", maxWidth: 500, imageStyle: "circle", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "sparkles", floatingElementsColor: "#ffffff", floatingElementsDensity: 8, floatingElementsSize: 12, floatingElementsSpeed: 25, floatingElementsOpacity: 0.1, floatingElementsBlur: 0 }, sampleBlocks },
    { name: "Vintage Vogue", description: "Retro classic magazine style", category: "fashion", tier: "pro", emoji: "🎀",
        features: ["Vintage", "Magazine", "Classic"], colors: ["#fdf8f3", "#5c4033", "#d4a574"],
        styles: { bgType: "color", bgColor: "#fdf8f3", bgSecondaryColor: "#f9f0e7", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#d4a574", cardBorderWidth: 1, cardBorderRadius: 8, cardShadow: "md", cardPadding: 36, cardOpacity: 100, cardBlur: 0, usernameColor: "#5c4033", font: "Cormorant Garamond", maxWidth: 520, imageStyle: "circle", ...noEffects }, sampleBlocks },

    // ============ ART ============
    { name: "Canvas", description: "Neutral minimalist gallery", category: "art", tier: "free", emoji: "🎨",
        features: ["Neutral", "Blank Canvas", "Minimal"], colors: ["#f5f5f0", "#2a2a2a", "#eaeae5"],
        styles: { bgType: "color", bgColor: "#f5f5f0", bgSecondaryColor: "#eaeae5", cardStyle: "none", cardBackgroundColor: "transparent", cardBorderColor: "transparent", cardBorderWidth: 0, cardBorderRadius: 0, cardShadow: "none", cardPadding: 40, cardOpacity: 100, cardBlur: 0, usernameColor: "#2a2a2a", font: "Libre Baskerville", maxWidth: 560, imageStyle: "circle", ...noEffects }, sampleBlocks },
    { name: "Pop Art", description: "Bold vibrant pop colors", category: "art", tier: "standard", emoji: "🌈",
        features: ["Vibrant", "Pop Culture", "Colorful"], colors: ["#fef08a", "#dc2626", "#ff6b6b"],
        styles: { bgType: "polka", bgColor: "#fef08a", bgSecondaryColor: "#ff6b6b", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#1a1a1a", cardBorderWidth: 4, cardBorderRadius: 0, cardShadow: "xl", cardPadding: 28, cardOpacity: 100, cardBlur: 0, usernameColor: "#dc2626", font: "Bangers", maxWidth: 480, imageStyle: "square", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "confetti", floatingElementsColor: "#ff6b6b", floatingElementsDensity: 20, floatingElementsSize: 15, floatingElementsSpeed: 8, floatingElementsOpacity: 0.4, floatingElementsBlur: 0 }, sampleBlocks },
    { name: "Abstract", description: "Modern geometric forms", category: "art", tier: "pro", emoji: "🔷",
        features: ["Geometric", "Abstract", "Blue"], colors: ["#0f172a", "#3b82f6", "#60a5fa"],
        styles: { bgType: "abstract", bgColor: "#0f172a", bgSecondaryColor: "#3b82f6", cardStyle: "frosted", cardBackgroundColor: "rgba(30,41,59,0.75)", cardBorderColor: "#3b82f6", cardBorderWidth: 1, cardBorderRadius: 16, cardShadow: "lg", cardPadding: 32, cardOpacity: 75, cardBlur: 20, usernameColor: "#60a5fa", font: "Space Grotesk", maxWidth: 500, imageStyle: "rounded", enableParallax: true, parallaxIntensity: 40, parallaxDepth: 50, floatingElements: true, floatingElementsType: "circles", floatingElementsColor: "#3b82f6", floatingElementsDensity: 18, floatingElementsSize: 35, floatingElementsSpeed: 15, floatingElementsOpacity: 0.2, floatingElementsBlur: 3 }, sampleBlocks },
    { name: "Impressionist", description: "Soft pastel dreamy vibes", category: "art", tier: "pro", emoji: "🌸",
        features: ["Pastel", "Soft", "Dreamy"], colors: ["#fdf4ff", "#7c3aed", "#e9d5ff"],
        styles: { bgType: "gradient", bgColor: "#fdf4ff", bgSecondaryColor: "#fae8ff", cardStyle: "frosted", cardBackgroundColor: "rgba(255,255,255,0.8)", cardBorderColor: "#e9d5ff", cardBorderWidth: 0, cardBorderRadius: 20, cardShadow: "md", cardPadding: 36, cardOpacity: 80, cardBlur: 12, usernameColor: "#7c3aed", font: "Lora", maxWidth: 480, imageStyle: "circle", enableParallax: true, parallaxIntensity: 25, parallaxDepth: 30, floatingElements: true, floatingElementsType: "petals", floatingElementsColor: "#d8b4fe", floatingElementsDensity: 12, floatingElementsSize: 25, floatingElementsSpeed: 22, floatingElementsOpacity: 0.2, floatingElementsBlur: 2 }, sampleBlocks },

    // ============ BUSINESS ============
    { name: "Corporate", description: "Professional blue corporate", category: "business", tier: "free", emoji: "🏢",
        features: ["Professional", "Blue", "Trustworthy"], colors: ["#f8fafc", "#1e40af", "#f1f5f9"],
        styles: { bgType: "color", bgColor: "#f8fafc", bgSecondaryColor: "#f1f5f9", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#e2e8f0", cardBorderWidth: 1, cardBorderRadius: 8, cardShadow: "sm", cardPadding: 32, cardOpacity: 100, cardBlur: 0, usernameColor: "#1e40af", font: "Inter", maxWidth: 540, imageStyle: "circle", ...noEffects }, sampleBlocks },
    { name: "Startup", description: "Modern colorful tech vibes", category: "business", tier: "standard", emoji: "🚀",
        features: ["Modern", "Tech", "Gradient"], colors: ["#6366f1", "#4f46e5", "#c7d2fe"],
        styles: { bgType: "mesh-gradient", bgColor: "#6366f1", bgSecondaryColor: "#8b5cf6", cardStyle: "frosted", cardBackgroundColor: "rgba(255,255,255,0.92)", cardBorderColor: "#c7d2fe", cardBorderWidth: 0, cardBorderRadius: 16, cardShadow: "xl", cardPadding: 32, cardOpacity: 92, cardBlur: 15, usernameColor: "#4f46e5", font: "Plus Jakarta Sans", maxWidth: 520, imageStyle: "circle", enableParallax: true, parallaxIntensity: 30, parallaxDepth: 35, floatingElements: true, floatingElementsType: "circles", floatingElementsColor: "#a5b4fc", floatingElementsDensity: 10, floatingElementsSize: 25, floatingElementsSpeed: 15, floatingElementsOpacity: 0.2, floatingElementsBlur: 3 }, sampleBlocks },
    { name: "Executive", description: "Premium gold & black look", category: "business", tier: "pro", emoji: "💼",
        features: ["Premium", "Black & Gold", "Exclusive"], colors: ["#0a0a0a", "#daa520", "#171717"],
        styles: { bgType: "color", bgColor: "#0a0a0a", bgSecondaryColor: "#171717", cardStyle: "solid", cardBackgroundColor: "#0f0f0f", cardBorderColor: "#b8860b", cardBorderWidth: 1, cardBorderRadius: 4, cardShadow: "lg", cardPadding: 40, cardOpacity: 100, cardBlur: 0, usernameColor: "#daa520", font: "Cinzel", maxWidth: 500, imageStyle: "circle", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "diamonds", floatingElementsColor: "#daa520", floatingElementsDensity: 6, floatingElementsSize: 18, floatingElementsSpeed: 28, floatingElementsOpacity: 0.1, floatingElementsBlur: 0 }, sampleBlocks },
    { name: "Consultant", description: "Elegant minimalist professional", category: "business", tier: "pro", emoji: "📊",
        features: ["Minimalist", "Elegant", "Serif"], colors: ["#fafaf9", "#292524", "#d6d3d1"],
        styles: { bgType: "color", bgColor: "#fafaf9", bgSecondaryColor: "#f5f5f4", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#d6d3d1", cardBorderWidth: 1, cardBorderRadius: 12, cardShadow: "md", cardPadding: 36, cardOpacity: 100, cardBlur: 0, usernameColor: "#292524", font: "Source Serif Pro", maxWidth: 520, imageStyle: "circle", ...noEffects }, sampleBlocks },

    // ============ GAMING ============
    { name: "Gamer RGB", description: "Neon RGB gaming aesthetic", category: "gaming", tier: "free", emoji: "🎮",
        features: ["RGB", "Neon", "Gamer"], colors: ["#0a0a0f", "#00ff88", "#12121a"],
        styles: { bgType: "color", bgColor: "#0a0a0f", bgSecondaryColor: "#12121a", cardStyle: "solid", cardBackgroundColor: "#1a1a25", cardBorderColor: "#00ff88", cardBorderWidth: 2, cardBorderRadius: 8, cardShadow: "xl", cardPadding: 24, cardOpacity: 100, cardBlur: 0, usernameColor: "#00ff88", font: "Press Start 2P", maxWidth: 480, imageStyle: "rounded", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "sparkles", floatingElementsColor: "#00ff88", floatingElementsDensity: 15, floatingElementsSize: 15, floatingElementsSpeed: 10, floatingElementsOpacity: 0.3, floatingElementsBlur: 1 }, sampleBlocks },
    { name: "Retro Arcade", description: "Nostalgic pixel art retro", category: "gaming", tier: "standard", emoji: "👾",
        features: ["Pixel Art", "Retro", "Arcade"], colors: ["#2d1b4e", "#fbbf24", "#3d2666"],
        styles: { bgType: "dots", bgColor: "#2d1b4e", bgSecondaryColor: "#fbbf24", cardStyle: "solid", cardBackgroundColor: "#3d2666", cardBorderColor: "#fbbf24", cardBorderWidth: 4, cardBorderRadius: 0, cardShadow: "lg", cardPadding: 20, cardOpacity: 100, cardBlur: 0, usernameColor: "#fbbf24", font: "VT323", maxWidth: 460, imageStyle: "square", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "stars", floatingElementsColor: "#fbbf24", floatingElementsDensity: 20, floatingElementsSize: 18, floatingElementsSpeed: 12, floatingElementsOpacity: 0.35, floatingElementsBlur: 0 }, sampleBlocks },
    { name: "Esports Pro", description: "Aggressive modern esports", category: "gaming", tier: "pro", emoji: "🏆",
        features: ["Aggressive", "Red Accent", "Competitive"], colors: ["#0f0f0f", "#ef4444", "#141414"],
        styles: { bgType: "stripes", bgColor: "#0f0f0f", bgSecondaryColor: "#ef4444", cardStyle: "solid", cardBackgroundColor: "#141414", cardBorderColor: "#ef4444", cardBorderWidth: 2, cardBorderRadius: 4, cardShadow: "2xl", cardPadding: 28, cardOpacity: 100, cardBlur: 0, usernameColor: "#ffffff", font: "Teko", maxWidth: 500, imageStyle: "rounded", enableParallax: true, parallaxIntensity: 35, parallaxDepth: 40, floatingElements: true, floatingElementsType: "fire", floatingElementsColor: "#ef4444", floatingElementsDensity: 12, floatingElementsSize: 20, floatingElementsSpeed: 8, floatingElementsOpacity: 0.2, floatingElementsBlur: 1 }, sampleBlocks },
    { name: "Cozy Gaming", description: "Soft cozy gaming lounge", category: "gaming", tier: "pro", emoji: "🎲",
        features: ["Cozy", "Lounge", "Warm"], colors: ["#fef7ed", "#92400e", "#fbbf24"],
        styles: { bgType: "gradient", bgColor: "#fef7ed", bgSecondaryColor: "#fde8cd", cardStyle: "solid", cardBackgroundColor: "#fffbf5", cardBorderColor: "#fbbf24", cardBorderWidth: 0, cardBorderRadius: 20, cardShadow: "md", cardPadding: 32, cardOpacity: 100, cardBlur: 0, usernameColor: "#92400e", font: "Quicksand", maxWidth: 480, imageStyle: "circle", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "stars", floatingElementsColor: "#fbbf24", floatingElementsDensity: 8, floatingElementsSize: 22, floatingElementsSpeed: 20, floatingElementsOpacity: 0.18, floatingElementsBlur: 1 }, sampleBlocks },

    // ============ FOOD ============
    { name: "Fresh Kitchen", description: "Clean fresh healthy vibes", category: "food", tier: "free", emoji: "🥬",
        features: ["Fresh", "Green", "Healthy"], colors: ["#f0fdf4", "#15803d", "#dcfce7"],
        styles: { bgType: "gradient", bgColor: "#f0fdf4", bgSecondaryColor: "#dcfce7", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#86efac", cardBorderWidth: 1, cardBorderRadius: 16, cardShadow: "md", cardPadding: 28, cardOpacity: 100, cardBlur: 0, usernameColor: "#15803d", font: "Nunito Sans", maxWidth: 520, imageStyle: "circle", enableParallax: false, parallaxIntensity: 0, parallaxDepth: 0, floatingElements: true, floatingElementsType: "leaves", floatingElementsColor: "#22c55e", floatingElementsDensity: 6, floatingElementsSize: 28, floatingElementsSpeed: 22, floatingElementsOpacity: 0.12, floatingElementsBlur: 0 }, sampleBlocks },
    { name: "Rustic", description: "Warm rustic country kitchen", category: "food", tier: "standard", emoji: "🍞",
        features: ["Warm", "Rustic", "Homey"], colors: ["#d4a574", "#5c4033", "#faf6f0"],
        styles: { bgType: "wood-grain", bgColor: "#d4a574", bgSecondaryColor: "#b8956c", cardStyle: "solid", cardBackgroundColor: "#faf6f0", cardBorderColor: "#a78b5a", cardBorderWidth: 0, cardBorderRadius: 8, cardShadow: "lg", cardPadding: 32, cardOpacity: 100, cardBlur: 0, usernameColor: "#5c4033", font: "Josefin Slab", maxWidth: 500, imageStyle: "rounded", ...noEffects }, sampleBlocks },
    { name: "Fine Dining", description: "Elegant upscale restaurant", category: "food", tier: "pro", emoji: "🍷",
        features: ["Upscale", "Elegant", "Dark"], colors: ["#1a1a1a", "#c9a962", "#0f0f0f"],
        styles: { bgType: "marble", bgColor: "#1a1a1a", bgSecondaryColor: "#2a2a2a", cardStyle: "solid", cardBackgroundColor: "#0f0f0f", cardBorderColor: "#c9a962", cardBorderWidth: 1, cardBorderRadius: 4, cardShadow: "xl", cardPadding: 40, cardOpacity: 100, cardBlur: 0, usernameColor: "#c9a962", font: "Cormorant Garamond", maxWidth: 480, imageStyle: "circle", enableParallax: true, parallaxIntensity: 20, parallaxDepth: 25, floatingElements: true, floatingElementsType: "sparkles", floatingElementsColor: "#c9a962", floatingElementsDensity: 5, floatingElementsSize: 12, floatingElementsSpeed: 30, floatingElementsOpacity: 0.1, floatingElementsBlur: 0 }, sampleBlocks },
    { name: "Café Vibes", description: "Cozy coffee shop atmosphere", category: "food", tier: "pro", emoji: "☕",
        features: ["Cozy", "Coffee", "Warm"], colors: ["#faf5f0", "#5c4033", "#f0e6db"],
        styles: { bgType: "noise", bgColor: "#faf5f0", bgSecondaryColor: "#f0e6db", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#d4a574", cardBorderWidth: 0, cardBorderRadius: 16, cardShadow: "md", cardPadding: 32, cardOpacity: 100, cardBlur: 0, usernameColor: "#5c4033", font: "Playfair Display", maxWidth: 480, imageStyle: "circle", ...noEffects }, sampleBlocks },

    // ============ TRAVEL ============
    { name: "Wanderlust", description: "Light earthy explorer style", category: "travel", tier: "free", emoji: "🌍",
        features: ["Earthy", "Light", "Explorer"], colors: ["#faf7f4", "#5c4a3a", "#f5efe8"],
        styles: { bgType: "color", bgColor: "#faf7f4", bgSecondaryColor: "#f5efe8", cardStyle: "solid", cardBackgroundColor: "#ffffff", cardBorderColor: "#d4c4b0", cardBorderWidth: 0, cardBorderRadius: 12, cardShadow: "md", cardPadding: 32, cardOpacity: 100, cardBlur: 0, usernameColor: "#5c4a3a", font: "Merriweather", maxWidth: 520, imageStyle: "circle", ...noEffects }, sampleBlocks },
    { name: "Beach Paradise", description: "Tropical beach vacation", category: "travel", tier: "standard", emoji: "🏝️",
        features: ["Tropical", "Beach", "Blue"], colors: ["#0ea5e9", "#0369a1", "#06b6d4"],
        styles: { bgType: "waves", bgColor: "#0ea5e9", bgSecondaryColor: "#06b6d4", cardStyle: "frosted", cardBackgroundColor: "rgba(255,255,255,0.88)", cardBorderColor: "#7dd3fc", cardBorderWidth: 0, cardBorderRadius: 20, cardShadow: "lg", cardPadding: 28, cardOpacity: 88, cardBlur: 15, usernameColor: "#0369a1", font: "Poppins", maxWidth: 480, imageStyle: "circle", enableParallax: true, parallaxIntensity: 30, parallaxDepth: 35, floatingElements: true, floatingElementsType: "bubbles", floatingElementsColor: "#7dd3fc", floatingElementsDensity: 15, floatingElementsSize: 25, floatingElementsSpeed: 15, floatingElementsOpacity: 0.25, floatingElementsBlur: 2 }, sampleBlocks },
    { name: "Urban Explorer", description: "Modern city photography", category: "travel", tier: "pro", emoji: "🏙️",
        features: ["City", "Urban", "Modern"], colors: ["#18181b", "#fafafa", "#27272a"],
        styles: { bgType: "noise", bgColor: "#18181b", bgSecondaryColor: "#27272a", cardStyle: "solid", cardBackgroundColor: "#1f1f23", cardBorderColor: "#52525b", cardBorderWidth: 1, cardBorderRadius: 8, cardShadow: "xl", cardPadding: 28, cardOpacity: 100, cardBlur: 0, usernameColor: "#fafafa", font: "Roboto", maxWidth: 520, imageStyle: "rounded", ...noEffects }, sampleBlocks },
    { name: "Adventure", description: "Outdoor mountains & nature", category: "travel", tier: "pro", emoji: "⛰️",
        features: ["Nature", "Adventure", "Green"], colors: ["#14532d", "#bbf7d0", "#166534"],
        styles: { bgType: "gradient", bgColor: "#14532d", bgSecondaryColor: "#166534", cardStyle: "frosted", cardBackgroundColor: "rgba(34,197,94,0.12)", cardBorderColor: "#4ade80", cardBorderWidth: 1, cardBorderRadius: 12, cardShadow: "lg", cardPadding: 28, cardOpacity: 85, cardBlur: 18, usernameColor: "#bbf7d0", font: "Cabin", maxWidth: 500, imageStyle: "circle", enableParallax: true, parallaxIntensity: 35, parallaxDepth: 45, floatingElements: true, floatingElementsType: "leaves", floatingElementsColor: "#4ade80", floatingElementsDensity: 10, floatingElementsSize: 28, floatingElementsSpeed: 18, floatingElementsOpacity: 0.18, floatingElementsBlur: 2 }, sampleBlocks }
];

export default THEME_PRESETS;
