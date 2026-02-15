import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { api } from "../services/api";
import { Links, Meta, Scripts } from "react-router";
import { sanitizeHtml } from "../utils/security";

interface Bio {
    id: string;
    sufix: string;
    html: string;
    clicks: number;
    views: number;
    createdAt: string;
    userId: string;
    seoTitle?: string;
    seoDescription?: string;
    favicon?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    seoKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    noIndex?: boolean;
    customDomain?: string;
    bgType?: string;
    bgColor?: string;
    bgSecondaryColor?: string;
    bgImage?: string | null;
    bgVideo?: string | null;
    usernameColor?: string;
    imageStyle?: string;
    cardStyle?: string;
    cardBackgroundColor?: string;
    cardOpacity?: number;
    cardBlur?: number;
    cardBorderColor?: string;
    cardBorderWidth?: number;
    cardBorderRadius?: number;
    cardShadow?: string;
    cardPadding?: number;
    maxWidth?: number;
    font?: string;
    customFontUrl?: string | null;
    customFontName?: string | null;
    enableParallax?: boolean;
    parallaxIntensity?: number;
    parallaxDepth?: number;
    parallaxAxis?: "x" | "y" | "xy";
    parallaxLayers?: Array<{
        id: string;
        image: string;
        speed?: number;
        axis?: "x" | "y" | "xy";
        opacity?: number;
        size?: number;
        repeat?: boolean;
        rotate?: number;
        blur?: number;
        zIndex?: number;
        positionX?: number;
        positionY?: number;
    }>;
    floatingElements?: boolean;
    floatingElementsType?: string;
    floatingElementsColor?: string;
    floatingElementsDensity?: number;
    floatingElementsSize?: number;
    floatingElementsSpeed?: number;
    floatingElementsOpacity?: number;
    floatingElementsBlur?: number;
}

interface SubDomainData {
    subdomain: string;
    bio: Bio | null;
    isLoading: boolean;
    isNotFound: boolean;
}

const SubDomainContext = createContext<SubDomainData>({} as SubDomainData);

export const useSubDomain = () => useContext(SubDomainContext);

