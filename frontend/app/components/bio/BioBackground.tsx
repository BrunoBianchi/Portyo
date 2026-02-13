/**
 * BioBackground — renders all 30+ bgType backgrounds as React components.
 * Migrated from html-generator.ts to work with the blocks-based rendering path.
 */
import React, { useMemo } from 'react';

interface BioBackgroundProps {
    bio: any;
}

/**
 * Computes the CSS background style string for the root element.
 */
export function computeBgStyle(bio: any): React.CSSProperties {
    const bgColor = bio.bgColor || '#f8fafc';
    const bgSecondary = bio.bgSecondaryColor || '#e2e8f0';
    const bgType = bio.bgType || 'color';

    switch (bgType) {
        case 'color':
            return { background: bgColor };
        case 'image':
            return bio.bgImage
                ? { background: `url('${bio.bgImage}') no-repeat center center fixed`, backgroundSize: 'cover' }
                : { background: bgColor };
        case 'video':
            return { background: 'transparent', position: 'relative', overflow: 'hidden' };
        case 'dynamic-blur':
            return { background: '#000' };
        case 'grid':
            return {
                backgroundColor: bgColor,
                backgroundImage: `linear-gradient(${bgSecondary} 1px, transparent 1px), linear-gradient(90deg, ${bgSecondary} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
            };
        case 'dots':
            return {
                backgroundColor: bgColor,
                backgroundImage: `radial-gradient(${bgSecondary} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
            };
        case 'polka':
            return {
                backgroundColor: bgColor,
                backgroundImage: `radial-gradient(${bgSecondary} 20%, transparent 20%), radial-gradient(${bgSecondary} 20%, transparent 20%)`,
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px',
            };
        case 'stripes':
            return { background: `repeating-linear-gradient(45deg, ${bgColor}, ${bgColor} 10px, ${bgSecondary} 10px, ${bgSecondary} 20px)` };
        case 'zigzag':
            return {
                backgroundColor: bgColor,
                backgroundImage: `linear-gradient(135deg, ${bgSecondary} 25%, transparent 25%), linear-gradient(225deg, ${bgSecondary} 25%, transparent 25%), linear-gradient(45deg, ${bgSecondary} 25%, transparent 25%), linear-gradient(315deg, ${bgSecondary} 25%, ${bgColor} 25%)`,
                backgroundPosition: '10px 0, 10px 0, 0 0, 0 0',
                backgroundSize: '20px 20px',
                backgroundRepeat: 'repeat',
            };
        case 'waves':
            return {
                backgroundColor: bgColor,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='${encodeURIComponent(bgSecondary)}' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            };
        case 'mesh':
            return {
                backgroundColor: bgColor,
                backgroundImage: `radial-gradient(at 40% 20%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 80% 0%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 0% 50%, ${bgSecondary} 0px, transparent 50%)`,
            };
        case 'particles':
            return {
                backgroundColor: bgColor,
                backgroundImage: `radial-gradient(${bgSecondary} 2px, transparent 2px), radial-gradient(${bgSecondary} 2px, transparent 2px)`,
                backgroundSize: '32px 32px',
                backgroundPosition: '0 0, 16px 16px',
            };
        case 'noise':
            return {
                backgroundColor: bgColor,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
            };
        case 'abstract':
            return {
                backgroundColor: bgColor,
                backgroundImage: `linear-gradient(30deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(150deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(30deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(150deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(60deg, ${bgSecondary}77 25%, transparent 25.5%, transparent 75%, ${bgSecondary}77 75%, ${bgSecondary}77), linear-gradient(60deg, ${bgSecondary}77 25%, transparent 25.5%, transparent 75%, ${bgSecondary}77 75%, ${bgSecondary}77)`,
                backgroundSize: '20px 35px',
                backgroundPosition: '0 0, 0 0, 10px 18px, 10px 18px, 0 0, 10px 18px',
            };
        case 'blueprint':
            return {
                backgroundColor: '#1e3a5f',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
                backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px',
            };
        case 'marble':
            return {
                backgroundColor: '#f5f5f5',
                backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.02) 50%, transparent 50%), linear-gradient(rgba(0,0,0,0.02) 50%, transparent 50%), radial-gradient(circle at 20% 30%, rgba(220,220,220,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(200,200,200,0.3) 0%, transparent 50%), radial-gradient(circle at 60% 40%, rgba(210,210,210,0.35) 0%, transparent 60%)',
                backgroundSize: '50px 50px, 50px 50px, 100% 100%, 100% 100%, 100% 100%',
                backgroundPosition: '0 0, 25px 25px, 0 0, 0 0, 0 0',
            };
        case 'concrete':
            return {
                backgroundColor: '#9ca3af',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='concrete'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23concrete)' opacity='0.15'/%3E%3C/svg%3E"), linear-gradient(135deg, rgba(156,163,175,1) 0%, rgba(107,114,128,1) 100%)`,
            };
        case 'terracotta':
            return {
                backgroundColor: '#c2410c',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23ea580c' fill-opacity='0.3'%3E%3Cpath fill-rule='evenodd' d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
            };
        case 'wood-grain':
            return {
                backgroundColor: '#8B7355',
                backgroundImage: 'linear-gradient(90deg, rgba(101,67,33,0.1) 50%, transparent 50%), linear-gradient(rgba(101,67,33,0.1) 50%, transparent 50%), linear-gradient(rgba(139,115,85,0.3) 0%, transparent 100%)',
                backgroundSize: '4px 100%, 100% 4px, 100% 100%',
            };
        case 'brick':
            return {
                backgroundColor: '#8B4513',
                backgroundImage: 'linear-gradient(335deg, #b84a1f 23px, transparent 23px), linear-gradient(155deg, #b84a1f 23px, transparent 23px), linear-gradient(335deg, #b84a1f 23px, transparent 23px), linear-gradient(155deg, #b84a1f 23px, transparent 23px)',
                backgroundSize: '58px 58px',
                backgroundPosition: '0 2px, 4px 35px, 29px 31px, 34px 6px',
            };
        case 'frosted-glass':
            return {
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
            };
        case 'steel':
            return {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '1px 100%, 100% 1px',
            };
        case 'aurora':
            return { background: `linear-gradient(135deg, ${bgColor} 0%, ${bgSecondary} 50%, ${bgColor} 100%)` };
        case 'mesh-gradient':
            return {
                backgroundColor: bgColor,
                backgroundImage: `radial-gradient(at 40% 20%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 80% 0%, ${bgColor} 0px, transparent 50%), radial-gradient(at 0% 50%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 80% 50%, ${bgColor}80 0px, transparent 50%), radial-gradient(at 0% 100%, ${bgSecondary}80 0px, transparent 50%), radial-gradient(at 80% 100%, ${bgColor} 0px, transparent 50%), radial-gradient(at 0% 0%, ${bgSecondary} 0px, transparent 50%)`,
            };
        case 'gradient':
            return { background: `linear-gradient(135deg, ${bgColor} 0%, ${bgSecondary} 100%)` };
        case 'gradient-animated':
            return {
                background: `linear-gradient(-45deg, ${bgColor}, ${bgSecondary}, ${bgColor}, ${bgSecondary})`,
                backgroundSize: '400% 400%',
                animation: 'gradientMove 15s ease infinite',
            };
        case 'geometric':
            return {
                backgroundColor: bgColor,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(bgSecondary)}' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            };
        case 'palm-leaves':
        case 'wheat':
            return { backgroundColor: bgColor, overflow: 'hidden' as const };
        case 'bubbles':
        case 'confetti':
        case 'particles-float':
            return { backgroundColor: bgColor };
        case 'starfield':
            return { background: 'radial-gradient(ellipse at bottom, #1B2838 0%, #090A0F 100%)' };
        case 'rain':
            return { background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)' };
        default:
            return { backgroundColor: bgColor };
    }
}

