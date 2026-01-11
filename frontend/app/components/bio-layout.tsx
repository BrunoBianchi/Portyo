import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Links, Meta, Scripts, ScrollRestoration, useLocation } from "react-router";
import { api } from "../services/api";
const BlogPostPopup = React.lazy(() => import("./blog-post-popup").then(module => ({ default: module.BlogPostPopup })));
const BookingWidget = React.lazy(() => import("./booking-widget").then(module => ({ default: module.BookingWidget })));
import { BlogPostView } from "./blog-post-view";

import { sanitizeHtml } from "../utils/security";

import { useBioScripts } from "~/hooks/use-bio-scripts";

const BioContent = React.memo(React.forwardRef<HTMLDivElement, { html: string; bio: any }>(({ html, bio }, ref) => {
    return <div ref={ref} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} suppressHydrationWarning={true} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }} />;
}));
BioContent.displayName = 'BioContent';

interface BioLayoutProps {
    bio: any;
    subdomain: string;
    isPreview?: boolean;
}

const decodeHtmlFromBase64 = (html?: string | null, htmlBase64?: string | null) => {
    if (html && typeof html === "string") return html;

    if (htmlBase64 && typeof htmlBase64 === "string") {
        try {
            if (typeof Buffer !== "undefined") {
                return Buffer.from(htmlBase64, "base64").toString("utf-8");
            }
            if (typeof atob !== "undefined") {
                return decodeURIComponent(escape(atob(htmlBase64)));
            }
        } catch (error) {
            console.error("BioLayout decode error", error);
        }
    }

    return "";
};

