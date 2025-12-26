import React, { useEffect, useRef } from "react";
import { Links, Meta, Scripts, ScrollRestoration } from "react-router";
import { api } from "../services/api";

interface BioLayoutProps {
    bio: any;
    subdomain: string;
}

export const BioLayout: React.FC<BioLayoutProps> = ({ bio, subdomain }) => {
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

                const username = feed.getAttribute('data-username');
                const displayType = feed.getAttribute('data-display-type') || 'grid';
                
                if (!username || username === 'instagram') return;

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

                api.get(`/public/instagram/${username}`)
                    .then(res => res.data)
                    .then(posts => {
                        if (!posts || !Array.isArray(posts) || posts.length === 0) {
                            feed.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#6b7280; font-size:12px;">No posts found</div>';
                            return;
                        }

                        let html = '';
                        posts.slice(0, 3).forEach((post: any) => {
                            html += `<a href="${post.url}" target="_blank" aria-label="View Instagram post" style="display:block; position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6;">
                                <img src="${post.imageUrl}" alt="Instagram post by ${username}" style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.3s;" onload="this.style.opacity=1" onerror="this.style.display='none'" />
                            </a>`;
                        });
                        feed.innerHTML = html;
                    })
                    .catch(err => {
                        console.error("Instagram fetch error:", err);
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
                            html += `<a href="${video.url}" target="_blank" aria-label="Watch YouTube video" style="display:block; position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6;">
                                <img src="${video.imageUrl}" alt="${video.title || 'YouTube video thumbnail'}" style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.3s;" onload="this.style.opacity=1" onerror="this.style.display='none'" />
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
            (window as any).openShare = function(e: any, url: string, title: string) {
                if(e) { e.preventDefault(); e.stopPropagation(); }
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
            (window as any).closeShare = function() {
                const modal = document.getElementById('share-modal');
                if (modal) modal.style.display = 'none';
            };
            (window as any).copyShareLink = function() {
                navigator.clipboard.writeText((window as any).currentShareUrl);
                alert('Link copied to clipboard!');
            };
        };

        const initSubscribeModal = () => {
            (window as any).openSubscribe = function() {
                const modal = document.getElementById('subscribe-modal');
                if (modal) modal.style.display = 'flex';
            };
            (window as any).closeSubscribe = function() {
                const modal = document.getElementById('subscribe-modal');
                if (modal) modal.style.display = 'none';
                const successMsg = document.getElementById('subscribe-success');
                if (successMsg) successMsg.style.display = 'none';
            };
            (window as any).submitSubscribe = function(e: any) {
                e.preventDefault();
                const emailInput = e.target.querySelector('input[type="email"]');
                const email = emailInput ? emailInput.value : '';
                
                if (email) {
                    console.log('Subscribing email:', email);
                    const successMsg = document.getElementById('subscribe-success');
                    if (successMsg) {
                        successMsg.style.display = 'block';
                        successMsg.textContent = 'Thanks for subscribing!';
                    }
                    if (emailInput) emailInput.value = '';
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
            initYoutubeFeeds();
            initShareModal();
            initSubscribeModal();
        };

        scanAndInit();

        const observer = new MutationObserver((mutations) => {
            scanAndInit();
        });
        
        if (containerRef.current) {
            observer.observe(containerRef.current, { childList: true, subtree: true });
        }

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

        ensureInstagramEmbeds();
        
        return () => {
            observer.disconnect();
            window.clearInterval(safetyInterval);
            intervals.forEach(window.clearInterval);
        };
    }, [bio.html]);

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{bio.seoTitle || subdomain}</title>
                {bio.seoDescription && <meta name="description" content={bio.seoDescription} />}
                {bio.seoKeywords && <meta name="keywords" content={bio.seoKeywords} />}
                {bio.favicon && <link rel="icon" href={bio.favicon} />}
                
                {/* Canonical */}
                <link rel="canonical" href={`https://${bio.sufix}.portyo.me`} />

                {/* Open Graph / Social Media */}
                <meta property="og:title" content={bio.ogTitle || bio.seoTitle || subdomain} />
                <meta property="og:description" content={bio.ogDescription || bio.seoDescription || ""} />
                {bio.ogImage && <meta property="og:image" content={bio.ogImage} />}
                <meta property="og:type" content="profile" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={bio.seoTitle || subdomain} />
                <meta name="twitter:description" content={bio.seoDescription || ""} />
                {bio.ogImage && <meta name="twitter:image" content={bio.ogImage} />}

                {/* Indexing */}
                {bio.noIndex && <meta name="robots" content="noindex, nofollow" />}

                {/* JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ProfilePage",
                            "mainEntity": {
                                "@type": "Person",
                                "name": bio.seoTitle || subdomain,
                                "description": bio.seoDescription,
                                "image": bio.ogImage
                            }
                        }),
                    }}
                />

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
                        <noscript><img height="1" width="1" style={{display:'none'}}
                        src={`https://www.facebook.com/tr?id=${bio.facebookPixelId}&ev=PageView&noscript=1`}
                        /></noscript>
                    </>
                )}

                <Links />
            </head>
            <body>
                <div ref={containerRef} dangerouslySetInnerHTML={{ __html: bio.html.replace(/(<img\s+)(src="\/users-photos\/[^"]+")/i, '$1fetchpriority="high" $2') }} suppressHydrationWarning={true} />
                <Scripts />
            </body>
        </html>
    );
};