const BioRenderer = ({ html }: { html: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Store interval IDs to clear them on unmount
        const intervals: number[] = [];

        const startTimer = (timer: Element) => {
            if (timer.hasAttribute('data-initialized')) return;

            const dateStr = timer.getAttribute('data-date');
            if (!dateStr) return;

            timer.setAttribute('data-initialized', 'true');
            const target = new Date(dateStr).getTime();

            let intervalId: number | null = null;
            const update = () => {
                const now = new Date().getTime();
                const diff = target - now;

                if (diff < 0) {
                    timer.innerHTML = '<div style="font-size:18px; font-weight:600; padding:12px;">Event Started</div>';
                    if (intervalId !== null) {
                        window.clearInterval(intervalId);
                    }
                    return;
                }

                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);

                const daysEl = timer.querySelector('.days');
                const hoursEl = timer.querySelector('.hours');
                const minsEl = timer.querySelector('.minutes');
                const secsEl = timer.querySelector('.seconds');

                if (daysEl) daysEl.textContent = d.toString().padStart(2, '0');
                if (hoursEl) hoursEl.textContent = h.toString().padStart(2, '0');
                if (minsEl) minsEl.textContent = m.toString().padStart(2, '0');
                if (secsEl) secsEl.textContent = s.toString().padStart(2, '0');
            };

            update();
            // Use window.setInterval to ensure we get a number ID
            intervalId = window.setInterval(update, 1000);
            intervals.push(intervalId);
        };

        const initInstagramFeeds = () => {
            const root = containerRef.current;
            if (!root) return;

            const feeds = root.querySelectorAll('.custom-instagram-feed');
            feeds.forEach(feed => {
                if (feed.hasAttribute('data-initialized')) return;
                feed.setAttribute('data-initialized', 'true');

                const username = feed.getAttribute('data-username') || 'instagram';
                const bioId = feed.getAttribute('data-bio-id');
                const displayType = feed.getAttribute('data-display-type') || 'grid';
                const variation = feed.getAttribute('data-variation') || 'grid-shop';

                if (!bioId) return;

                // Add spinner styles if not present
                if (!document.getElementById('instagram-styles')) {
                    const style = document.createElement('style');
                    style.id = 'instagram-styles';
                    style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                    document.head.appendChild(style);
                }

                const imageStyle = displayType === 'grid'
                    ? "aspect-ratio:1; width:100%;"
                    : "aspect-ratio:1; width:100%; max-height:400px;";

                api.get(`/public/instagram/feed/${encodeURIComponent(bioId)}`)
                    .then(res => res.data)
                    .then(posts => {
                        if (!posts || !Array.isArray(posts) || posts.length === 0) {
                            feed.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#6b7280; font-size:12px;">No posts found</div>';
                            return;
                        }

                        let html = '';
                        
                        // Variation 1: grid-shop - with shopping/link overlay indicators
                        if (variation === 'grid-shop') {
                            posts.slice(0, 3).forEach((post: any, index: number) => {
                                html += `<a href="${post.url}" target="_blank" aria-label="View Instagram post" data-post-index="${index}" style="display:block; position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6; border-radius:8px; transition:transform 0.2s;">
                                    <img src="${post.imageUrl}" alt="Instagram post by ${username}" style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.3s;" onload="this.style.opacity=1" onerror="this.style.display='none'" />
                                    <div class="instagram-shop-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; pointer-events:none;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                                    </div>
                                </a>`;
                            });
                        }
                        // Variation 2: visual-gallery - clean, minimal, photo-focused
                        else if (variation === 'visual-gallery') {
                            posts.slice(0, 3).forEach((post: any, index: number) => {
                                html += `<a href="${post.url}" target="_blank" aria-label="View Instagram post" data-post-index="${index}" style="display:block; position:relative; ${imageStyle} overflow:hidden; background:#fafafa; transition:opacity 0.2s;">
                                    <img src="${post.imageUrl}" alt="Instagram post by ${username}" style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.3s;" onload="this.style.opacity=1" onerror="this.style.display='none'" />
                                </a>`;
                            });
                        }
                        // Fallback: default grid rendering
                        else {
                            posts.slice(0, 3).forEach((post: any, index: number) => {
                                html += `<a href="${post.url}" target="_blank" aria-label="View Instagram post" data-post-index="${index}" style="display:block; position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6; border-radius:8px;">
                                    <img src="${post.imageUrl}" alt="Instagram post by ${username}" style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.3s;" onload="this.style.opacity=1" onerror="this.style.display='none'" />
                                </a>`;
                            });
                        }
                        
                        feed.innerHTML = html;
                        
                        // Add hover effects after HTML is injected
                        if (variation === 'grid-shop') {
                            const links = feed.querySelectorAll('a[data-post-index]');
                            links.forEach((link) => {
                                const overlay = link.querySelector('.instagram-shop-overlay') as HTMLElement;
                                if (overlay) {
                                    link.addEventListener('mouseenter', () => {
                                        (link as HTMLElement).style.transform = 'scale(0.98)';
                                        overlay.style.opacity = '1';
                                    });
                                    link.addEventListener('mouseleave', () => {
                                        (link as HTMLElement).style.transform = 'scale(1)';
                                        overlay.style.opacity = '0';
                                    });
                                }
                            });
                        } else if (variation === 'visual-gallery') {
                            const links = feed.querySelectorAll('a[data-post-index]');
                            links.forEach((link) => {
                                link.addEventListener('mouseenter', () => {
                                    (link as HTMLElement).style.opacity = '0.85';
                                });
                                link.addEventListener('mouseleave', () => {
                                    (link as HTMLElement).style.opacity = '1';
                                });
                            });
                        }
                    })
                    .catch(err => {
                        console.error("Instagram fetch error:", err);
                        feed.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#ef4444; font-size:12px;">Error loading posts</div>';
                    });
            });
        };

        const initThreadsFeeds = () => {
            const root = containerRef.current;
            if (!root) return;

            const feeds = root.querySelectorAll('.custom-threads-feed');
            feeds.forEach(feed => {
                if (feed.hasAttribute('data-initialized')) return;
                feed.setAttribute('data-initialized', 'true');

                const username = feed.getAttribute('data-username') || 'threads';
                const bioId = feed.getAttribute('data-bio-id');
                const displayType = feed.getAttribute('data-display-type') || 'grid';
                const variation = feed.getAttribute('data-variation') || 'thread-grid';

                if (!bioId) return;

                if (!document.getElementById('threads-styles')) {
                    const style = document.createElement('style');
                    style.id = 'threads-styles';
                    style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                    document.head.appendChild(style);
                }

                const imageStyle = displayType === 'grid'
                    ? "aspect-ratio:1; width:100%;"
                    : "aspect-ratio:1; width:100%; max-height:400px;";

                api.get(`/public/threads/feed/${encodeURIComponent(bioId)}`)
                    .then(res => res.data)
                    .then(posts => {
                        if (!posts || !Array.isArray(posts) || posts.length === 0) {
                            feed.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#6b7280; font-size:12px;">No posts found</div>';
                            return;
                        }

                        let html = '';
                        if (variation === 'thread-cards') {
                            posts.slice(0, 3).forEach((post: any, index: number) => {
                                html += `<a href="${post.url}" target="_blank" aria-label="View Threads post" data-post-index="${index}" style="display:block; position:relative; ${imageStyle} overflow:hidden; background:#111111; border-radius:12px; transition:transform 0.2s;">
                                    <img src="${post.imageUrl}" alt="Threads post by ${username}" style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.3s;" onload="this.style.opacity=1" onerror="this.style.display='none'" />
                                </a>`;
                            });
                        } else {
                            posts.slice(0, 3).forEach((post: any) => {
                                html += `<a href="${post.url}" target="_blank" aria-label="View Threads post" style="display:block; position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6; border-radius:10px;">
                                    <img src="${post.imageUrl}" alt="Threads post by ${username}" style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.3s;" onload="this.style.opacity=1" onerror="this.style.display='none'" />
                                </a>`;
                            });
                        }

                        feed.innerHTML = html;

                        if (variation === 'thread-cards') {
                            const links = feed.querySelectorAll('a[data-post-index]');
                            links.forEach((link) => {
                                link.addEventListener('mouseenter', () => {
                                    (link as HTMLElement).style.transform = 'translateY(-2px)';
                                });
                                link.addEventListener('mouseleave', () => {
                                    (link as HTMLElement).style.transform = 'translateY(0)';
                                });
                            });
                        }
                    })
                    .catch(err => {
                        console.error("Threads fetch error:", err);
                        feed.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#ef4444; font-size:12px;">Error loading posts</div>';
                    });
            });
        };

        const initYoutubeFeeds = () => {
            const root = containerRef.current;
            if (!root) return;

            const feeds = root.querySelectorAll('.custom-youtube-feed');
            feeds.forEach(feed => {
                if (feed.hasAttribute('data-initialized')) return;
                feed.setAttribute('data-initialized', 'true');

                const url = feed.getAttribute('data-url');
                const displayType = feed.getAttribute('data-display-type') || 'grid';

                if (!url) return;

                // Add spinner styles if not present
                if (!document.getElementById('youtube-styles')) {
                    const style = document.createElement('style');
                    style.id = 'youtube-styles';
                    style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                    document.head.appendChild(style);
                }

                const imageStyle = displayType === 'grid'
                    ? "aspect-ratio:16/9; width:100%;"
                    : "aspect-ratio:16/9; width:100%;";

                api.get(`/public/youtube/fetch?url=${encodeURIComponent(url)}`)
                    .then(res => res.data)
                    .then(videos => {
                        if (!videos || !Array.isArray(videos) || videos.length === 0) {
                            feed.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#6b7280; font-size:12px;">No videos found</div>';
                            return;
                        }

                        let html = '';
                        videos.slice(0, 3).forEach((video: any) => {
                            html += `<a href="${video.url}" target="_blank" style="display:block; position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6;">
                                <img src="${video.imageUrl}" style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.3s;" onload="this.style.opacity=1" onerror="this.style.display='none'" />
                                <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2);">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                </div>
                            </a>`;
                        });
                        feed.innerHTML = html;
                    })
                    .catch(err => {
                        console.error("YouTube fetch error:", err);
                        feed.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#ef4444; font-size:12px;">Error loading videos</div>';
                    });
            });
        };

        const initShareModal = () => {
            (window as any).currentShareUrl = '';
            (window as any).openShare = function (e: any, url: string, title: string) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                (window as any).currentShareUrl = url;
                const modal = document.getElementById('share-modal');
                if (modal) modal.style.display = 'flex';

                const titleEl = document.getElementById('share-title');
                if (titleEl) titleEl.textContent = title;

                const qrEl = document.getElementById('share-qr') as HTMLImageElement;
                if (qrEl) qrEl.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(url);

                const twitterEl = document.getElementById('share-twitter') as HTMLAnchorElement;
                if (twitterEl) twitterEl.href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url);

                const facebookEl = document.getElementById('share-facebook') as HTMLAnchorElement;
                if (facebookEl) facebookEl.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);

                const whatsappEl = document.getElementById('share-whatsapp') as HTMLAnchorElement;
                if (whatsappEl) whatsappEl.href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(url);

                const linkedinEl = document.getElementById('share-linkedin') as HTMLAnchorElement;
                if (linkedinEl) linkedinEl.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
            };
            (window as any).closeShare = function () {
                const modal = document.getElementById('share-modal');
                if (modal) modal.style.display = 'none';
            };
            (window as any).copyShareLink = function () {
                navigator.clipboard.writeText((window as any).currentShareUrl);
                alert('Link copied to clipboard!');
            };
        };

        const initSubscribeModal = () => {
            (window as any).openSubscribe = function () {
                const modal = document.getElementById('subscribe-modal');
                if (modal) modal.style.display = 'flex';
            };
            (window as any).closeSubscribe = function () {
                const modal = document.getElementById('subscribe-modal');
                if (modal) modal.style.display = 'none';
                const successMsg = document.getElementById('subscribe-success');
                if (successMsg) successMsg.style.display = 'none';
            };
            (window as any).submitSubscribe = function (e: any) {
                e.preventDefault();
                const emailInput = e.target.querySelector('input[type="email"]');
                const email = emailInput ? emailInput.value : '';

                if (email) {
                    // Here you would typically send the email to your backend


                    // Show success message
                    const successMsg = document.getElementById('subscribe-success');
                    if (successMsg) {
                        successMsg.style.display = 'block';
                        successMsg.textContent = 'Thanks for subscribing!';
                    }

                    // Clear input
                    if (emailInput) emailInput.value = '';

                    // Close modal after delay
                    setTimeout(() => {
                        (window as any).closeSubscribe();
                    }, 2000);
                }
            };
        };

        const scanAndInit = () => {
            const timers = containerRef.current?.querySelectorAll('.countdown-timer');
            timers?.forEach(startTimer);
            initInstagramFeeds();
            initThreadsFeeds();
            initYoutubeFeeds();
            initShareModal();
            initSubscribeModal();
        };

        // 1. Immediate scan
        scanAndInit();

        // 2. Observe for DOM changes (robust against hydration/rendering delays)
        const observer = new MutationObserver((mutations) => {
            scanAndInit();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current, { childList: true, subtree: true });
        }

        // 3. Fallback polling (safety net)
        const safetyInterval = window.setInterval(scanAndInit, 500);

        const ensureInstagramEmbeds = () => {
            const root = containerRef.current;
            if (!root) return;

            const hasInstagram = root.querySelector('.instagram-media');
            if (!hasInstagram) return;

            const maybeWindow = window as unknown as {
                instgrm?: { Embeds?: { process?: () => void } };
            };

            const processEmbeds = () => {
                try {
                    maybeWindow.instgrm?.Embeds?.process?.();
                } catch (e) {
                    console.warn('Instagram embed process failed', e);
                }
            };

            if (maybeWindow.instgrm?.Embeds?.process) {
                processEmbeds();
                return;
            }

            const existing = document.getElementById('instagram-embed-script') as HTMLScriptElement | null;
            if (existing) {
                existing.addEventListener('load', processEmbeds, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.id = 'instagram-embed-script';
            script.async = true;
            script.src = 'https://www.instagram.com/embed.js';
            script.onload = processEmbeds;
            document.body.appendChild(script);
        };

        // Instagram embeds don't execute via innerHTML; trigger them explicitly.
        ensureInstagramEmbeds();

        return () => {
            observer.disconnect();
            window.clearInterval(safetyInterval);
            intervals.forEach(window.clearInterval);
        };
    }, [html]);

    return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
};

