import { useEffect } from 'react';

export const useBioScripts = (bio: any) => {
    useEffect(() => {
        if (!bio) return;

        // --- Helper Constants ---
        // Derived from bio or defaults, matching html-generator logic as best as possible
        const usernameColor = bio.usernameColor || '#111827';
        const navTextColor = usernameColor;
        const navInactive = usernameColor; 
        const navIndicator = usernameColor;

        // --- Tab Switching Logic ---
        (window as any).switchTab = (tabName: string) => {
            const linksTab = document.getElementById('tab-links');
            const shopTab = document.getElementById('tab-shop');
            const blogTab = document.getElementById('tab-blog');
            const linksFeed = document.getElementById('links-feed');
            const shopFeed = document.getElementById('shop-feed');
            const blogFeed = document.getElementById('blog-feed');
            
            // Reset all
            [linksTab, shopTab, blogTab].forEach(t => {
                if(t) {
                    t.style.color = navInactive;
                    t.style.opacity = '0.9';
                    const indicator = t.querySelector('span');
                    if (indicator) indicator.style.background = 'transparent';
                }
            });
            [linksFeed, shopFeed, blogFeed].forEach(f => {
                if(f) f.style.display = 'none';
            });

            const activate = (tab: HTMLElement | null, feed: HTMLElement | null) => {
                if (tab) {
                    tab.style.color = navTextColor;
                    tab.style.opacity = '1';
                    const indicator = tab.querySelector('span');
                    if (indicator) indicator.style.background = navIndicator;
                }
                if (feed) feed.style.display = 'block';
            };

            if (tabName === 'shop') {
                activate(shopTab, shopFeed);
                if (!(window as any).shopLoaded) {
                    (window as any).loadProducts();
                }
                if (window.location.pathname !== '/shop') {
                    window.history.pushState({ tab: 'shop' }, '', '/shop');
                }
            } else if (tabName === 'blog') {
                activate(blogTab, blogFeed);
                if (!(window as any).blogLoaded) {
                    (window as any).loadBlogPosts();
                }
                if (window.location.pathname !== '/blog') {
                    window.history.pushState({ tab: 'blog' }, '', '/blog');
                }
            } else {
                activate(linksTab, linksFeed);
                if (window.location.pathname !== '/') {
                    window.history.pushState({ tab: 'links' }, '', '/');
                }
            }
        };

        // --- Data Loading Logic ---
        (window as any).loadProducts = async () => {
            const container = document.getElementById('shop-products-container');
            if (!container) return;
            // Assuming API runs on same host or handled by proxy. 
            // In dev: localhost:3000. In prod: relative or env var.
            // We'll use relative URL '/api' which should be proxied or handled.
            // In dev: localhost:3000. In prod: relative or env var.
            const API_BASE_URL = window.location.hostname.includes('localhost') ? 'http://localhost:3000/api' : 'https://api.portyo.me/api'; 
            
            try {
                const response = await fetch(`${API_BASE_URL}/public/products/${bio.id}`);
                if (!response.ok) throw new Error('Failed to fetch products');
                
                const products = await response.json();
                (window as any).shopLoaded = true;
                
                if (products.length === 0) {
                    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#6b7280;">No products found.</div>';
                    return;
                }
                
                // We use a simple HTML string construction here to match the generator's style
                container.innerHTML = products.map((product: any) => {
                    const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.price || 0);
                    const image = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/300x300?text=Product';
                    const name = product.name?.replace(/"/g, '&quot;') || '';
                    
                    return `
                        <a href="${product.url || '#'}" target="_blank" class="product-card-item" style="display:flex; flex-direction:column; background:white; border-radius:24px; overflow:hidden; box-shadow:0 4px 20px -8px rgba(0,0,0,0.08); border:1px solid rgba(0,0,0,0.04); text-decoration:none; transition:all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); height:100%; position:relative;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 30px -10px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px -8px rgba(0,0,0,0.08)'">
                            <div style="position:relative; aspect-ratio:1; overflow:hidden; background:#f3f4f6;">
                                <img src="${image}" alt="${name}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" />
                                <div style="position:absolute; bottom:12px; left:12px; background:rgba(255,255,255,0.9); backdrop-filter:blur(8px); padding:6px 14px; border-radius:99px; color:#111827; font-size:13px; font-weight:700; box-shadow:0 4px 10px rgba(0,0,0,0.08);">
                                    ${price}
                                </div>
                            </div>
                            <div style="padding:16px; flex:1; display:flex; flex-direction:column;">
                                <h3 style="font-size:16px; font-weight:700; color:#111827; margin:0 0 12px 0; line-height:1.4; flex:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${name}</h3>
                                <div style="background:#111827; color:white; text-align:center; padding:12px; border-radius:14px; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:8px;">
                                    <span>View Product</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </div>
                            </div>
                        </a>
                    `;
                }).join('');
                
            } catch (err) {
                console.error(err);
                container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#ef4444;">Failed to load products.</div>';
            }
        };

        (window as any).loadBlogPosts = async () => {
            const container = document.getElementById('blog-posts-container');
            if (!container) return;
            const API_BASE_URL = window.location.hostname.includes('localhost') ? 'http://localhost:3000/api' : 'https://api.portyo.me/api';
            
            try {
                const response = await fetch(`${API_BASE_URL}/public/blog/${bio.id}`);
                if (!response.ok) throw new Error('Failed to fetch posts');
                
                const posts = await response.json();
                (window as any).blogLoaded = true;
                
                if (posts.length === 0) {
                    container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#6b7280;">No posts yet.</div>';
                    return;
                }

                container.style.display = 'grid';
                container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
                container.style.gap = '24px';
                
                container.innerHTML = posts.map((post: any, index: number) => {
                    const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
                    const readTime = Math.max(1, Math.ceil(wordCount / 200));
                    
                    let image = 'https://placehold.co/600x400?text=Blog+Post';
                    const imgMatch = post.content && post.content.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) {
                        image = imgMatch[1];
                    }

                    const authorName = (bio.seoTitle || bio.subdomain) ? (bio.seoTitle || bio.subdomain) : 'Author';
                    const authorImage = (bio.profileImage || bio.favicon || bio.ogImage) ? (bio.profileImage || bio.favicon || bio.ogImage) : ('https://ui-avatars.com/api/?name=' + encodeURIComponent(authorName) + '&background=random');
                    const title = post.title?.replace(/"/g, '&quot;') || '';

                    return `
                        <div class="blog-card-item" data-index="${index}" onclick="(function(){ window.location.href='/blog/post/${post.id}'; })()" style="background:white; border-radius:24px; overflow:hidden; box-shadow:0 8px 25px -8px rgba(0,0,0,0.08); border:1px solid rgba(0,0,0,0.03); padding:20px; text-decoration:none; cursor:pointer; display:flex; flex-wrap:wrap; align-items:flex-start; min-height:180px; position: ${posts.length > 1 ? 'absolute' : 'relative'}; top:0; left:0; right:0; transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: top center; background: #ffffff;">
                            <div style="flex:1; min-width:200px; padding-right:16px; display:flex; flex-direction:column;">
                                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                                    <div style="width:24px; height:24px; border-radius:50%; background:#f3f4f6; overflow:hidden;">
                                        <img src="${authorImage}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=User'" />
                                    </div>
                                    <span style="font-size:12px; font-weight:600; color:#374151;">${authorName}</span>
                                </div>
                                <h3 style="font-size:18px; font-weight:800; color:#111827; margin:0 0 8px 0; line-height:1.3; letter-spacing:-0.01em; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${title}</h3>
                                <div style="margin-top:auto; display:flex; align-items:center; justify-content:space-between; width:100%; padding-top:12px;">
                                    <div style="font-size:12px; color:#6b7280; font-weight:500;">
                                        ${date} <span style="margin:0 4px; opacity:0.5">•</span> ${readTime} min read
                                    </div>
                                </div>
                            </div>
                            <div style="width:120px; height:120px; flex-shrink:0;">
                                <div style="width:100%; height:100%; border-radius:12px; overflow:hidden; background:#f3f4f6;">
                                    <img src="${image}" alt="${title}" style="width:100%; height:100%; object-fit:cover;" />
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                if (posts.length > 1) {
                    const controls = `
                        <div style="display:flex; justify-content:center; gap:16px; margin-top:24px; padding-top:220px;">
                            <button onclick="window.changeBlogStack(-1)" style="width:44px; height:44px; border-radius:50%; background:white; border:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; cursor:pointer;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button onclick="window.changeBlogStack(1)" style="width:44px; height:44px; border-radius:50%; background:#111827; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    `;
                    
                    // Blog Stack Logic definition
                    if (!(window as any).changeBlogStack) {
                        (window as any).blogStackState = { activeIndex: 0, total: posts.length };
                        (window as any).changeBlogStack = function(dir: number) {
                            const s = (window as any).blogStackState;
                            s.activeIndex = (s.activeIndex + dir + s.total) % s.total;
                            (window as any).updateCards(s.activeIndex, s.total);
                        };
                        (window as any).updateCards = function(activeIndex: number, total: number) {
                            const cards: any = document.querySelectorAll('.blog-card-item');
                            cards.forEach((card: any, i: number) => {
                                let offset = (i - activeIndex + total) % total;
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
                        setTimeout(() => (window as any).updateCards(0, posts.length), 0);
                    }
                    container.innerHTML = `<div style="position:relative; height:auto; min-height:260px;">${container.innerHTML}${controls}</div>`;
                }

            } catch (err) {
                console.error(err);
                container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#ef4444;">Failed to load posts.</div>';
            }
        };

        // --- Share & Subscribe Modals ---
        (window as any).openShare = (e: any, url: string, title: string) => {
            if(e) { e.preventDefault(); e.stopPropagation(); }
            (window as any).currentShareUrl = url;
            const modal = document.getElementById('share-modal');
            if(modal) modal.style.display = 'flex';
            const titleEl = document.getElementById('share-title');
            if(titleEl) titleEl.textContent = title;
            const qrEl = document.getElementById('share-qr') as HTMLImageElement;
            if(qrEl) qrEl.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(url);
            
            const tw = document.getElementById('share-twitter') as HTMLAnchorElement;
            const fb = document.getElementById('share-facebook') as HTMLAnchorElement;
            const wa = document.getElementById('share-whatsapp') as HTMLAnchorElement;
            const li = document.getElementById('share-linkedin') as HTMLAnchorElement;
            
            if(tw) tw.href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url);
            if(fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
            if(wa) wa.href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(url);
            if(li) li.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
        };

        (window as any).closeShare = () => {
            const modal = document.getElementById('share-modal');
            if(modal) modal.style.display = 'none';
        };

        (window as any).copyShareLink = () => {
            navigator.clipboard.writeText((window as any).currentShareUrl);
            alert('Link copied to clipboard!');
        };

        (window as any).openSubscribe = () => {
            const modal = document.getElementById('subscribe-modal');
            if(modal) modal.style.display = 'flex';
        };

        (window as any).closeSubscribe = () => {
            const modal = document.getElementById('subscribe-modal');
            if(modal) modal.style.display = 'none';
        };

        // Parallax script (Wheat/Leaves)
        const onScroll = () => {
             const scrolled = window.scrollY;
             const layer1 = document.getElementById('wheat-layer-1');
             const layer2 = document.getElementById('wheat-layer-2');
             const palmLayer1 = document.getElementById('palm-layer-1');
             const palmLayer2 = document.getElementById('palm-layer-2');

             if (layer1) layer1.style.transform = 'rotate(15deg) translateY(' + (scrolled * 0.2) + 'px) translateZ(0)';
             if (layer2) layer2.style.transform = 'rotate(-10deg) translateY(' + (scrolled * 0.5) + 'px) translateZ(0)';
             
             if (palmLayer1) palmLayer1.style.transform = 'translateY(' + (scrolled * 0.2) + 'px) translateZ(0)';
             if (palmLayer2) palmLayer2.style.transform = 'translateY(' + (scrolled * 0.5) + 'px) translateZ(0)';
        };

        window.addEventListener('scroll', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, [bio]);
};
