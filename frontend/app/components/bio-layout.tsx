import React, { useEffect, useRef, useState } from "react";
import { Links, Meta, Scripts, ScrollRestoration } from "react-router";
import { api } from "../services/api";
import { BlogPostPopup } from "./blog-post-popup";

interface BioLayoutProps {
    bio: any;
    subdomain: string;
}

export const BioLayout: React.FC<BioLayoutProps> = ({ bio, subdomain }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [popupConfig, setPopupConfig] = useState<any>({});

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
                    api.post(`/public/email/subscribe/${bio.id}`, { email })
                        .then(() => {
                            const successMsg = document.getElementById('subscribe-success');
                            if (successMsg) {
                                successMsg.style.display = 'block';
                                successMsg.textContent = 'Thanks for subscribing!';
                            }
                            if (emailInput) emailInput.value = '';
                            setTimeout(() => {
                                (window as any).closeSubscribe();
                            }, 2000);
                        })
                        .catch((err) => {
                            console.error('Subscription error:', err);
                            const successMsg = document.getElementById('subscribe-success');
                            if (successMsg) {
                                successMsg.style.display = 'block';
                                successMsg.style.color = 'red';
                                successMsg.textContent = 'Failed to subscribe. Please try again.';
                            }
                        });
                }
            };
        };

        const initBlogFeeds = () => {
            const root = containerRef.current;
            if (!root) return;

            const feeds = root.querySelectorAll('.custom-blog-feed');
            feeds.forEach(feed => {
                if (feed.hasAttribute('data-initialized')) return;
                feed.setAttribute('data-initialized', 'true');

                const layout = feed.getAttribute('data-layout') || 'carousel';
                const cardStyle = feed.getAttribute('data-card-style') || 'featured';
                const popupStyle = feed.getAttribute('data-popup-style') || 'modern';
                const bgColor = feed.getAttribute('data-bg-color') || '#ffffff';
                const titleColor = feed.getAttribute('data-title-color') || '#1f2937';
                const textColor = feed.getAttribute('data-text-color') || '#4b5563';
                const dateColor = feed.getAttribute('data-date-color') || '#f59e0b';
                const tagBg = feed.getAttribute('data-tag-bg') || '#f3f4f6';
                const tagText = feed.getAttribute('data-tag-text') || '#4b5563';

                api.get(`/blog/${bio.id}?publicView=true`)
                    .then(res => res.data)
                    .then(posts => {
                        if (!posts || !Array.isArray(posts) || posts.length === 0) {
                            feed.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#6b7280; font-size:12px;">No posts found</div>';
                            return;
                        }

                        const esc = (s: string) => s ? s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") : "";

                        const cardsHtml = posts.map((post: any) => {
                            const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const description = post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '';
                            const image = "https://placehold.co/600x400/e2e8f0/94a3b8?text=Post"; 
                            const category = "Blog";
                            const readTime = "5 min read";
                            const author = "By You";

                            if (cardStyle === "featured") {
                                return `
                                  <article style="flex:0 0 200px; scroll-snap-align:start; background:${bgColor}; border-radius:20px; padding:12px; display:flex; flex-direction:column; gap:10px; min-width:200px;">
                                    <div style="background:#e2e8f0; border-radius:12px; aspect-ratio:16/10; width:100%; overflow:hidden;">
                                       <img src="${image}" alt="${esc(post.title)}" style="width:100%; height:100%; object-fit:cover;" />
                                    </div>
                                    <div style="display:flex; gap:6px;">
                                      <span style="background:${tagBg}; color:${tagText}; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:600;">${category}</span>
                                      <span style="background:${tagBg}; color:${tagText}; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:600;">${readTime}</span>
                                    </div>
                                    <h3 style="font-size:16px; font-weight:800; line-height:1.3; color:${titleColor}; margin:0;">${esc(post.title)}</h3>
                                    <div style="display:flex; items-center; gap:6px; margin-top:auto;">
                                      <div style="width:20px; height:20px; background:#d1d5db; border-radius:50%;"></div>
                                      <span style="font-size:12px; color:${textColor};">${author}</span>
                                    </div>
                                  </article>
                                `;
                            } else if (cardStyle === "modern") {
                                const widthStyle = layout === 'carousel' ? 'flex:0 0 280px; min-width:280px; border-right:1px solid #f3f4f6; padding-right:24px; margin-right:8px;' : 'width:100%; border-bottom:1px solid #f3f4f6; padding-bottom:16px; margin-bottom:16px;';
                                return `
                                  <article style="${widthStyle} scroll-snap-align:start; display:flex; flex-direction:column; gap:8px;">
                                    <div style="font-size:12px; font-weight:700; color:${dateColor}; margin-bottom:4px;">${date}</div>
                                    <h3 style="font-size:18px; font-weight:700; line-height:1.2; color:${titleColor}; margin:0;">${esc(post.title)}</h3>
                                    <div style="font-size:12px; font-weight:500; opacity:0.8; color:${textColor}; margin-bottom:8px;">${category} • ${readTime}</div>
                                    <p style="font-size:12px; line-height:1.6; color:${textColor}; opacity:0.8; margin:0 0 12px 0; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${esc(description)}</p>
                                  </article>
                                `;
                            } else {
                                return `
                                  <article style="flex:0 0 160px; scroll-snap-align:start; background:${bgColor}; border:1px solid #e5e7eb; border-radius:16px; padding:14px; min-width:160px;">
                                    <h3 style="font-size:14px; font-weight:700; color:${titleColor}; margin:0 0 6px 0;">${esc(post.title)}</h3>
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                      <span style="font-size:11px; color:${textColor};">${readTime}</span>
                                      <span style="font-size:11px; font-weight:500; color:${dateColor};">Read more &rarr;</span>
                                    </div>
                                  </article>
                                `;
                            }
                        }).join("");

                        feed.innerHTML = cardsHtml;

                        // Add click listeners
                        feed.querySelectorAll('article').forEach((article, index) => {
                            article.style.cursor = 'pointer';
                            article.addEventListener('click', () => {
                                const post = posts[index];
                                setPopupConfig({
                                    style: popupStyle as any,
                                    backgroundColor: feed.getAttribute('data-popup-bg-color') || '#ffffff',
                                    textColor: feed.getAttribute('data-popup-text-color') || '#1f2937',
                                    overlayColor: feed.getAttribute('data-popup-overlay-color') || 'rgba(0, 0, 0, 0.5)'
                                });
                                setSelectedPost({
                                    ...post,
                                    date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                    image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Post",
                                    author: "By You"
                                });
                            });
                        });
                    })
                    .catch(err => {
                        console.error("Blog fetch error:", err);
                    });
            });
        };

        const scanAndInit = () => {
            const timers = containerRef.current?.querySelectorAll('.countdown-timer');
            timers?.forEach(startTimer);
            initInstagramFeeds();
            initYoutubeFeeds();
            initBlogFeeds();
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
                {selectedPost && (
                    <BlogPostPopup 
                        post={selectedPost} 
                        onClose={() => setSelectedPost(null)} 
                        config={popupConfig}
                    />
                )}
                <div ref={containerRef} dangerouslySetInnerHTML={{ __html: bio.html.replace(/(<img\s+)(src="\/users-photos\/[^"]+")/i, '$1fetchpriority="high" $2') }} suppressHydrationWarning={true} />
                <Scripts />
            </body>
        </html>
    );
};
