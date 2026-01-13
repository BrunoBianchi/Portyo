import { useEffect, useRef } from 'react';
import './ParallaxLeaves.css';

export default function ParallaxLeaves() {
    const layer1Ref = useRef<HTMLDivElement>(null);
    const layer2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;

            // Layer 1 (background) moves slower - more depth
            if (layer1Ref.current) {
                layer1Ref.current.style.transform = `translateY(${scrolled * 0.3}px)`;
            }

            // Layer 2 (foreground) moves faster - closer to viewer
            if (layer2Ref.current) {
                layer2Ref.current.style.transform = `translateY(${scrolled * 0.6}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="parallax-leaves-container">
            {/* Background Layer - Further away */}
            <div
                ref={layer1Ref}
                className="parallax-layer parallax-layer-back"
                style={{
                    backgroundImage: 'url(/background/Design sem nome (4).svg)',
                }}
            />

            {/* Foreground Layer - Closer */}
            <div
                ref={layer2Ref}
                className="parallax-layer parallax-layer-front"
                style={{
                    backgroundImage: 'url(/background/Design sem nome (5).svg)',
                }}
            />
        </div>
    );
}