export const BioLayout: React.FC<BioLayoutProps> = ({ bio, subdomain, isPreview = false }) => {
    useBioScripts(bio);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [popupConfig, setPopupConfig] = useState<any>({});
    const [showPromo, setShowPromo] = useState(true);

    // Check if we're on a blog post page
    const location = useLocation();
    const blogPostMatch = location.pathname.match(/^\/blog\/post\/([a-f0-9-]+)$/i);
    const blogPostId = blogPostMatch ? blogPostMatch[1] : null;

    const htmlContent = decodeHtmlFromBase64(bio?.html, (bio as any)?.htmlBase64);
    const usernameColor = bio?.usernameColor || '#000000';

    const displayName = bio?.seoTitle || subdomain || '';
    const avatarFallback = (displayName || 'U').charAt(0).toUpperCase();

    // Try to extract profile image from HTML content if not provided in bio object
    const headerImageSrc = bio?.profileImage || (htmlContent && htmlContent.match(/src="(\/users-photos\/[^\"]+)"/)?.[1]);

    // If we're on a blog post page, render the BlogPostView instead
    if (blogPostId) {
        if (isPreview) {
            return <BlogPostView postId={blogPostId} bio={bio} subdomain={subdomain} />;
        }
        return (
            <html lang="en">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="robots" content="index, follow" />
                    <title>{bio?.seoTitle || subdomain} | Blog</title>
                    <meta name="description" content={bio?.seoDescription || ''} />
                    <meta property="og:type" content="article" />
                    <meta property="og:site_name" content={bio?.seoTitle || subdomain} />
                    {bio?.ogImage && <meta property="og:image" content={bio.ogImage} />}
                    <Meta />
                    <Links />
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    />
                </head>
                <body style={{ margin: 0, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <BlogPostView postId={blogPostId} bio={bio} subdomain={subdomain} />
                    <ScrollRestoration />
                    <Scripts />
                </body>
            </html>
        );
    }

    // Fixed Background Parallax Effect - REMOVED




    // Track bio_visit event for automation
    useEffect(() => {
        if (typeof window === 'undefined' || !bio?.id || isPreview) return;

        // Only track once per session
        const visitKey = `portyo_visited_${bio.id}`;
        if (sessionStorage.getItem(visitKey)) return;
        sessionStorage.setItem(visitKey, 'true');

        // Fire bio_visit event
        api.post(`/public/events/${bio.id}`, {
            eventType: 'bio_visit',
            data: {
                referrer: document.referrer || 'direct',
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        }).catch(err => {/* bio_visit tracking failed */ });
    }, [bio?.id, isPreview]);

    // Path-based tab sync is handled inside initTabs/onpopstate; avoid extra listeners to prevent repeated calls.

    useEffect(() => {
        if (isPreview) return; // Skip scripts and dynamic content loading in preview mode
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


        const initBookingWidgets = () => {
            const root = containerRef.current;
            if (!root) return;

            const bookingBlocks = root.querySelectorAll('.custom-booking-block');
            bookingBlocks.forEach(block => {
                if (block.hasAttribute('data-initialized')) return;
                block.setAttribute('data-initialized', 'true');

                const title = block.getAttribute('data-title') || 'Book a Call';
                const description = block.getAttribute('data-description') || '';
                const bioIdStr = block.getAttribute('data-bio-id');

                if (!bioIdStr) return;

                // Clear placeholder content as React component will handle the UI
                block.innerHTML = '';

                const reactRoot = createRoot(block);
                reactRoot.render(
                    <React.Suspense fallback={<div className="h-24 w-full bg-gray-50 flex items-center justify-center rounded-lg"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                        <BookingWidget
                            bioId={bioIdStr}
                            title={title}
                            description={description}
                        />
                    </React.Suspense>
                );
            });
        };

        const initProductLinks = () => {
            const root = containerRef.current;
            if (!root) return;

            const links = root.querySelectorAll('.product-item-link');
            links.forEach(link => {
                if (link.hasAttribute('data-initialized')) return;
                link.setAttribute('data-initialized', 'true');

                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const productId = link.getAttribute('data-product-id');
                    if (!productId) return;

                    // Show loading state if needed, e.g. change cursor or opacity
                    (link as HTMLElement).style.opacity = '0.7';
                    (link as HTMLElement).style.pointerEvents = 'none';

                    try {
                        const res = await api.post('/public/stripe/generate-product-link', {
                            productId,
                            bioId: bio.id
                        });

                        if (res.data && res.data.url) {
                            const width = 600;
                            const height = 800;
                            const left = (window.screen.width - width) / 2;
                            const top = (window.screen.height - height) / 2;
                            window.open(
                                res.data.url,
                                'StripeCheckout',
                                `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
                            );
                        }
                    } catch (error: any) {
                        console.error("Failed to generate product link", error);
                        const message = error.response?.data?.message || "Failed to load product. Please try again.";
                        alert(message);
                    } finally {
                        (link as HTMLElement).style.opacity = '1';
                        (link as HTMLElement).style.pointerEvents = 'auto';
                    }
                });
            });
        };

        const initTabs = () => {
            (window as any).blogLoaded = false;
            (window as any).shopLoaded = false;

            (window as any).openProductPayment = (url: string) => {
                if (!url) return;
                const width = 600;
                const height = 800;
                const left = (window.screen.width - width) / 2;
                const top = (window.screen.height - height) / 2;
                window.open(
                    url,
                    'StripeCheckout',
                    `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
                );
            };



            (window as any).loadProducts = async () => {
                const container = document.getElementById('shop-products-container');
                if (!container) return;

                try {
                    const response = await api.get(`/public/products/${bio.id}`);
                    const products = response.data;
                    (window as any).shopLoaded = true;

                    if (products.length === 0) {
                        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#6b7280;">No products found.</div>';
                        return;
                    }

                    const escapeHtml = (text: string) => {
                        if (!text) return "";
                        return text
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;");
                    };

                    container.innerHTML = products.map((product: any) => {
                        const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.price || 0);
                        const image = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/300x300?text=Product';


                        return `
                        <a href="javascript:;" role="button" data-product-id="${product.id}" class="product-card-item" style="display:flex; flex-direction:column; background:white; border-radius:24px; overflow:hidden; box-shadow:0 4px 20px -8px rgba(0,0,0,0.08); border:1px solid rgba(0,0,0,0.04); text-decoration:none; transition:all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); height:100%; position:relative;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 30px -10px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px -8px rgba(0,0,0,0.08)'">
                            <div style="position:relative; aspect-ratio:1; overflow:hidden; background:#f3f4f6;">
                                <img src="${image}" alt="${escapeHtml(product.name)}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" />
                                <div style="position:absolute; bottom:12px; left:12px; background:rgba(255,255,255,0.9); backdrop-filter:blur(8px); padding:6px 14px; border-radius:99px; color:#111827; font-size:13px; font-weight:700; box-shadow:0 4px 10px rgba(0,0,0,0.08);">
                                    ${price}
                                </div>
                            </div>
                            <div style="padding:16px; flex:1; display:flex; flex-direction:column;">
                                <h3 style="font-size:16px; font-weight:700; color:#111827; margin:0 0 12px 0; line-height:1.4; flex:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(product.name)}</h3>
                                <div style="background:#111827; color:white; text-align:center; padding:12px; border-radius:14px; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:8px;">
                                    <span>View Product</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </div>
                            </div>
                        </a>
                        `;
                    }).join('');

                    // Attach event listeners manually to avoid inline script issues
                    const productCards = container.querySelectorAll('.product-card-item');
                    productCards.forEach((card: any) => {
                        card.addEventListener('click', async (e: any) => {
                            e.preventDefault();
                            const productId = card.getAttribute('data-product-id');
                            if (!productId) return;

                            // Show loading state
                            card.style.opacity = '0.7';
                            card.style.pointerEvents = 'none';

                            try {
                                const res = await api.post('/public/stripe/generate-product-link', {
                                    productId,
                                    bioId: bio.id
                                });

                                if (res.data && res.data.url) {
                                    (window as any).openProductPayment(res.data.url);
                                }
                            } catch (error: any) {
                                console.error("Failed to generate product link", error);
                                const message = error.response?.data?.message || "Failed to load product. Please try again.";
                                alert(message);
                            } finally {
                                card.style.opacity = '1';
                                card.style.pointerEvents = 'auto';
                            }
                        });
                    });

                } catch (err) {
                    console.error(err);
                    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#ef4444;">Failed to load products.</div>';
                }
            };

            (window as any).loadBlogPosts = async () => {
                const container = document.getElementById('blog-posts-container');
                if (!container) return;

                try {
                    const response = await api.get(`/public/blog/${bio.id}`);
                    const posts = response.data;
                    (window as any).blogLoaded = true;

                    if (posts.length === 0) {
                        container.innerHTML = '<div style="text-align:center; padding:40px; color:#6b7280;">No posts yet.</div>';
                        return;
                    }

                    const escapeHtml = (text: string) => {
                        if (!text) return "";
                        return text
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;");
                    };

                    const renderCards = () => {
                        const cardsHtml = posts.map((post: any, index: number) => {
                            const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
                            const readTime = Math.max(1, Math.ceil(wordCount / 200));

                            let image = 'https://placehold.co/600x400?text=Blog+Post';
                            const imgMatch = post.content && post.content.match(/<img[^>]+src="([^">]+)"/);
                            if (imgMatch) image = imgMatch[1];

                            const authorName = bio.seoTitle || subdomain || 'Author';
                            const authorImage = bio.profileImage || bio.favicon || bio.ogImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

                            return `
                                <div class="blog-card-item" data-index="${index}" onclick="(function(){ window.location.href='/blog/post/' + '${post.id}'; })()" style="
                                    background:white; border-radius:24px; overflow:hidden; box-shadow:0 8px 25px -8px rgba(0,0,0,0.08); 
                                    border:1px solid rgba(0,0,0,0.03); padding:20px; text-decoration:none; cursor:pointer;
                                    display:flex; flex-wrap:wrap; align-items:flex-start; min-height:180px;
                                    position: ${posts.length > 1 ? 'absolute' : 'relative'}; top:0; left:0; right:0;
                                    transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                                    transform-origin: top center;
                                    background: #ffffff;
                                ">
                                    <!-- Content -->
                                    <div style="flex:1; min-width:200px; padding-right:16px; display:flex; flex-direction:column;">
                                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                                            <div style="width:24px; height:24px; border-radius:50%; background:#f3f4f6; overflow:hidden;">
                                                <img src="${authorImage}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=User'" />
                                            </div>
                                            <span style="font-size:12px; font-weight:600; color:#374151;">${escapeHtml(authorName)}</span>
                                        </div>
                                        <h3 style="font-size:18px; font-weight:800; color:#111827; margin:0 0 8px 0; line-height:1.3; letter-spacing:-0.01em; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                            ${escapeHtml(post.title)}
                                        </h3>
                                        <div style="margin-top:auto; display:flex; align-items:center; justify-content:space-between; width:100%; padding-top:12px;">
                                            <div style="font-size:12px; color:#6b7280; font-weight:500;">
                                                ${date} <span style="margin:0 4px; opacity:0.5">•</span> ${readTime} min read
                                            </div>
                                            <div style="display:flex; align-items:center; gap:12px; color:#4b5563; font-size:13px; font-weight:600;">
                                                <div style="display:flex; align-items:center; gap:4px;">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                                    <span>${Math.floor(Math.random() * 500) + 100}</span>
                                                </div>
                                                <div style="display:flex; align-items:center; gap:4px;">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                                    <span>${Math.floor(Math.random() * 200) + 20}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Image -->
                                    <div style="width:120px; height:120px; flex-shrink:0;">
                                        <div style="width:100%; height:100%; border-radius:12px; overflow:hidden; background:#f3f4f6;">
                                            <img src="${image}" alt="${escapeHtml(post.title)}" style="width:100%; height:100%; object-fit:cover;" />
                                        </div>
                                    </div>
                                </div>`;
                        }).join('');

                        if (posts.length <= 1) {
                            return cardsHtml;
                        }

                        // Stacked Layout Controls
                        const controls = `
                            <div style="display:flex; justify-content:center; gap:16px; margin-top:24px; padding-top:220px;">
                                <button onclick="window.changeBlogStack(-1)" style="width:44px; height:44px; border-radius:50%; background:white; border:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.05); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <button onclick="window.changeBlogStack(1)" style="width:44px; height:44px; border-radius:50%; background:#111827; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.15); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        `;

                        return '<div style="position:relative; height:auto; min-height:260px;">' + cardsHtml + controls + '</div>';
                    };

                    container.innerHTML = renderCards();

                    // Init stack logic for preview
                    if (posts.length > 1) {
                        let activeIndex = 0;
                        const total = posts.length;

                        const updateCards = () => {
                            if (!container) return;
                            const cards = container.querySelectorAll('.blog-card-item');
                            cards.forEach((card: any, i: number) => {
                                const offset = (i - activeIndex + total) % total;
                                if (offset === 0) {
                                    card.style.zIndex = 10;
                                    card.style.opacity = 1;
                                    card.style.transform = 'translateY(0) scale(1)';
                                    card.style.pointerEvents = 'auto';
                                } else if (offset === 1) {
                                    card.style.zIndex = 9;
                                    card.style.opacity = 1;
                                    card.style.transform = 'translateY(16px) scale(0.97)';
                                    card.style.pointerEvents = 'none';
                                } else if (offset === 2) {
                                    card.style.zIndex = 8;
                                    card.style.opacity = 0.8;
                                    card.style.transform = 'translateY(32px) scale(0.94)';
                                    card.style.pointerEvents = 'none';
                                } else {
                                    card.style.zIndex = 1;
                                    card.style.opacity = 0;
                                    card.style.pointerEvents = 'none';
                                    card.style.transform = 'translateY(48px) scale(0.9)';
                                }
                            });
                        };

                        (window as any).changeBlogStack = (dir: number) => {
                            activeIndex = (activeIndex + dir + total) % total;
                            updateCards();
                        };

                        setTimeout(updateCards, 50);
                    }

                } catch (err) {
                    console.error(err);
                    container.innerHTML = '<div style="text-align:center; padding:40px; color:#ef4444;">Failed to load posts.</div>';
                }
            };

            // Handle Back/Forward
            window.onpopstate = function (event) {
                if (window.location.pathname === '/blog') {
                    (window as any).switchTab('blog');
                } else if (window.location.pathname === '/shop') {
                    (window as any).switchTab('shop');
                } else {
                    (window as any).switchTab('links');
                }
            };

            // Initial Load
            const initial = () => {
                if (typeof (window as any).switchTab !== 'function') return;

                const path = window.location.pathname;
                if (path === '/blog') {
                    (window as any).switchTab('blog');
                } else if (path === '/shop') {
                    (window as any).switchTab('shop');
                } else {
                    (window as any).switchTab('links');
                }
            };

            setTimeout(initial, 40);
            setTimeout(initial, 140);
            setTimeout(initial, 500); // extra retry
        };

        initTabs();

        // Throttled scanner to avoid re-initializing on every scroll/layout mutation
        let scanTimeout: number | null = null;
        let lastScan = 0;
        const SCAN_MIN_INTERVAL = 1200; // ms between scans
        const SCHEDULE_DELAY = 180; // debounce delay

        const scanAndInit = () => {
            const now = Date.now();
            if (now - lastScan < SCAN_MIN_INTERVAL) return;
            lastScan = now;

            const timers = containerRef.current?.querySelectorAll('.countdown-timer');
            timers?.forEach(startTimer);
            initInstagramFeeds();
            initYoutubeFeeds();
            initBlogFeeds();
            initShareModal();
            initSubscribeModal();
            initProductLinks();
            initBookingWidgets();
            initLinkClickTracking();
        };

        // Track link clicks for automation
        const initLinkClickTracking = () => {
            const root = containerRef.current;
            if (!root || !bio?.id) return;

            const links = root.querySelectorAll('a[href^="http"], a[href^="https"]');
            links.forEach(link => {
                if (link.hasAttribute('data-click-tracked')) return;
                link.setAttribute('data-click-tracked', 'true');

                link.addEventListener('click', () => {
                    const href = link.getAttribute('href') || '';
                    const label = link.getAttribute('aria-label') || link.textContent?.trim() || '';

                    // Fire link_click event (async, don't block navigation)
                    api.post(`/public/events/${bio.id}`, {
                        eventType: 'link_click',
                        data: {
                            url: href,
                            label: label.substring(0, 100),
                            timestamp: new Date().toISOString()
                        }
                    }).catch(() => { });
                });
            });
        };

        const scheduleScan = () => {
            if (scanTimeout !== null) return;
            scanTimeout = window.setTimeout(() => {
                scanTimeout = null;
                scanAndInit();
            }, SCHEDULE_DELAY);
        };

        // Initial scan
        scanAndInit();

        const observer = new MutationObserver(() => {
            scheduleScan();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current, { childList: true, subtree: true });
        }

        // Safety re-scan, less frequent to avoid churn while scrolling
        const safetyInterval = window.setInterval(scanAndInit, 15000);

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
            if (scanTimeout !== null) window.clearTimeout(scanTimeout);
            window.clearInterval(safetyInterval);
            intervals.forEach(window.clearInterval);
        };
    }, [htmlContent]);

    // Analytics Tracking Effect
    useEffect(() => {
        if (isPreview) return;
        if (!bio.googleAnalyticsId) return;

        const w = window as any;
        // Ensure dataLayer exists
        w.dataLayer = w.dataLayer || [];
        function gtag(...args: any[]) { w.dataLayer.push(args); }



        // 1. Click Tracking (Delegation)
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');
            const button = target.closest('button');

            if (link) {
                const url = link.href;
                const text = link.innerText || link.getAttribute('aria-label') || 'Link';



                gtag('event', 'click', {
                    event_category: 'outbound',
                    event_label: url,
                    transport_type: 'beacon',
                    link_url: url,
                    link_text: text
                });

                // Also track as a custom event for easier reporting
                gtag('event', 'link_click', {
                    url: url,
                    text: text
                });
            }

            if (button) {
                const text = button.innerText || 'Button';


                gtag('event', 'click', {
                    event_category: 'interaction',
                    event_label: text,
                    button_text: text
                });
            }
        };

        // 2. Scroll Tracking
        let maxScroll = 0;
        const handleScroll = () => {
            const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
            // Track at 25, 50, 75, 90%
            if (scrollPercent > maxScroll) {
                const thresholds = [25, 50, 75, 90];
                thresholds.forEach(t => {
                    if (maxScroll < t && scrollPercent >= t) {

                        gtag('event', 'scroll_depth', {
                            event_category: 'engagement',
                            event_label: `${t}%`,
                            value: t
                        });
                    }
                });
                maxScroll = scrollPercent;
            }
        };

        // 3. Time on Screen (Heartbeat)
        const timeIntervals = [10, 30, 60, 120, 300]; // seconds
        const timers = timeIntervals.map(seconds => {
            return setTimeout(() => {

                gtag('event', 'time_on_page', {
                    event_category: 'engagement',
                    event_label: `${seconds}s`,
                    value: seconds
                });
            }, seconds * 1000);
        });

        document.addEventListener('click', handleClick);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('click', handleClick);
            window.removeEventListener('scroll', handleScroll);
            timers.forEach(clearTimeout);
        };
    }, [bio.googleAnalyticsId]);

    const Wrapper = isPreview ? React.Fragment : 'html';
    const BodyWrapper = isPreview ? 'div' : 'body';
    const wrapperProps = isPreview ? {} : { lang: 'en' };
    const bodyProps = isPreview
        ? { className: "portyo-bio-preview-root w-full h-full overflow-y-auto relative" }
        : { style: { margin: 0, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' } };

    const navStyles = `
                        ${isPreview ? '.portyo-bio-preview-root' : 'html, body'} {
                            margin: 0;
                            padding: 0;
                            min-height: 100vh;
                            width: 100%;
                            background-color: ${bio?.bgColor || bio?.cardBackgroundColor || '#f3f4f6'};
                        }

    `;

    return (
        <Wrapper {...wrapperProps}>
            {!isPreview && (
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
                                    "image": bio.ogImage,
                                    "url": `https://${bio.sufix}.portyo.me`,
                                    "sameAs": bio.socialLinks ? Object.values(bio.socialLinks).filter(Boolean) : []
                                }
                            }),
                        }}
                    />

                    {/* Google Analytics */}
                    {bio.googleAnalyticsId && (
                        <>
                            <script dangerouslySetInnerHTML={{
                                __html: ``
                            }} />
                            <script async src={`https://www.googletagmanager.com/gtag/js?id=${bio.googleAnalyticsId}`}></script>
                            <script dangerouslySetInnerHTML={{
                                __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${bio.googleAnalyticsId}',{
                                'debug_mode': true});
                            `
                            }} />
                        </>
                    )}

                    {/* Google Search Console Verification */}
                    {bio.googleAnalyticsId && (
                        <meta name="google-site-verification" content={bio.googleAnalyticsId} />
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

                    <Links />
                    <style dangerouslySetInnerHTML={{ __html: navStyles }} />
                </head>
            )}

            {isPreview && (
                <style dangerouslySetInnerHTML={{ __html: navStyles }} />
            )}

            <BodyWrapper {...bodyProps}>


                {selectedPost && (
                    <React.Suspense fallback={null}>
                        <BlogPostPopup
                            post={selectedPost}
                            onClose={() => setSelectedPost(null)}
                            config={popupConfig}
                        />
                    </React.Suspense>
                )}
                <BioContent ref={containerRef} bio={bio} html={(htmlContent || "")
                    .replace(/(<img\s+)(src="\/users-photos\/[^"]+")/i, '$1fetchpriority="high" $2')
                    .replace(/(<img\s+)(?!.*fetchpriority)(?!.*loading)([^>]+>)/gi, '$1loading="lazy" decoding="async" $2')
                    .replace(/<\/div>\s*$/, bio.removeBranding ? '</div>' : `
                <div style="display:flex;justify-content:center;padding:24px 0 32px 0;width:100%;position:relative;z-index:10">
                    <a href="https://portyo.me" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 6px; text-decoration: none; font-size: 12px; color: #4b5563; font-weight: 500; padding: 6px 14px; border-radius: 999px; background-color: rgba(255, 255, 255, 0.5); border: 1px solid rgba(0, 0, 0, 0.05); transition: all 0.2s ease;">
                        <span>Powered by</span>
                        <span style="font-weight:800; color:#111827;">Portyo</span>
                    </a>
                </div>
                </div>`)} />

                {/* Sticky Promo Banner */}
                {!isPreview && showPromo && !bio.removeBranding && (
                    <div style={{
                        position: 'fixed',
                        bottom: '24px',
                        left: '24px',
                        width: 'auto',
                        minWidth: '320px',
                        maxWidth: '380px',
                        zIndex: 995,
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                                @keyframes slideUp {
                                    from { transform: translateY(100%); opacity: 0; }
                                    to { transform: translateY(0); opacity: 1; }
                                }
                            `
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #FF4D4D 0%, #F9CB28 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                flexShrink: 0
                            }}>P</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827', lineHeight: '1.2' }}>Portyo</span>
                                <span style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280', lineHeight: '1.2' }}>Create your bio link today!</span>
                            </div>
                        </div>
                        <a href="https://portyo.me" target="_blank" rel="noopener noreferrer" style={{
                            background: '#111827',
                            color: 'white',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap'
                        }}>
                            Get it
                        </a>
                        <button
                            onClick={() => setShowPromo(false)}
                            aria-label="Close"
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-8px',
                                background: 'white',
                                border: '1px solid rgba(0,0,0,0.08)',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6B7280',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                padding: 0
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                )}
                <Scripts />
            </BodyWrapper>
        </Wrapper>
    );
};

export default BioLayout;