export const SubDomainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [subdomain, setSubDomain] = useState("");
    const [bio, setBio] = useState<Bio | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);

    useEffect(() => {
        // strip port (e.g. localhost:5173)
        const host = window.location.host.split(':')[0];
        const isLocalhost = host === 'localhost' || host.endsWith('.localhost');
        const parts = host.split('.').filter(Boolean);

        let currentSubdomain = "";

        // Platform domains (Render) can look like: appname.onrender.com
        // In that case, `appname` is NOT a user subdomain.
        const isOnRenderDomain = host.endsWith('.onrender.com');
        const isPortyoDomain = host.endsWith('portyo.me');



        if (isLocalhost) {
            // username.localhost (or username.localhost:5173)
            if (parts.length > 1) currentSubdomain = parts[0];
        } else if (isOnRenderDomain) {
            // Treat subdomain only when there's an extra label before the app name:
            // username.appname.onrender.com
            if (parts.length > 3) currentSubdomain = parts[0];
        } else if (isPortyoDomain) {
            // user.portyo.me
            if (parts.length > 2) currentSubdomain = parts[0];
        } else {
            // Custom domain logic
            // If it's not localhost, not render, and not portyo.me, it's likely a custom domain
            // We need to fetch the bio by custom domain

            fetchBioByCustomDomain(host);
            return;
        }

        if (currentSubdomain === "www") currentSubdomain = "";


        setSubDomain(currentSubdomain);

        if (currentSubdomain) {

            fetchBio(currentSubdomain);
        } else {

            setIsLoading(false);
        }
    }, []);

    const fetchBioByCustomDomain = async (domain: string) => {
        try {
            // We need a new endpoint for this or use a query param
            // For now, let's assume we can search by custom domain
            // This might require backend changes to support finding by custom domain
            // Or we can try to find by sufix if the custom domain is mapped to a sufix

            // Ideally: GET /public/bio/domain/:domain
            const response = await api.get(`/public/bio/domain/${domain}`);
            setBio(response.data);
            setSubDomain(response.data.sufix); // Set the sufix for context consistency

            // Track page view for analytics (Only for Pro users)
            if (response.data.user?.plan === 'pro') {
                try {
                    const sessionId = sessionStorage.getItem('portyo_session') ||
                        Math.random().toString(36).substring(2) + Date.now().toString(36);
                    sessionStorage.setItem('portyo_session', sessionId);

                    await api.post('/public/track', {
                        bioId: response.data.id,
                        referrer: document.referrer || undefined,
                        sessionId
                    });
                } catch (trackError) {
                    // Silently fail tracking
                }
            }
        } catch (error) {
            console.error("Error fetching bio by domain", error);
            setIsNotFound(true);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBio = async (sufix: string) => {
        try {
            const response = await api.get(`/public/bio/${sufix}`);
            setBio(response.data);

            // Track page view for analytics (Only for Pro users)
            if (response.data.user?.plan === 'pro') {
                try {
                    const sessionId = sessionStorage.getItem('portyo_session') ||
                        Math.random().toString(36).substring(2) + Date.now().toString(36);
                    sessionStorage.setItem('portyo_session', sessionId);

                    await api.post('/public/track', {
                        bioId: response.data.id,
                        referrer: document.referrer || undefined,
                        sessionId
                    });
                } catch (trackError) {
                    // Silently fail tracking
                }
            }
        } catch (error) {
            console.error("Error fetching bio", error);
            setIsNotFound(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (subdomain) {
        if (isLoading) {
            return (
                <html lang="en">
                    <head>
                        <meta charSet="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <Meta />
                        <Links />
                    </head>
                    <body>
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                        <Scripts />
                    </body>
                </html>
            );
        }

        if (bio) {
            return (
                <html lang="en">
                    <head>
                        <meta charSet="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>{bio.seoTitle || subdomain}</title>
                        {bio.seoDescription && <meta name="description" content={bio.seoDescription} />}
                        {bio.seoKeywords && <meta name="keywords" content={bio.seoKeywords} />}

                        {/* Custom Favicon - remove default favicons if bio has one */}
                        {bio.favicon ? (
                            <>
                                <link rel="icon" href={bio.favicon} />
                                <script dangerouslySetInnerHTML={{
                                    __html: `
                                        (function() {
                                            // Function to remove default Portyo favicons
                                            function removeDefaultFavicons() {
                                                document.querySelectorAll('link[rel="icon"][href^="/favicons/"]').forEach(function(el) {
                                                    el.parentNode.removeChild(el);
                                                });
                                            }
                                            
                                            // Remove immediately
                                            removeDefaultFavicons();
                                            
                                            // Also observe for any new favicon links and remove them
                                            var observer = new MutationObserver(function(mutations) {
                                                mutations.forEach(function(mutation) {
                                                    mutation.addedNodes.forEach(function(node) {
                                                        if (node.nodeName === 'LINK' && node.rel === 'icon' && node.href && node.href.includes('/favicons/')) {
                                                            node.parentNode.removeChild(node);
                                                        }
                                                    });
                                                });
                                            });
                                            
                                            observer.observe(document.head, { childList: true, subtree: true });
                                            
                                            // Also run after hydration
                                            if (document.readyState === 'loading') {
                                                document.addEventListener('DOMContentLoaded', removeDefaultFavicons);
                                            }
                                            window.addEventListener('load', removeDefaultFavicons);
                                        })();
                                    `
                                }} />
                            </>
                        ) : null}

                        {/* Open Graph / Social Media */}
                        <meta property="og:title" content={bio.ogTitle || bio.seoTitle || subdomain} />
                        <meta property="og:description" content={bio.ogDescription || bio.seoDescription || ""} />
                        {bio.ogImage && <meta property="og:image" content={bio.ogImage} />}
                        <meta property="og:type" content="website" />
                        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />

                        {/* Indexing */}
                        {bio.noIndex && <meta name="robots" content="noindex, nofollow" />}

                        {/* Google Analytics */}
                        {bio.googleAnalyticsId && (
                            <>
                                <script async src={`https://www.googletagmanager.com/gtag/js?id=${bio.googleAnalyticsId}`}></script>
                                <script dangerouslySetInnerHTML={{
                                    __html: `
                                        window.dataLayer = window.dataLayer || [];
                                        function gtag(){dataLayer.push(arguments);}
                                        gtag('js', new Date());
                                        gtag('config', '${bio.googleAnalyticsId}');
                                    `
                                }} />
                            </>
                        )}

                        {/* Facebook Pixel */}
                        {bio.facebookPixelId && (
                            <>
                                <script dangerouslySetInnerHTML={{
                                    __html: `
                                        !function(f,b,e,v,n,t,s)
                                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                                        n.queue=[];t=b.createElement(e);t.async=!0;
                                        t.src=v;s=b.getElementsByTagName(e)[0];
                                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                                        'https://connect.facebook.net/en_US/fbevents.js');
                                        fbq('init', '${bio.facebookPixelId}');
                                        fbq('track', 'PageView');
                                    `
                                }} />
                                <noscript><img height="1" width="1" style={{ display: 'none' }}
                                    src={`https://www.facebook.com/tr?id=${bio.facebookPixelId}&ev=PageView&noscript=1`}
                                /></noscript>
                            </>
                        )}

                        <Meta />
                        <Links />
                    </head>
                    <body>
                        <BioRenderer html={bio.html} />

                        <Scripts />
                    </body>
                </html>
            );
        }

        if (isNotFound) {
            const protocol = window.location.protocol;
            const baseUrl = `${protocol}//portyo.me`;
            const cleanSubdomain = (subdomain || "").replace(/^@+/, "").trim();
            const claimUrl = `${baseUrl}/sign-up?step=1&sufix=${encodeURIComponent(cleanSubdomain)}`;

            return (
                <html lang="en">
                    <head>
                        <meta charSet="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>Bio Not Found</title>
                        <Meta />
                        <Links />
                    </head>
                    <body className="min-h-screen bg-[#F3F3F1] text-[#1A1A1A] font-sans">
                        <div className="min-h-screen flex items-center justify-center p-4">
                            <div className="w-full max-w-md rounded-[28px] border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-7 sm:p-8 text-center">
                                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF7D1] border-2 border-black text-4xl">
                                    🥲
                                </div>

                                <p className="inline-flex items-center rounded-full border border-black/15 bg-black/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 mb-4">
                                    This username is available
                                </p>

                                <h1 className="text-3xl sm:text-[34px] leading-tight font-black tracking-tight mb-3">
                                    Bio not found
                                </h1>

                                <p className="text-[15px] leading-relaxed text-black/60 mb-7">
                                    The bio for <span className="font-extrabold text-black">@{cleanSubdomain}</span> doesn’t exist yet.
                                </p>

                                <div className="space-y-3">
                                    <a
                                        href={claimUrl}
                                        className="block w-full rounded-2xl border-2 border-black bg-[#D2E823] px-6 py-3.5 text-[16px] font-black text-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        Claim @{cleanSubdomain}
                                    </a>

                                    <a
                                        href={`${baseUrl}/`}
                                        className="block w-full rounded-2xl border-2 border-black/15 bg-white px-6 py-3.5 text-[15px] font-bold text-[#1A1A1A] transition-colors hover:bg-black/[0.03]"
                                    >
                                        Go to Portyo Home
                                    </a>
                                </div>
                            </div>
                        </div>
                        <Scripts />
                    </body>
                </html>
            );
        }
    }

    return (
        <SubDomainContext.Provider value={{ subdomain, bio, isLoading, isNotFound }}>
            {children}
        </SubDomainContext.Provider>
    );
};

export default SubDomainContext;