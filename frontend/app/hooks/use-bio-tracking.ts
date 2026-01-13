import { useEffect, useRef } from 'react';
import { api } from '../services/api';

export const useBioTracking = (bioId: string | undefined) => {
    const trackedRef = useRef(false);

    useEffect(() => {
        if (!bioId || trackedRef.current) return;

        const track = async () => {
            try {
                // Determine if this is a view or click based on context? 
                // For page load, it's a view.
                
                // Session management
                const sessionId = sessionStorage.getItem('portyo_session') ||
                    Math.random().toString(36).substring(2) + Date.now().toString(36);
                sessionStorage.setItem('portyo_session', sessionId);

                trackedRef.current = true; // Prevent double firing in React strict mode

                await api.post('/public/track', {
                    bioId,
                    referrer: document.referrer || undefined,
                    sessionId,
                    type: 'view'
                });
            } catch (error) {
                console.error("Tracking failed", error);
            }
        };

        track();
    }, [bioId]);
};