/**
 * Renders overlay / animated layers (video, blur, palm-leaves, aurora, bubbles, etc.)
 */
export const BioBackgroundLayers: React.FC<BioBackgroundProps> = React.memo(({ bio }) => {
    const bgType = bio.bgType || 'color';
    const bgColor = bio.bgColor || '#f8fafc';
    const bgSecondary = bio.bgSecondaryColor || '#e2e8f0';

    const layers = useMemo(() => {
        const elements: React.ReactNode[] = [];

        // Video background
        if (bgType === 'video' && bio.bgVideo) {
            elements.push(
                <React.Fragment key="video">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                            position: 'fixed', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover', zIndex: -1,
                        }}
                    >
                        <source src={bio.bgVideo} type="video/mp4" />
                    </video>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: -1 }} />
                </React.Fragment>
            );
        }

        // Dynamic blur
        if (bgType === 'dynamic-blur') {
            const bgImg = bio.bgImage || bio.profileImage || '';
            elements.push(
                <React.Fragment key="dynamic-blur">
                    <div style={{
                        position: 'fixed', inset: '-20px', zIndex: -1,
                        background: `url('${bgImg}') no-repeat center center`,
                        backgroundSize: 'cover',
                        filter: 'blur(40px) brightness(0.6)',
                        transform: 'scale(1.1)',
                    }} />
                    <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'rgba(0,0,0,0.2)' }} />
                </React.Fragment>
            );
        }

        // Palm leaves
        if (bgType === 'palm-leaves') {
            elements.push(
                <React.Fragment key="palm">
                    <div style={{
                        position: 'fixed', inset: 0,
                        backgroundImage: "url('/background/Design sem nome (4).svg')",
                        backgroundSize: '600px 600px', backgroundRepeat: 'repeat',
                        transform: 'rotate(15deg) translateZ(0)', opacity: 0.4,
                        zIndex: -3, pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'fixed', inset: 0,
                        backgroundImage: "url('/background/Design sem nome (5).svg')",
                        backgroundSize: '500px 500px', backgroundRepeat: 'repeat',
                        transform: 'rotate(-10deg) translateZ(0)', opacity: 0.6,
                        zIndex: -2, pointerEvents: 'none',
                    }} />
                </React.Fragment>
            );
        }

        // Wheat
        if (bgType === 'wheat') {
            elements.push(
                <React.Fragment key="wheat">
                    <div style={{
                        position: 'fixed', inset: 0,
                        backgroundImage: "url('/background/wheat/Design sem nome (7).svg')",
                        backgroundSize: '600px 600px', backgroundRepeat: 'repeat',
                        transform: 'rotate(15deg) translateZ(0)', opacity: 0.4,
                        zIndex: -3, pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'fixed', inset: 0,
                        backgroundImage: "url('/background/wheat/Design sem nome (8).svg')",
                        backgroundSize: '500px 500px', backgroundRepeat: 'repeat',
                        transform: 'rotate(-10deg) translateZ(0)', opacity: 0.6,
                        zIndex: -2, pointerEvents: 'none',
                    }} />
                </React.Fragment>
            );
        }

        // Aurora
        if (bgType === 'aurora') {
            elements.push(
                <React.Fragment key="aurora">
                    <div style={{ position: 'fixed', inset: 0, zIndex: -2, pointerEvents: 'none', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', inset: '-50%',
                            background: `radial-gradient(ellipse 80% 50% at 50% 120%, ${bgSecondary}80, transparent), radial-gradient(ellipse 60% 40% at 30% 100%, ${bgColor}60, transparent)`,
                            animation: 'aurora 15s ease-in-out infinite alternate',
                            willChange: 'transform',
                        }} />
                    </div>
                    <style>{`@keyframes aurora { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-10%) scale(1.1); } }`}</style>
                </React.Fragment>
            );
        }

        // Gradient animated keyframes
        if (bgType === 'gradient-animated') {
            elements.push(
                <style key="gradient-animated-kf">{`@keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
            );
        }

        // Bubbles
        if (bgType === 'bubbles') {
            elements.push(
                <React.Fragment key="bubbles">
                    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: -2, pointerEvents: 'none' }}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute', bottom: '-100px',
                                left: `${10 + i * 9}%`,
                                width: `${20 + i * 5}px`, height: `${20 + i * 5}px`,
                                background: `${bgSecondary}40`, borderRadius: '50%',
                                animation: `floatBubble ${5 + i * 2}s linear infinite`,
                                animationDelay: `${i * 0.5}s`,
                            }} />
                        ))}
                    </div>
                    <style>{`@keyframes floatBubble { 0% { transform: translateY(0) scale(1); opacity: 0.6; } 100% { transform: translateY(-120vh) scale(0.4); opacity: 0; } }`}</style>
                </React.Fragment>
            );
        }

        // Confetti
        if (bgType === 'confetti') {
            const colors = [bgSecondary, bgColor, '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'];
            elements.push(
                <React.Fragment key="confetti">
                    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: -2, pointerEvents: 'none' }}>
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute', top: '-20px',
                                left: `${(i * 3.33) % 100}%`,
                                width: `${8 + (i % 4) * 2}px`, height: `${8 + (i % 4) * 2}px`,
                                background: colors[i % colors.length],
                                animation: `fallConfetti ${3 + (i % 5)}s linear infinite`,
                                animationDelay: `${(i * 0.17) % 5}s`,
                                transform: `rotate(${(i * 37) % 360}deg)`,
                            }} />
                        ))}
                    </div>
                    <style>{`@keyframes fallConfetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(120vh) rotate(720deg); opacity: 0.3; } }`}</style>
                </React.Fragment>
            );
        }

        // Starfield
        if (bgType === 'starfield') {
            elements.push(
                <React.Fragment key="starfield">
                    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: -2, pointerEvents: 'none' }}>
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                top: `${(i * 2) % 100}%`, left: `${(i * 7.3) % 100}%`,
                                width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`,
                                background: 'white', borderRadius: '50%',
                                animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite`,
                                animationDelay: `${(i * 0.06) % 3}s`,
                            }} />
                        ))}
                    </div>
                    <style>{`@keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }`}</style>
                </React.Fragment>
            );
        }

        // Rain
        if (bgType === 'rain') {
            elements.push(
                <React.Fragment key="rain">
                    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: -2, pointerEvents: 'none' }}>
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute', top: '-20px',
                                left: `${(i * 2.5) % 100}%`,
                                width: '1px', height: `${15 + (i % 5) * 4}px`,
                                background: 'linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.5))',
                                animation: `rainFall ${0.5 + (i % 5) * 0.1}s linear infinite`,
                                animationDelay: `${(i * 0.05) % 2}s`,
                            }} />
                        ))}
                    </div>
                    <style>{`@keyframes rainFall { 0% { transform: translateY(0); } 100% { transform: translateY(120vh); } }`}</style>
                </React.Fragment>
            );
        }

        // Particles float
        if (bgType === 'particles-float') {
            elements.push(
                <React.Fragment key="particles-float">
                    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: -2, pointerEvents: 'none' }}>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                top: `${(i * 5) % 100}%`, left: `${(i * 7) % 100}%`,
                                width: `${4 + (i % 4) * 2}px`, height: `${4 + (i % 4) * 2}px`,
                                background: `${bgSecondary}60`, borderRadius: '50%',
                                animation: `floatParticle ${8 + (i % 8)}s ease-in-out infinite`,
                                animationDelay: `${(i * 0.25) % 5}s`,
                            }} />
                        ))}
                    </div>
                    <style>{`@keyframes floatParticle { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; } 25% { transform: translate(20px, -30px) scale(1.1); opacity: 0.8; } 50% { transform: translate(-20px, -60px) scale(0.9); opacity: 0.6; } 75% { transform: translate(10px, -30px) scale(1.05); opacity: 0.7; } }`}</style>
                </React.Fragment>
            );
        }

        // Parallax layers
        if (bio.enableParallax && Array.isArray(bio.parallaxLayers) && bio.parallaxLayers.length > 0) {
            const parallaxElements = bio.parallaxLayers.map((layer: any, index: number) => {
                const image = layer.image || '';
                if (!image) return null;
                const opacity = typeof layer.opacity === 'number' ? layer.opacity : 0.6;
                const size = typeof layer.size === 'number' ? layer.size : 600;
                const repeat = layer.repeat !== false;
                const rotate = typeof layer.rotate === 'number' ? layer.rotate : 0;
                const blur = typeof layer.blur === 'number' ? layer.blur : 0;
                const zIdx = typeof layer.zIndex === 'number' ? Math.min(layer.zIndex, -1) : -1;
                const posX = typeof layer.positionX === 'number' ? layer.positionX : 0;
                const posY = typeof layer.positionY === 'number' ? layer.positionY : 0;

                return (
                    <div
                        key={`parallax-${index}`}
                        data-parallax-layer
                        data-parallax-speed={layer.speed ?? 0.2}
                        data-parallax-axis={layer.axis || 'y'}
                        style={{
                            position: 'fixed',
                            top: posY, left: posX,
                            width: repeat ? '200%' : `${size}px`,
                            height: repeat ? '200%' : `${size}px`,
                            backgroundImage: `url('${image}')`,
                            backgroundSize: repeat ? `${size}px ${size}px` : 'contain',
                            backgroundRepeat: repeat ? 'repeat' : 'no-repeat',
                            backgroundPosition: 'center',
                            transform: `rotate(${rotate}deg) translateZ(0)`,
                            opacity, zIndex: zIdx,
                            pointerEvents: 'none',
                            filter: blur > 0 ? `blur(${blur}px)` : undefined,
                            willChange: 'transform',
                        }}
                    />
                );
            }).filter(Boolean);

            if (parallaxElements.length > 0) {
                elements.push(
                    <div key="parallax-layers" style={{ position: 'fixed', inset: 0, zIndex: -2, pointerEvents: 'none', overflow: 'hidden' }}>
                        {parallaxElements}
                    </div>
                );
            }
        }

        return elements;
    }, [bgType, bgColor, bgSecondary, bio.bgVideo, bio.bgImage, bio.profileImage, bio.enableParallax, bio.parallaxLayers]);

    if (layers.length === 0) return null;

    return <>{layers}</>;
});

BioBackgroundLayers.displayName = 'BioBackgroundLayers';
