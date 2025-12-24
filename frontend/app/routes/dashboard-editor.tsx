import { useContext, useEffect, useMemo, useState, useRef } from "react";
import BioContext, { type BioBlock } from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";

const palette: Array<{ type: BioBlock["type"]; label: string; icon: React.ReactNode; category: string }> = [
  { 
    type: "heading", 
    label: "Heading", 
    category: "Content",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/></svg> 
  },
  { 
    type: "text", 
    label: "Text", 
    category: "Content",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg> 
  },
  { 
    type: "button", 
    label: "Button", 
    category: "Content",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> 
  },
  { 
    type: "image", 
    label: "Image", 
    category: "Content",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> 
  },
  { 
    type: "socials", 
    label: "Socials", 
    category: "Social",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> 
  },
  { 
    type: "video", 
    label: "Video", 
    category: "Content",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" ry="2"/><polygon points="10 9 15 12 10 15 10 9"/></svg> 
  },
  { 
    type: "blog", 
    label: "Blog", 
    category: "Blog",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> 
  },
  { 
    type: "product", 
    label: "Product Catalog", 
    category: "Shop",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> 
  },
  { 
    type: "calendar", 
    label: "Calendar", 
    category: "Content",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> 
  },
  { 
    type: "map", 
    label: "Map", 
    category: "Content",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg> 
  },
  { 
    type: "featured", 
    label: "Featured", 
    category: "Shop",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> 
  },
  { 
    type: "affiliate", 
    label: "Affiliate Code", 
    category: "Shop",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> 
  },
  { 
    type: "event", 
    label: "Event", 
    category: "Content",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> 
  },
  { 
    type: "tour", 
    label: "Tour Dates", 
    category: "Content",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg> 
  },
  { 
    type: "spotify", 
    label: "Spotify", 
    category: "Music",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14.5c2.5 1.5 6.5 1.5 9 0"/><path d="M8 11.5c2.5 1.5 6.5 1.5 9 0"/><path d="M8 8.5c2.5 1.5 6.5 1.5 9 0"/></svg> 
  },
  { 
    type: "instagram", 
    label: "Instagram Feed", 
    category: "Social",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> 
  },
  { 
    type: "youtube", 
    label: "YouTube Feed", 
    category: "Social",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg> 
  },
  { 
    type: "divider", 
    label: "Divider", 
    category: "Layout",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg> 
  },
];

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 9);

const defaultBlocks = (): BioBlock[] => [
  {
    id: makeId(),
    type: "heading",
    title: "Introduce yourself",
    body: "In one line, tell people why they should connect with you.",
    align: "center",
  },
  {
    id: makeId(),
    type: "button",
    title: "Main link",
    href: "https://",
    align: "center",
    accent: "#111827",
  },
];

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const blockToHtml = (block: BioBlock): string => {
  const align = block.align || "left";
  
  const animationTrigger = block.animationTrigger || "loop";
  let animationStyle = "";
  let animationClass = "";
  let extraHtml = "";

  if (block.animation && block.animation !== "none") {
    if (animationTrigger === "loop") {
      animationStyle = `animation: ${block.animation} 1s infinite;`;
    } else if (animationTrigger === "once") {
      animationStyle = `animation: ${block.animation} 1s;`;
    } else if (animationTrigger === "hover") {
      const cls = `anim-${block.id}`;
      animationClass = cls;
      extraHtml = `<style>.${cls}:hover { animation: ${block.animation} 1s infinite; }</style>`;
    }
  }

  if (block.type === "heading") {
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:16px 0; ${animationStyle}">\n  <h2 style="margin:0; font-size:28px; font-weight:700; color:#0f172a;">${escapeHtml(
      block.title || "Heading"
    )}</h2>\n  ${block.body ? `<p style="margin:8px 0 0; color:#475569;">${escapeHtml(block.body)}</p>` : ""}\n</section>`;
  }

  if (block.type === "text") {
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <p style="margin:0; color:#475569; line-height:1.6;">${escapeHtml(
      block.body || ""
    )}</p>\n</section>`;
  }

  if (block.type === "button") {
    const bg = block.accent || "#111827";
    const color = block.textColor || "#ffffff";
    const style = block.buttonStyle || "solid";
    const shape = block.buttonShape || "rounded";
    const shadowColor = block.buttonShadowColor || bg;
    const textAlign = block.buttonTextAlign || "center";
    
    let css = `display:flex; align-items:center; position:relative; min-height:60px; padding:12px 24px; text-decoration:none; font-weight:600; width:100%; ${animationStyle}`;
    
    if (shape === "pill") css += " border-radius:9999px;";
    else if (shape === "square") css += " border-radius:8px;";
    else css += " border-radius:16px;";

    if (style === "outline") {
      css += ` border:2px solid ${bg}; color:${bg}; background:transparent;`;
    } else if (style === "ghost") {
      css += ` background:transparent; color:${bg};`;
    } else if (style === "hard-shadow") {
      css += ` background:${bg}; color:${color}; border:2px solid ${shadowColor}; box-shadow:4px 4px 0px 0px ${shadowColor};`;
    } else if (style === "soft-shadow") {
      css += ` background:${bg}; color:${color}; box-shadow:0 10px 15px -3px ${shadowColor}40, 0 4px 6px -2px ${shadowColor}20;`;
    } else if (style === "3d") {
      css += ` background:${bg}; color:${color}; border-bottom:4px solid ${shadowColor}; transform:translateY(0); transition:all 0.1s;`;
    } else if (style === "glass") {
      css += ` background:rgba(255, 255, 255, 0.2); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255, 255, 255, 0.3); color:${color};`;
    } else if (style === "gradient") {
      css += ` background:linear-gradient(45deg, ${bg}, ${shadowColor}); color:${color}; border:none;`;
    } else if (style === "neumorphism") {
      css += ` background:${bg}; box-shadow:-5px -5px 10px rgba(255,255,255,0.5), 5px 5px 10px ${shadowColor}40; color:${color}; border:none;`;
    } else if (style === "clay") {
      css += ` background:${bg}; box-shadow:inset 6px 6px 12px rgba(255,255,255,0.4), inset -6px -6px 12px ${shadowColor}20, 8px 16px 24px ${shadowColor}40; border-radius:24px; color:${color}; border:none;`;
    } else if (style === "cyberpunk") {
      css += ` background:${bg}; clip-path:polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%); border-left:4px solid ${shadowColor}; color:${color}; font-family:monospace; text-transform:uppercase; border-radius:0;`;
    } else if (style === "pixel") {
      css += ` background:${bg}; box-shadow:-3px 0 0 0 ${shadowColor}, 3px 0 0 0 ${shadowColor}, 0 -3px 0 0 ${shadowColor}, 0 3px 0 0 ${shadowColor}; color:${color}; border-radius:0; border:none; margin:4px;`;
    } else if (style === "neon") {
      css += ` background:transparent; border:2px solid ${bg}; box-shadow:0 0 10px ${shadowColor}, inset 0 0 10px ${shadowColor}; color:${bg}; text-shadow:0 0 5px ${shadowColor};`;
    } else if (style === "sketch") {
      css += ` background:transparent; border:2px solid ${shadowColor}; border-radius:255px 15px 225px 15px / 15px 225px 15px 255px; color:${bg};`;
    } else if (style === "gradient-border") {
      css += ` background:linear-gradient(#fff, #fff) padding-box, linear-gradient(to right, ${bg}, ${shadowColor}) border-box; border:2px solid transparent; color:${bg};`;
    } else if (style === "minimal-underline") {
      css += ` background:transparent; border:none; border-bottom:3px solid ${bg}; border-radius:0; padding-left:0; padding-right:0; color:${bg}; justify-content:${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'};`;
    } else {
      css += ` background:${bg}; color:${color};`;
    }

    // For button, the animation should probably be on the <a> tag if it's a button block, 
    // but the previous implementation put it on the <a> tag.
    // However, for hover trigger, we might want the hover on the <a> tag.
    // The class should be on the <a> tag.
    
    const nsfwAttr = block.isNsfw ? ` onclick="return confirm('This content is marked as 18+. Are you sure you want to continue?');"` : "";

    const imageHtml = block.buttonImage ? `<img src="${escapeHtml(block.buttonImage)}" style="position:absolute; left:6px; top:50%; transform:translateY(-50%); width:52px; height:52px; border-radius:8px; object-fit:cover;" />` : "";
    
    const textPadding = block.buttonImage ? "padding-left:66px;" : "";
    const textStyle = `flex:1; text-align:${textAlign}; ${textPadding}`;

    const shareButtonHtml = `
      <button onclick="event.preventDefault(); event.stopPropagation(); window.openShare(event, '${escapeHtml(block.href || "")}', '${escapeHtml(block.title || "")}')" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:none; cursor:pointer; padding:8px; border-radius:50%; color:inherit; z-index:10;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    `;

    return `\n${extraHtml}<section style="text-align:${align}; padding:10px 0;">\n  <a href="${escapeHtml(block.href || "#")}" class="${animationClass}" style="${css}"${nsfwAttr}>${imageHtml}<span style="${textStyle}">${escapeHtml(
      block.title || "Open link"
    )}</span>${shareButtonHtml}</a>\n</section>`;
  }

  if (block.type === "image") {
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <img src="${escapeHtml(block.mediaUrl || "")}" alt="bio" style="max-width:100%; border-radius:18px;" />\n</section>`;
  }

  if (block.type === "socials") {
    const links = block.socials || {};
    const layout = block.socialsLayout || "row";
    const showLabel = block.socialsLabel || false;

    const icons = Object.entries(links).map(([platform, url]) => {
      if (!url) return "";
      
      // SVG paths for icons
      const svgPaths: Record<string, string> = {
        instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
        twitter: '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
        linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
        youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
        github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>'
      };

      const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPaths[platform] || ''}</svg>`;
      const label = showLabel ? `<span style="margin-left:8px; text-transform:capitalize;">${platform}</span>` : "";
      
      const style = showLabel 
        ? `display:flex; align-items:center; justify-content:center; padding:12px 16px; background:#f3f4f6; color:#374151; text-decoration:none; font-weight:600; border-radius:12px; width:${layout === 'column' ? '100%' : 'auto'};`
        : `display:inline-flex; align-items:center; justify-content:center; padding:12px; background:#f3f4f6; color:#374151; text-decoration:none; border-radius:9999px; width:${layout === 'column' ? '100%' : 'auto'};`;

      return `<a href="${escapeHtml(url)}" style="${style}">${iconSvg}${label}</a>`;
    }).join("");

    const containerStyle = layout === 'column' 
        ? `display:flex; flex-direction:column; gap:12px; align-items:${align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}; ${animationStyle}`
        : `display:flex; gap:12px; justify-content:${align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}; flex-wrap:wrap; ${animationStyle}`;

    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0;">\n  <div style="${containerStyle}">${icons}</div>\n</section>`;
  }

  if (block.type === "video") {
    const videoId = block.mediaUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    if (!videoId) return "";
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:18px;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe></div>\n</section>`;
  }

  if (block.type === "blog") {
    // Placeholder data for blog posts
    const posts = Array.from({ length: block.blogPostCount || 3 }).map((_, i) => ({
      title: `Blog Post Title ${i + 1}`,
      category: "Lifestyle",
      readTime: "5 min read",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Post",
      author: "By You"
    }));

    const layout = block.blogLayout || "carousel";
    const cardStyle = block.blogCardStyle || "featured";
    const uniqueId = `blog-${block.id}`;

    const cardsHtml = posts.map(post => {
      if (cardStyle === "featured") {
        return `
          <article style="flex:0 0 200px; scroll-snap-align:start; background:#fef3c7; border-radius:20px; padding:12px; display:flex; flex-direction:column; gap:10px; min-width:200px;">
            <div style="background:#e2e8f0; border-radius:12px; aspect-ratio:16/10; width:100%; overflow:hidden;">
               <img src="${post.image}" style="width:100%; height:100%; object-fit:cover;" />
            </div>
            <div style="display:flex; gap:6px;">
              <span style="background:#fff; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:600; color:#4b5563;">${post.category}</span>
              <span style="background:#fff; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:600; color:#4b5563;">${post.readTime}</span>
            </div>
            <h3 style="font-size:16px; font-weight:800; line-height:1.3; color:#1f2937; margin:0;">${post.title}</h3>
            <div style="display:flex; items-center; gap:6px; margin-top:auto;">
              <div style="width:20px; height:20px; background:#d1d5db; border-radius:50%;"></div>
              <span style="font-size:12px; color:#4b5563;">${post.author}</span>
            </div>
          </article>
        `;
      } else {
        // Minimal style
        return `
          <article style="flex:0 0 160px; scroll-snap-align:start; background:#fff; border:1px solid #e5e7eb; border-radius:16px; padding:14px; min-width:160px;">
            <h3 style="font-size:14px; font-weight:700; color:#1f2937; margin:0 0 6px 0;">${post.title}</h3>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:#6b7280;">${post.readTime}</span>
              <span style="font-size:11px; font-weight:500; color:#2563eb;">Read more &rarr;</span>
            </div>
          </article>
        `;
      }
    }).join("");

    if (layout === "carousel") {
      return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; position:relative; ${animationStyle}">
        <button onclick="document.getElementById('${uniqueId}').scrollBy({left: -230, behavior: 'smooth'})" style="position:absolute; left:4px; top:50%; transform:translateY(-50%); z-index:10; background:white; border:1px solid #e5e7eb; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); color:#374151;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div id="${uniqueId}" style="display:flex; gap:12px; overflow-x:auto; padding:0 40px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none; -ms-overflow-style:none;">
          ${cardsHtml}
        </div>
        <button onclick="document.getElementById('${uniqueId}').scrollBy({left: 230, behavior: 'smooth'})" style="position:absolute; right:4px; top:50%; transform:translateY(-50%); z-index:10; background:white; border:1px solid #e5e7eb; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); color:#374151;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <style>#${uniqueId}::-webkit-scrollbar { display: none; }</style>
      </section>`;
    }

    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; ${animationStyle}">\n  <div style="display:flex; flex-direction:column; gap:12px;">${cardsHtml}</div>\n</section>`;
  }

  if (block.type === "product") {
    const products = block.products || [];
    const layout = block.productLayout || "grid";
    
    const productItems = products.map(p => `
      <a href="${escapeHtml(p.url)}" style="display:block; text-decoration:none; color:inherit;">
        <div style="background:white; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
          <div style="aspect-ratio:1; width:100%; background:#f1f5f9;">
            <img src="${escapeHtml(p.image)}" style="width:100%; height:100%; object-fit:cover;" />
          </div>
          <div style="padding:12px;">
            <h3 style="margin:0; font-size:14px; font-weight:600; color:#1f2937;">${escapeHtml(p.title)}</h3>
            <p style="margin:4px 0 0; font-size:14px; color:#2563eb; font-weight:700;">${escapeHtml(p.price)}</p>
          </div>
        </div>
      </a>
    `).join("");

    const gridStyle = layout === "grid" 
      ? "display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;" 
      : "display:flex; flex-direction:column; gap:12px;";

    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; ${animationStyle}">\n  <div style="${gridStyle}">${productItems}</div>\n</section>`;
  }

  if (block.type === "calendar") {
    const title = block.calendarTitle || "Book a Call";
    const url = block.calendarUrl || "#";
    const bgColor = block.calendarColor || "#ffffff";
    const textColor = block.calendarTextColor || "#1f2937";
    const accentColor = block.calendarAccentColor || "#2563eb";
    
    const today = new Date().getDate();
    const daysHtml = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      const isToday = day === today;
      if (isToday) {
        return `<span style="background:${accentColor}; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; margin:0 auto;">${day}</span>`;
      }
      return `<span>${day}</span>`;
    }).join("");
    
    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; ${animationStyle}">
      <a href="${escapeHtml(url)}" style="display:block; text-decoration:none; background:${bgColor}; border-radius:24px; padding:20px; border:1px solid #e5e7eb; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="margin:0; font-size:18px; font-weight:700; color:${textColor};">${escapeHtml(title)}</h3>
          <span style="background:${accentColor}15; color:${accentColor}; padding:4px 12px; border-radius:99px; font-size:12px; font-weight:600;">Book Now</span>
        </div>
        <div style="background:${bgColor === '#ffffff' ? '#f8fafc' : 'rgba(0,0,0,0.05)'}; border-radius:16px; padding:16px;">
           <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-weight:600; color:${textColor}; font-size:14px;">
             <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
           </div>
           <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:8px; text-align:center; font-size:13px; color:${textColor}99;">
             ${daysHtml}
           </div>
        </div>
      </a>
    </section>`;
  }

  if (block.type === "map") {
    const title = block.mapTitle || "Our Office";
    const address = block.mapAddress || "123 Main St, City";
    const encodedAddress = encodeURIComponent(address);
    
    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; ${animationStyle}">
      <div style="position:relative; border-radius:24px; overflow:hidden; height:200px; background:#f1f5f9; border:1px solid #e5e7eb;">
        <iframe 
          width="100%" 
          height="100%" 
          frameborder="0" 
          scrolling="no" 
          marginheight="0" 
          marginwidth="0" 
          src="https://maps.google.com/maps?q=${encodedAddress}&t=m&z=15&output=embed&iwloc=near"
          style="border:0; filter: grayscale(0.2);"
        ></iframe>

        <!-- Address Card -->
        <div style="position:absolute; bottom:16px; left:16px; background:rgba(255,255,255,0.95); backdrop-filter:blur(8px); padding:12px 16px; border-radius:16px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); max-width:70%; pointer-events:none;">
          <h3 style="margin:0; font-size:14px; font-weight:700; color:#1f2937;">${escapeHtml(title)}</h3>
          <p style="margin:2px 0 0; font-size:12px; color:#6b7280;">${escapeHtml(address)}</p>
        </div>
      </div>
    </section>`;
  }

  if (block.type === "featured") {
    const title = block.featuredTitle || "Glow lipstick";
    const price = block.featuredPrice || "$19.99";
    const image = block.featuredImage || "https://placehold.co/300x300";
    const url = block.featuredUrl || "#";
    const bgColor = block.featuredColor || "#1f4d36";
    const textColor = block.featuredTextColor || "#ffffff";
    
    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; ${animationStyle}">
      <a href="${escapeHtml(url)}" style="display:block; text-decoration:none; background:${bgColor}; border-radius:24px; overflow:hidden; position:relative; color:${textColor};">
        <!-- Top Badge -->
        <div style="position:absolute; top:12px; right:-30px; background:white; color:black; padding:4px 30px; transform:rotate(45deg); font-size:10px; font-weight:800; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:10;">
          TOTAL CLICK
        </div>
        
        <div style="padding:24px; display:flex; gap:20px; align-items:center;">
          <!-- Image -->
          <div style="width:100px; height:100px; flex-shrink:0; border-radius:12px; overflow:hidden; background:rgba(255,255,255,0.1);">
            <img src="${escapeHtml(image)}" style="width:100%; height:100%; object-fit:cover;" />
          </div>
          
          <!-- Content -->
          <div style="flex:1;">
            <h3 style="margin:0 0 12px 0; font-family:'Courier New', monospace; font-size:20px; font-weight:700; letter-spacing:-0.5px;">${escapeHtml(title)}</h3>
            
            <!-- Lines representing description -->
            <div style="height:8px; background:rgba(255,255,255,0.3); border-radius:4px; margin-bottom:8px; width:100%;"></div>
            <div style="height:8px; background:rgba(255,255,255,0.3); border-radius:4px; width:80%;"></div>
          </div>
        </div>
        
        <!-- Divider -->
        <div style="height:1px; background:rgba(255,255,255,0.2); margin:0 24px;"></div>
        
        <!-- Bottom Action -->
        <div style="padding:16px; text-align:center;">
          <span style="font-size:18px; font-weight:500;">Buy now for ${escapeHtml(price)}</span>
        </div>
      </a>
    </section>`;
  }

  if (block.type === "affiliate") {
    const title = block.affiliateTitle || "Copy my coupon code";
    const code = block.affiliateCode || "CODE123";
    const image = block.affiliateImage || "https://placehold.co/300x300";
    const url = block.affiliateUrl || "#";
    const bgColor = block.affiliateColor || "#ffffff";
    const textColor = block.affiliateTextColor || "#374151";
    
    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; ${animationStyle}">
      <div style="background:${bgColor}; border-radius:24px; padding:24px; text-align:center; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.05); border:1px solid #e5e7eb;">
        <a href="${escapeHtml(url)}" style="display:block; margin-bottom:16px;">
          <img src="${escapeHtml(image)}" style="width:120px; height:120px; object-fit:cover; border-radius:16px; margin:0 auto; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
        </a>
        <p style="margin:0 0 12px 0; font-size:14px; font-weight:600; color:${textColor};">${escapeHtml(title)}</p>
        <button onclick="navigator.clipboard.writeText('${escapeHtml(code)}').then(() => { this.innerHTML = 'Copied!'; setTimeout(() => { this.innerHTML = '${escapeHtml(code)} <svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' style=\'display:inline-block; vertical-align:middle; margin-left:4px;\'><rect width=\'14\' height=\'14\' x=\'8\' y=\'8\' rx=\'2\' ry=\'2\'/><path d=\'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\'/></svg>'; }, 2000); })" style="width:100%; border:2px dashed #cbd5e1; border-radius:16px; padding:12px; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; background:rgba(255,255,255,0.5); font-family:monospace; font-size:16px; font-weight:700; color:${textColor}; transition:all 0.2s;">
          ${escapeHtml(code)}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
    </section>`;
  }

  if (block.type === "event") {
    const title = block.eventTitle || "Live Webinar";
    const date = block.eventDate || new Date(Date.now() + 86400000 * 7).toISOString();
    const bgColor = block.eventColor || "#111827";
    const textColor = block.eventTextColor || "#ffffff";
    const btnText = block.eventButtonText || "Register Now";
    const btnUrl = block.eventButtonUrl || "#";
    const uniqueId = `countdown-${block.id}`;

    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; ${animationStyle}">
      <div style="background:${bgColor}; border-radius:24px; padding:20px; text-align:center; color:${textColor}; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <h3 style="margin:0 0 16px 0; font-size:18px; font-weight:700;">${escapeHtml(title)}</h3>
        
        <div id="${uniqueId}" class="countdown-timer" data-date="${date}" style="display:flex; justify-content:center; gap:8px; margin-bottom:20px; flex-wrap:wrap;">
          <div style="background:rgba(255,255,255,0.1); padding:8px; border-radius:12px; min-width:55px; flex:1; max-width:80px;">
            <div class="days" style="font-size:20px; font-weight:800; line-height:1;">00</div>
            <div style="font-size:9px; opacity:0.7; margin-top:4px; text-transform:uppercase;">Days</div>
          </div>
          <div style="background:rgba(255,255,255,0.1); padding:8px; border-radius:12px; min-width:55px; flex:1; max-width:80px;">
            <div class="hours" style="font-size:20px; font-weight:800; line-height:1;">00</div>
            <div style="font-size:9px; opacity:0.7; margin-top:4px; text-transform:uppercase;">Hours</div>
          </div>
          <div style="background:rgba(255,255,255,0.1); padding:8px; border-radius:12px; min-width:55px; flex:1; max-width:80px;">
            <div class="minutes" style="font-size:20px; font-weight:800; line-height:1;">00</div>
            <div style="font-size:9px; opacity:0.7; margin-top:4px; text-transform:uppercase;">Mins</div>
          </div>
          <div style="background:rgba(255,255,255,0.1); padding:8px; border-radius:12px; min-width:55px; flex:1; max-width:80px;">
            <div class="seconds" style="font-size:20px; font-weight:800; line-height:1;">00</div>
            <div style="font-size:9px; opacity:0.7; margin-top:4px; text-transform:uppercase;">Secs</div>
          </div>
        </div>

        ${btnText ? `<a href="${escapeHtml(btnUrl)}" style="display:inline-block; background:white; color:${bgColor}; padding:10px 24px; border-radius:99px; font-weight:700; text-decoration:none; font-size:14px; transition:transform 0.2s;">${escapeHtml(btnText)}</a>` : ''}
      </div>
    </section>`;
  }

  if (block.type === "tour") {
    const tours = block.tours || [];
    const title = block.tourTitle || "TOURS";
    const uniqueId = `tour-${block.id}`;

    if (tours.length === 0) return "";

    const cards = tours.map(tour => {
      const bgImage = tour.image || "";
      const date = tour.date || "TBA";
      const location = tour.location || "Location";
      const ticketUrl = tour.ticketUrl || "#";
      const isSoldOut = tour.soldOut;
      const isSellingFast = tour.sellingFast;

      let badgeHtml = "";
      if (isSoldOut) {
        badgeHtml = `<span style="background:#dc2626; color:white; font-size:10px; font-weight:700; padding:4px 8px; border-radius:99px; text-transform:uppercase; letter-spacing:0.05em;">Sold Out</span>`;
      } else if (isSellingFast) {
        badgeHtml = `<span style="background:rgba(0,0,0,0.8); color:white; font-size:10px; font-weight:700; padding:4px 8px; border-radius:99px; text-transform:uppercase; letter-spacing:0.05em; border:1px solid rgba(255,255,255,0.2);">Selling fast</span>`;
      }

      return `
        <a href="${escapeHtml(ticketUrl)}" target="_blank" style="flex:0 0 160px; scroll-snap-align:center; position:relative; aspect-ratio:3/4; border-radius:12px; overflow:hidden; text-decoration:none; display:block;">
          <div style="position:absolute; inset:0; background:#1f2937;">
            ${bgImage ? `<img src="${escapeHtml(bgImage)}" style="width:100%; height:100%; object-fit:cover; opacity:0.8;" />` : `<div style="width:100%; height:100%; background:linear-gradient(to bottom, #374151, #111827);"></div>`}
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2), transparent);"></div>
          </div>
          
          <div style="position:absolute; inset:0; padding:16px; display:flex; flex-direction:column; justify-content:space-between; color:white;">
            <div style="display:flex; justify-content:flex-start;">
              ${badgeHtml}
            </div>
            
            <div style="text-align:center;">
              <div style="font-size:20px; font-weight:700; margin-bottom:4px;">${escapeHtml(date)}</div>
              <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#d1d5db; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(location)}</div>
            </div>
          </div>
        </a>
      `;
    }).join("");

    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; ${animationStyle}">
      <h3 style="text-align:center; font-size:14px; font-weight:700; letter-spacing:0.1em; margin:0 0 16px 0; color:#111827;">${escapeHtml(title.toUpperCase())}</h3>
      <div style="position:relative;">
        <div id="${uniqueId}" style="display:flex; overflow-x:auto; gap:12px; padding:0 4px 16px 4px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none;">
          ${cards}
        </div>
        <button onclick="document.getElementById('${uniqueId}').scrollBy({left: -516, behavior: 'smooth'})" style="position:absolute; left:-8px; top:50%; transform:translateY(-50%); z-index:10; background:rgba(255,255,255,0.9); border:none; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.1); color:#111827;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button onclick="document.getElementById('${uniqueId}').scrollBy({left: 516, behavior: 'smooth'})" style="position:absolute; right:-8px; top:50%; transform:translateY(-50%); z-index:10; background:rgba(37,99,235,0.9); border:none; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 6px rgba(37,99,235,0.3); color:white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </section>`;
  }

  if (block.type === "spotify") {
    const url = block.spotifyUrl;
    const isCompact = block.spotifyCompact;
    
    if (!url) return "";

    let embedUrl = "";
    try {
      if (url.startsWith("spotify:")) {
        const parts = url.split(":");
        embedUrl = `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
      } else {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        if (pathParts.length >= 2) {
          const type = pathParts[pathParts.length - 2];
          const id = pathParts[pathParts.length - 1];
          embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
        }
      }
    } catch (e) {
      return "";
    }

    if (!embedUrl) return "";

    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; overflow:hidden; ${animationStyle}">
      <iframe style="border-radius:12px; overflow:hidden; border:0;" src="${embedUrl}" width="100%" height="${isCompact ? "80" : "152"}" frameBorder="0" scrolling="no" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </section>`;
  }

  if (block.type === "instagram") {
    const username = block.instagramUsername || "instagram";
    const url = `https://instagram.com/${username}`;
    const displayType = block.instagramDisplayType || "grid";
    const uniqueId = `instagram-${block.id}`;
    const showText = block.instagramShowText !== false;
    const textPosition = block.instagramTextPosition || "bottom";
    const textColor = block.instagramTextColor || "#0095f6";
    
    const gridStyle = displayType === 'grid' 
      ? "display:grid; grid-template-columns:repeat(3, 1fr); gap:4px;" 
      : "display:flex; flex-direction:column; gap:12px;";

    const imageStyle = displayType === 'grid'
      ? "aspect-ratio:1; width:100%;"
      : "aspect-ratio:1; width:100%; max-height:400px;";

    // Initial placeholders with loading spinner (SSR)
    const placeholders = [1, 2, 3].map(() => `
      <div style="position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6;">
        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
           <div style="width:24px; height:24px; border:2px solid #d1d5db; border-top-color:#0095f6; border-radius:50%; animation:spin 1s linear infinite;"></div>
        </div>
      </div>
    `).join('');

    const textHtml = showText ? `
      <div style="text-align:center; ${textPosition === 'top' ? 'margin-bottom:8px;' : 'margin-top:8px;'}">
        <a href="${escapeHtml(url)}" target="_blank" style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:600; color:${textColor}; text-decoration:none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          @${escapeHtml(username)}
        </a>
      </div>
    ` : '';

    // We add 'custom-instagram-feed' class and data attributes for the BioRenderer to pick up
    return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; ${animationStyle}">
      ${textPosition === 'top' ? textHtml : ''}
      <div id="${uniqueId}" class="custom-instagram-feed" data-username="${escapeHtml(username)}" data-display-type="${displayType}" style="${gridStyle} border-radius:12px; overflow:hidden;">
        ${placeholders}
      </div>
      ${textPosition === 'bottom' ? textHtml : ''}
    </section>`;
  }

  if (block.type === "youtube") {
    const url = block.youtubeUrl || "https://youtube.com/@youtube";
    const displayType = block.youtubeDisplayType || "grid";
    const showText = block.youtubeShowText !== false;
    const textPosition = block.youtubeTextPosition || "bottom";
    const textColor = block.youtubeTextColor || "#ff0000";
    
    const gridStyle = displayType === 'grid' 
      ? "display:grid; grid-template-columns:repeat(3, 1fr); gap:4px;" 
      : "display:flex; flex-direction:column; gap:12px;";

    const imageStyle = displayType === 'grid'
      ? "aspect-ratio:16/9; width:100%;"
      : "aspect-ratio:16/9; width:100%;";

    // Initial placeholders with loading spinner (SSR)
    const placeholders = [1, 2, 3].map(() => `
      <div class="youtube-placeholder" style="position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6;">
        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
           <div style="width:24px; height:24px; border:2px solid #d1d5db; border-top-color:#ff0000; border-radius:50%; animation:spin 1s linear infinite;"></div>
        </div>
      </div>
    `).join('');

    const textHtml = showText ? `
      <div style="text-align:center; ${textPosition === 'top' ? 'margin-bottom:8px;' : 'margin-top:8px;'}">
        <a href="${escapeHtml(url)}" target="_blank" style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:600; color:${textColor}; text-decoration:none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
          YouTube Channel
        </a>
      </div>` : '';

    return `\n${extraHtml}<section class="${animationClass}" style="padding:8px 0; ${animationStyle}">
      ${textPosition === 'top' ? textHtml : ''}
      <div class="custom-youtube-feed" data-url="${escapeHtml(url)}" data-display-type="${displayType}" style="${gridStyle} border-radius:12px; overflow:hidden;">
        ${placeholders}
      </div>
      ${textPosition === 'bottom' ? textHtml : ''}
    </section>`;
  }

  return "\n<hr style=\"border:none; border-top:1px solid #E5E7EB; margin:18px 0;\" />";
};

const blocksToHtml = (blocks: BioBlock[], user: any, bio: any) => {
  const animationsCss = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
    @keyframes wobble { 0% { transform: translateX(0%); } 15% { transform: translateX(-25%) rotate(-5deg); } 30% { transform: translateX(20%) rotate(3deg); } 45% { transform: translateX(-15%) rotate(-3deg); } 60% { transform: translateX(10%) rotate(2deg); } 75% { transform: translateX(-5%) rotate(-1deg); } 100% { transform: translateX(0%); } }
  `;
  
  const imageStyles: Record<string, string> = {
    circle: 'border-radius:50%;',
    rounded: 'border-radius:24px;',
    square: 'border-radius:0;',
    star: 'clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);',
    hexagon: 'clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);'
  };
  const imgStyle = imageStyles[bio.imageStyle || 'circle'] || imageStyles.circle;
  const usernameColor = bio.usernameColor || '#111827';

  const headerHtml = `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 0;">
      <a href="/" style="width:40px; height:40px; border-radius:50%; background:white; box-shadow:0 1px 2px rgba(0,0,0,0.05); border:1px solid #f3f4f6; display:flex; align-items:center; justify-content:center; color:#374151; text-decoration:none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </a>
      <button onclick="window.openSubscribe()" style="height:40px; padding:0 16px; border-radius:99px; background:white; box-shadow:0 1px 2px rgba(0,0,0,0.05); border:1px solid #f3f4f6; display:flex; align-items:center; gap:8px; font-size:14px; font-weight:600; color:#374151; cursor:pointer;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        Subscribe
      </button>
    </div>

    <div style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:32px 0 24px;">
      <div style="width:96px; height:96px; background:#f3f4f6; border:4px solid white; box-shadow:0 1px 2px rgba(0,0,0,0.05); overflow:hidden; ${imgStyle}">
        <img src="/users-photos/${user?.id}.png" onerror="this.src='/users-photos/julia-soares.jpeg'" alt="${user?.fullname || 'User'}" style="width:100%; height:100%; object-fit:cover;" />
      </div>
      <div style="text-align:center;">
        <p style="font-size:18px; font-weight:700; color:${usernameColor}; margin:0;">@${bio?.sufix || 'user'}</p>
      </div>
    </div>
  `;

  let bgStyle = 'background:#f8fafc;';
  const bgColor = bio.bgColor || '#f8fafc';
  const bgSecondary = bio.bgSecondaryColor || '#e2e8f0';

  if (bio.bgType === 'color') {
    bgStyle = `background:${bgColor};`;
  } else if (bio.bgType === 'image' && bio.bgImage) {
    bgStyle = `background:url('${bio.bgImage}') no-repeat center center fixed; background-size:cover;`;
  } else if (bio.bgType === 'video' && bio.bgVideo) {
    bgStyle = 'background:transparent; position:relative; overflow:hidden;';
  } else if (bio.bgType === 'grid') {
    bgStyle = `background-color: ${bgColor}; background-image: linear-gradient(${bgSecondary} 1px, transparent 1px), linear-gradient(90deg, ${bgSecondary} 1px, transparent 1px); background-size: 20px 20px;`;
  } else if (bio.bgType === 'dots') {
    bgStyle = `background-color: ${bgColor}; background-image: radial-gradient(${bgSecondary} 1px, transparent 1px); background-size: 20px 20px;`;
  } else if (bio.bgType === 'polka') {
    bgStyle = `background-color: ${bgColor}; background-image: radial-gradient(${bgSecondary} 20%, transparent 20%), radial-gradient(${bgSecondary} 20%, transparent 20%); background-position: 0 0, 10px 10px; background-size: 20px 20px;`;
  } else if (bio.bgType === 'stripes') {
    bgStyle = `background: repeating-linear-gradient(45deg, ${bgColor}, ${bgColor} 10px, ${bgSecondary} 10px, ${bgSecondary} 20px);`;
  } else if (bio.bgType === 'zigzag') {
    bgStyle = `background-color: ${bgColor}; opacity: 1; background-image: linear-gradient(135deg, ${bgSecondary} 25%, transparent 25%), linear-gradient(225deg, ${bgSecondary} 25%, transparent 25%), linear-gradient(45deg, ${bgSecondary} 25%, transparent 25%), linear-gradient(315deg, ${bgSecondary} 25%, ${bgColor} 25%); background-position: 10px 0, 10px 0, 0 0, 0 0; background-size: 20px 20px; background-repeat: repeat;`;
  } else if (bio.bgType === 'waves') {
    bgStyle = `background-color: ${bgColor}; background-image: url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='${encodeURIComponent(bgSecondary)}' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");`;
  } else if (bio.bgType === 'mesh') {
    bgStyle = `background-color:${bgColor}; background-image: radial-gradient(at 40% 20%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 80% 0%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 0% 50%, ${bgSecondary} 0px, transparent 50%);`;
  } else if (bio.bgType === 'particles') {
    bgStyle = `background-color: ${bgColor}; background-image: radial-gradient(${bgSecondary} 2px, transparent 2px), radial-gradient(${bgSecondary} 2px, transparent 2px); background-size: 32px 32px; background-position: 0 0, 16px 16px;`;
  } else if (bio.bgType === 'noise') {
    bgStyle = `background-color: ${bgColor}; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E");`;
  } else if (bio.bgType === 'abstract') {
    bgStyle = `background-color: ${bgColor}; background-image: linear-gradient(30deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(150deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(30deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(150deg, ${bgSecondary} 12%, transparent 12.5%, transparent 87%, ${bgSecondary} 87.5%, ${bgSecondary}), linear-gradient(60deg, ${bgSecondary}77 25%, transparent 25.5%, transparent 75%, ${bgSecondary}77 75%, ${bgSecondary}77), linear-gradient(60deg, ${bgSecondary}77 25%, transparent 25.5%, transparent 75%, ${bgSecondary}77 75%, ${bgSecondary}77); background-size: 20px 35px; background-position: 0 0, 0 0, 10px 18px, 10px 18px, 0 0, 10px 18px;`;
  }

  const videoBgHtml = (bio.bgType === 'video' && bio.bgVideo) ? `
    <video autoplay loop muted playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:-1;">
      <source src="${bio.bgVideo}" type="video/mp4">
    </video>
    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index:-1;"></div>
  ` : '';

  return `<div style="${bgStyle} min-height:100vh; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
    <style>${animationsCss}</style>
    ${videoBgHtml}
    <main style="max-width:720px; margin:0 auto; padding:24px; position:relative; z-index:1;">
      ${headerHtml}
      ${blocks.map(blockToHtml).join("")}
      <div style="text-align:center; padding:24px 0; margin-top:24px;">
        <a href="https://portyo.com" style="text-decoration:none; color:#6b7280; font-size:14px; font-weight:500; display:inline-flex; align-items:center; gap:4px; background:white; padding:6px 12px; border-radius:8px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
          Powered by <span style="color:#111827; font-weight:800;">Portyo</span>
        </a>
      </div>
    </main>
    <div id="share-modal" style="display:none; position:fixed; inset:0; z-index:50; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px);">
      <div style="background:white; border-radius:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); width:100%; max-width:448px; overflow:hidden; margin:16px; animation:zoomIn 0.2s ease-out;">
         <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; border-bottom:1px solid #f3f4f6;">
           <h3 style="font-weight:700; font-size:18px; color:#111827; margin:0;">Share link</h3>
           <button onclick="window.closeShare()" style="padding:8px; border-radius:9999px; color:#6b7280; background:transparent; border:none; cursor:pointer; display:flex;">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
           </button>
         </div>
         <div style="padding:24px;">
           <div style="background:#111827; border-radius:16px; padding:32px; text-align:center; color:white; margin-bottom:32px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); position:relative; overflow:hidden;">
             <div style="position:absolute; inset:0; background:linear-gradient(to bottom right, #1f2937, #000000); z-index:0;"></div>
             <div style="position:relative; z-index:10;">
                <div style="width:128px; height:128px; background:white; border-radius:12px; margin:0 auto 16px auto; padding:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                    <img id="share-qr" src="" alt="QR Code" style="width:100%; height:100%;" />
                </div>
                <p id="share-title" style="font-weight:500; font-size:18px; opacity:0.9; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></p>
             </div>
           </div>

           <div style="display:flex; gap:16px; overflow-x:auto; padding-bottom:16px; justify-content:space-between; -webkit-overflow-scrolling:touch; scrollbar-width:none;">
              <button onclick="window.copyShareLink()" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; background:transparent; border:none; cursor:pointer; padding:0;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; color:#374151;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">Copy link</span>
              </button>

              <a id="share-twitter" href="#" target="_blank" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#000000; display:flex; align-items:center; justify-content:center; color:white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">X</span>
              </a>

              <a id="share-facebook" href="#" target="_blank" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#2563eb; display:flex; align-items:center; justify-content:center; color:white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">Facebook</span>
              </a>

              <a id="share-whatsapp" href="#" target="_blank" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#22c55e; display:flex; align-items:center; justify-content:center; color:white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">WhatsApp</span>
              </a>

              <a id="share-linkedin" href="#" target="_blank" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#1d4ed8; display:flex; align-items:center; justify-content:center; color:white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">LinkedIn</span>
              </a>
           </div>

           <div style="margin-top:32px; padding-top:24px; border-top:1px solid #f3f4f6; text-align:center;">
             <p style="font-size:14px; color:#6b7280; margin:0;">Join Portyo to create your own bio link</p>
             <a href="https://portyo.com" target="_blank" style="display:inline-block; margin-top:8px; color:#2563eb; font-weight:700; text-decoration:none;">Get started for free</a>
           </div>
         </div>
      </div>
    </div>
    <div id="subscribe-modal" style="display:none; position:fixed; inset:0; z-index:50; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px);">
      <div style="background:white; border-radius:24px; padding:32px; width:100%; max-width:400px; margin:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); position:relative; animation:zoomIn 0.2s ease-out;">
        <button onclick="window.closeSubscribe()" style="position:absolute; top:16px; right:16px; background:transparent; border:none; cursor:pointer; color:#9ca3af;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        
        <h3 style="font-size:20px; font-weight:900; color:#000; margin:0 0 24px 0; letter-spacing:0.05em; text-transform:uppercase;">JOIN THE LIST</h3>
        
        <form onsubmit="window.submitSubscribe(event)" style="display:flex; gap:12px;">
          <input type="email" placeholder="your@email.com" required style="flex:1; padding:16px; border-radius:16px; border:1px solid #e5e7eb; font-size:16px; outline:none; background:#f9fafb;" />
          <button type="submit" style="width:56px; height:56px; border-radius:16px; background:#ccff00; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:black; flex-shrink:0; transition:transform 0.1s;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </form>
        <p style="margin:12px 0 0 0; font-size:12px; color:#6b7280; text-align:center; display:none;" id="subscribe-success">Thanks for subscribing!</p>
      </div>
    </div>
    <script>
      window.currentShareUrl = '';
      window.openShare = function(e, url, title) {
        if(e) { e.preventDefault(); e.stopPropagation(); }
        window.currentShareUrl = url;
        document.getElementById('share-modal').style.display = 'flex';
        document.getElementById('share-title').textContent = title;
        document.getElementById('share-qr').src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(url);
        
        document.getElementById('share-twitter').href = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url);
        document.getElementById('share-facebook').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
        document.getElementById('share-whatsapp').href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(url);
        document.getElementById('share-linkedin').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
      };
      window.closeShare = function() {
        document.getElementById('share-modal').style.display = 'none';
      };
      window.copyShareLink = function() {
        navigator.clipboard.writeText(window.currentShareUrl);
        alert('Link copied to clipboard!');
      };

      window.openSubscribe = function() {
        document.getElementById('subscribe-modal').style.display = 'flex';
      };
      window.closeSubscribe = function() {
        document.getElementById('subscribe-modal').style.display = 'none';
        const successMsg = document.getElementById('subscribe-success');
        if (successMsg) successMsg.style.display = 'none';
      };
      window.submitSubscribe = function(e) {
        e.preventDefault();
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : '';
        
        if (email) {
            const successMsg = document.getElementById('subscribe-success');
            if (successMsg) {
                successMsg.style.display = 'block';
                successMsg.textContent = 'Thanks for subscribing!';
            }
            if (emailInput) emailInput.value = '';
            setTimeout(() => {
                window.closeSubscribe();
            }, 2000);
        }
      };
    </script>
  </div>`;
};

const EventBlockPreview = ({ block }: { block: BioBlock }) => {
  const title = block.eventTitle || "Live Webinar";
  const date = block.eventDate || new Date(Date.now() + 86400000 * 7).toISOString();
  const bgColor = block.eventColor || "#111827";
  const textColor = block.eventTextColor || "#ffffff";
  const btnText = block.eventButtonText || "Register Now";
  const btnUrl = block.eventButtonUrl || "#";
  
  // Simple countdown logic for preview
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const target = new Date(date).getTime();
    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff < 0) {
        setIsExpired(true);
        return;
      }
      setIsExpired(false);
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <div key={block.id}>
      <div 
        className="rounded-3xl p-6 text-center shadow-lg"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <h3 className="mb-4 text-xl font-bold tracking-tight">{title}</h3>
        
        {isExpired ? (
          <div className="text-lg font-bold py-4 mb-4">Event Started</div>
        ) : (
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {['Days', 'Hours', 'Mins', 'Secs'].map((label, i) => {
              const val = i === 0 ? timeLeft.d : i === 1 ? timeLeft.h : i === 2 ? timeLeft.m : timeLeft.s;
              return (
                <div key={label} className="bg-white/10 p-2 rounded-xl min-w-[55px] backdrop-blur-sm flex-1 max-w-[80px]">
                  <div className="text-xl font-black leading-none mb-1">{val.toString().padStart(2, '0')}</div>
                  <div className="text-[9px] font-bold opacity-60 uppercase tracking-wider">{label}</div>
                </div>
              );
            })}
          </div>
        )}

        {btnText && (
          <a 
            href={btnUrl}
            className="inline-block bg-white px-6 py-3 rounded-full font-bold text-sm transition-transform hover:scale-105 shadow-md"
            style={{ color: bgColor }}
          >
            {btnText}
          </a>
        )}
      </div>
    </div>
  );
};

import { api } from "~/services/api";

const TourBlockPreview = ({ block }: { block: BioBlock }) => {
  const tours = block.tours || [];
  const title = block.tourTitle || "TOURS";
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = 160;
      const gap = 12; // gap-3
      const scrollAmount = (cardWidth + gap) * 3;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full py-4 relative group/container">
      <h3 className="text-center text-white font-bold mb-4 tracking-wider text-sm">{title.toUpperCase()}</h3>
      
      {tours.length === 0 ? (
        <div className="text-center text-gray-500 text-xs py-8 bg-gray-100 rounded-lg border border-dashed border-gray-300">
          No tour dates added yet
        </div>
      ) : (
        <div className="relative">
            {/* Left Arrow */}
            <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/container:opacity-100 transition-opacity hover:bg-white/20 -ml-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            {/* Right Arrow */}
            <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50 opacity-0 group-hover/container:opacity-100 transition-opacity hover:bg-blue-500 -mr-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-3 pb-4 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden" 
                style={{ scrollbarWidth: 'none' }}
            >
            {tours.map((tour) => (
                <div 
                key={tour.id} 
                className="relative flex-shrink-0 w-[160px] aspect-[3/4] rounded-lg overflow-hidden snap-center group"
                >
                {/* Background Image */}
                <div className="absolute inset-0 bg-gray-800">
                    {tour.image ? (
                    <img src={tour.image} alt={tour.location} className="w-full h-full object-cover opacity-80" />
                    ) : (
                    <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                    {/* Top Badge */}
                    <div className="flex justify-start">
                    {tour.soldOut ? (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        Sold Out
                        </span>
                    ) : tour.sellingFast ? (
                        <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-white/20">
                        Selling fast
                        </span>
                    ) : null}
                    </div>

                    {/* Bottom Info */}
                    <div className="text-center">
                    <div className="text-xl font-bold mb-1">{tour.date}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-300 truncate w-full">
                        {tour.location}
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};

const SpotifyBlockPreview = ({ block }: { block: BioBlock }) => {
  const url = block.spotifyUrl;
  const isCompact = block.spotifyCompact;
  
  if (!url) {
    return (
      <div className="w-full py-4">
        <div className="text-center text-gray-500 text-xs py-8 bg-gray-100 rounded-lg border border-dashed border-gray-300">
          Add a Spotify link to display the player
        </div>
      </div>
    );
  }

  // Extract ID from URL
  // Supports:
  // https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
  // https://open.spotify.com/album/0fLheFnjlIV3pCNyY14Kta
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  // spotify:track:4cOdK2wGLETKBW3PvgPWqT
  
  let embedUrl = "";
  
  try {
    if (url.startsWith("spotify:")) {
      const parts = url.split(":");
      embedUrl = `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
    } else {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const type = pathParts[pathParts.length - 2];
        const id = pathParts[pathParts.length - 1];
        embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
      }
    }
  } catch (e) {
    // Invalid URL
  }

  if (!embedUrl) {
    return (
      <div className="w-full py-4">
        <div className="text-center text-red-500 text-xs py-8 bg-red-50 rounded-lg border border-dashed border-red-300">
          Invalid Spotify URL
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 overflow-hidden">
      <iframe 
        style={{ borderRadius: "12px", border: 0 }} 
        src={embedUrl} 
        width="100%" 
        height={isCompact ? "80" : "152"} 
        frameBorder="0" 
        scrolling="no"
        allowFullScreen 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        className="overflow-hidden w-full"
      ></iframe>
    </div>
  );
};

const InstagramBlockPreview = ({ block }: { block: BioBlock }) => {
  const username = block.instagramUsername || "instagram";
  const displayType = block.instagramDisplayType || "grid";
  const showText = block.instagramShowText !== false;
  const textPosition = block.instagramTextPosition || "bottom";
  const textColor = block.instagramTextColor || "#0095f6";

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("InstagramBlockPreview useEffect triggered", { username });
    if (!username || username === "instagram") {
      console.log("InstagramBlockPreview: username is invalid or default, skipping fetch");
      return;
    }
    setLoading(true);
    console.log("InstagramBlockPreview: starting fetch for", username);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("InstagramBlockPreview: fetch timed out");
      controller.abort();
    }, 10000);

    // Use the configured api instance instead of raw fetch to ensure correct base URL
    // Note: api is axios instance, so we use api.get
    api.get(`/public/instagram/${username}`, { signal: controller.signal })
      .then(res => {
        console.log("InstagramBlockPreview: fetch response received", res.status);
        return res.data;
      })
      .then(data => {
        console.log("InstagramBlockPreview: data received", data);
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch instagram posts", err);
        setPosts([]);
      })
      .finally(() => {
        console.log("InstagramBlockPreview: fetch completed (finally)");
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      console.log("InstagramBlockPreview: cleanup");
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [username]);

  const images = posts.length > 0 ? posts.map(p => p.imageUrl) : [null, null, null];
  // Fill up to 3 if less
  while (images.length < 3) images.push(null);
  const displayImages = images.slice(0, 3);

  const textElement = showText ? (
      <div className={`text-center ${textPosition === 'top' ? 'mb-2' : 'mt-2'}`}>
        <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: textColor }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          @{username}
        </a>
      </div>
  ) : null;

  return (
    <div key={block.id} className="py-2">
      {textPosition === 'top' && textElement}
      <div className={`overflow-hidden rounded-xl ${displayType === 'grid' ? 'grid grid-cols-3 gap-1' : 'flex flex-col gap-3'}`}>
        {displayImages.map((img, i) => (
          <div key={i} className={`relative bg-gray-100 ${displayType === 'grid' ? 'aspect-square w-full' : 'aspect-square w-full max-h-[400px]'}`}>
            {img ? (
              <img src={img} alt="Instagram post" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                {loading ? (
                   <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {textPosition === 'bottom' && textElement}
    </div>
  );
};

const YoutubeBlockPreview = ({ block }: { block: BioBlock }) => {
  const url = block.youtubeUrl || "https://youtube.com/@youtube";
  const displayType = block.youtubeDisplayType || "grid";
  const showText = block.youtubeShowText !== false;
  const textPosition = block.youtubeTextPosition || "bottom";
  const textColor = block.youtubeTextColor || "#ff0000";

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // We send the URL as a query parameter to the backend
    // The backend will handle parsing the URL to find the channel ID
    api.get(`/public/youtube/fetch?url=${encodeURIComponent(url)}`, { signal: controller.signal })
      .then(res => res.data)
      .then(data => {
        if (Array.isArray(data)) {
          setVideos(data);
        } else {
          setVideos([]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch youtube videos", err);
        setVideos([]);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [url]);

  const images = videos.length > 0 ? videos.map(v => v.imageUrl) : [null, null, null];
  // Fill up to 3 if less
  while (images.length < 3) images.push(null);
  const displayImages = images.slice(0, 3);

  const textElement = showText ? (
      <div className={`text-center ${textPosition === 'top' ? 'mb-2' : 'mt-2'}`}>
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: textColor }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
          YouTube Channel
        </a>
      </div>
  ) : null;

  return (
    <div key={block.id} className="py-2">
      {textPosition === 'top' && textElement}
      <div className={`overflow-hidden rounded-xl ${displayType === 'grid' ? 'grid grid-cols-3 gap-1' : 'flex flex-col gap-3'}`}>
        {displayImages.map((img, i) => (
          <div key={i} className={`relative bg-gray-100 ${displayType === 'grid' ? 'aspect-video w-full' : 'aspect-video w-full'}`}>
            {img ? (
              <img src={img} alt="YouTube video" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                {loading ? (
                   <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {textPosition === 'bottom' && textElement}
    </div>
  );
};



export default function DashboardEditor() {
  const { bio, bios, selectBio, updateBio, getBios } = useContext(BioContext);
  const { user } = useContext(AuthContext);
  const [blocks, setBlocks] = useState<BioBlock[]>([]);
  const [dragItem, setDragItem] = useState<{ source: "palette" | "canvas"; type?: BioBlock["type"]; id?: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"blocks" | "settings">("blocks");
  const [bgType, setBgType] = useState<"color" | "image" | "video" | "grid" | "dots" | "waves" | "polka" | "stripes" | "zigzag" | "mesh" | "particles" | "noise" | "abstract">("color");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [bgSecondaryColor, setBgSecondaryColor] = useState("#e2e8f0");
  const [bgImage, setBgImage] = useState("");
  const [bgVideo, setBgVideo] = useState("");
  const [usernameColor, setUsernameColor] = useState("#111827");
  const [imageStyle, setImageStyle] = useState("circle");
  const [shareData, setShareData] = useState<{ url: string; title: string } | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const filteredPalette = useMemo(() => {
    if (!searchQuery) return palette;
    return palette.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const groupedPalette = useMemo(() => {
    const groups: Record<string, typeof palette> = {};
    filteredPalette.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredPalette]);

  useEffect(() => {
    if (!bio) getBios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bio?.id]);

  useEffect(() => {
    if (bio) {
      setBlocks((bio.blocks as BioBlock[] | null) ?? defaultBlocks());
      setBgType((bio.bgType as any) || "color");
      setBgColor(bio.bgColor || "#f8fafc");
      setBgSecondaryColor(bio.bgSecondaryColor || "#e2e8f0");
      setBgImage(bio.bgImage || "");
      setBgVideo(bio.bgVideo || "");
      setUsernameColor(bio.usernameColor || "#111827");
      setImageStyle(bio.imageStyle || "circle");
    }
  }, [bio?.id, bio?.blocks]);

  useEffect(() => {
    // Initialize Subscribe Modal logic for Preview
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
  }, []);

  const handleDrop = (index?: number, event?: React.DragEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (!dragItem) return;
    setBlocks((prev) => {
      const next = [...prev];

      if (dragItem.source === "palette" && dragItem.type) {
        const newBlock: BioBlock = {
          id: makeId(),
          type: dragItem.type,
          title: dragItem.type === "button" ? "New button" : dragItem.type === "heading" ? "New heading" : dragItem.type === "video" ? "New video" : "New block",
          body: dragItem.type === "text" ? "Describe something here." : undefined,
          href: dragItem.type === "button" ? "https://" : undefined,
          align: "center",
          accent: dragItem.type === "button" ? "#111827" : undefined,
          mediaUrl: dragItem.type === "image" ? "https://placehold.co/1200x600" : dragItem.type === "video" ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : undefined,
          buttonStyle: "solid",
          buttonShape: "rounded",
          socials: dragItem.type === "socials" ? { instagram: "", twitter: "", linkedin: "" } : undefined,
          socialsLayout: "row",
          socialsLabel: false,
          blogLayout: dragItem.type === "blog" ? "carousel" : undefined,
          blogCardStyle: dragItem.type === "blog" ? "featured" : undefined,
          blogPostCount: dragItem.type === "blog" ? 3 : undefined,
          products: dragItem.type === "product" ? [
            { id: makeId(), title: "Product 1", price: "$19.99", image: "https://placehold.co/300x300", url: "#" },
            { id: makeId(), title: "Product 2", price: "$29.99", image: "https://placehold.co/300x300", url: "#" },
            { id: makeId(), title: "Product 3", price: "$39.99", image: "https://placehold.co/300x300", url: "#" }
          ] : undefined,
          productLayout: dragItem.type === "product" ? "grid" : undefined,
          calendarTitle: dragItem.type === "calendar" ? "Book a Call" : undefined,
          calendarUrl: dragItem.type === "calendar" ? "https://calendly.com" : undefined,
          calendarColor: dragItem.type === "calendar" ? "#ffffff" : undefined,
          calendarTextColor: dragItem.type === "calendar" ? "#1f2937" : undefined,
          calendarAccentColor: dragItem.type === "calendar" ? "#2563eb" : undefined,
          mapTitle: dragItem.type === "map" ? "Our Office" : undefined,
          mapAddress: dragItem.type === "map" ? "123 Main St, City" : undefined,
          featuredTitle: dragItem.type === "featured" ? "Glow lipstick" : undefined,
          featuredPrice: dragItem.type === "featured" ? "$19.99" : undefined,
          featuredImage: dragItem.type === "featured" ? "https://placehold.co/300x300" : undefined,
          eventTitle: dragItem.type === "event" ? "Live Webinar" : undefined,
          eventDate: dragItem.type === "event" ? new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] + "T18:00" : undefined,
          eventColor: dragItem.type === "event" ? "#111827" : undefined,
          eventTextColor: dragItem.type === "event" ? "#ffffff" : undefined,
          eventButtonText: dragItem.type === "event" ? "Register Now" : undefined,
          eventButtonUrl: dragItem.type === "event" ? "#" : undefined,
          featuredUrl: dragItem.type === "featured" ? "#" : undefined,
          youtubeUrl: dragItem.type === "youtube" ? "https://youtube.com/@youtube" : undefined,
          youtubeDisplayType: dragItem.type === "youtube" ? "grid" : undefined,
          youtubeShowText: dragItem.type === "youtube" ? true : undefined,
          youtubeTextPosition: dragItem.type === "youtube" ? "bottom" : undefined,
          youtubeTextColor: dragItem.type === "youtube" ? "#ff0000" : undefined,
          featuredColor: dragItem.type === "featured" ? "#1f4d36" : undefined,
          featuredTextColor: dragItem.type === "featured" ? "#ffffff" : undefined,
          affiliateTitle: dragItem.type === "affiliate" ? "Copy my coupon code" : undefined,
          affiliateCode: dragItem.type === "affiliate" ? "ILoveMatcha" : undefined,
          affiliateImage: dragItem.type === "affiliate" ? "https://placehold.co/300x300" : undefined,
          affiliateUrl: dragItem.type === "affiliate" ? "#" : undefined,
        };
        const targetIndex = typeof index === "number" ? index : next.length;
        next.splice(targetIndex, 0, newBlock);
        setExpandedId(newBlock.id);
        return next;
      }

      if (dragItem.source === "canvas" && dragItem.id) {
        // For canvas reordering, the live swap in onDragEnter handles the order.
        // We just need to clear the drag state, which happens at the end of this function.
        return next;
      }

      return next;
    });
    setDragItem(null);
  };

  const handleSave = async () => {
    if (!bio) return;
    setIsSaving(true);
    setStatus("idle");
    try {
      const html = blocksToHtml(blocks, user, { ...bio, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, usernameColor, imageStyle });
      await updateBio(bio.id, { html, blocks, bgType, bgColor, bgSecondaryColor, bgImage, bgVideo, usernameColor, imageStyle });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (id: string, key: keyof BioBlock, value: any) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, [key]: value } : block)));
  };

  const handleRemove = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const previewBlocks = useMemo(() => blocks, [blocks]);

  if (!bio) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto bg-surface border border-border rounded-2xl p-8 text-center">
          <p className="text-lg text-text-muted">Create or select a bio to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-alt/60">
      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes wobble { 0% { transform: translateX(0%); } 15% { transform: translateX(-25%) rotate(-5deg); } 30% { transform: translateX(20%) rotate(3deg); } 45% { transform: translateX(-15%) rotate(-3deg); } 60% { transform: translateX(10%) rotate(2deg); } 75% { transform: translateX(-5%) rotate(-1deg); } 100% { transform: translateX(0%); } }
      `}</style>
      <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-text-muted">Drag & drop editor</p>
            <h1 className="text-3xl font-bold text-text-main">Build your bio</h1>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setShowMobilePreview(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-xl bg-white border border-border px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview
            </button>
            <div className="flex items-center bg-white rounded-xl border border-border shadow-sm p-1">
              <button
                onClick={() => setShareData({ url: `https://${bio.sufix}.portyo.me`, title: `@${bio.sufix}` })}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              >
                Share
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1"></div>
              <a
                href={`https://${bio.sufix}.portyo.me`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              >
                Open page
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              </a>
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white shadow-md hover:bg-gray-900 transition"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save bio"}
            </button>
            {status === "saved" && <span className="text-sm text-green-600">Saved</span>}
            {status === "error" && <span className="text-sm text-red-600">Error saving</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_360px] gap-5 items-start">
          <section className="bg-white border border-border rounded-2xl p-4 shadow-sm h-auto max-h-[500px] lg:max-h-none lg:h-[calc(100vh-140px)] overflow-y-auto relative lg:sticky top-0 lg:top-24 scrollbar-hide">
            <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
              <button
                onClick={() => setActiveTab("blocks")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "blocks" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Blocks
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "settings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Settings
              </button>
            </div>

            {activeTab === "blocks" ? (
              <>
                <div className="mb-6">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input 
                      type="text" 
                      placeholder="Search" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  {Object.entries(groupedPalette).map(([category, items]) => (
                    <div key={category}>
                      <h3 
                        className="text-sm font-medium text-text-main mb-3 flex items-center gap-2 select-none cursor-pointer hover:text-primary transition-colors"
                        onClick={() => toggleCategory(category)}
                      >
                        <span className={`transform transition-transform duration-200 ${collapsedCategories.includes(category) ? '-rotate-90' : ''}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </span>
                        {category}
                      </h3>
                      {!collapsedCategories.includes(category) && (
                        <div className="grid grid-cols-3 gap-2">
                          {items.map((item) => (
                            <div
                              key={item.type}
                              draggable
                              onDragStart={() => setDragItem({ source: "palette", type: item.type })}
                              onDragEnd={() => setDragItem(null)}
                              className="flex flex-col items-center justify-center gap-2 p-2 rounded-xl border border-border hover:border-primary hover:bg-primary/5 cursor-grab active:cursor-grabbing bg-white transition-all aspect-square group"
                            >
                              <div className="text-gray-500 group-hover:text-primary transition-colors scale-90">
                                {item.icon}
                              </div>
                              <p className="font-medium text-xs text-text-main text-center leading-tight">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {Object.keys(groupedPalette).length === 0 && (
                    <div className="text-center py-8 text-text-muted text-sm">
                      No blocks found
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Background Type</label>
                  <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
                    {(['color', 'image', 'video', 'grid', 'dots', 'waves', 'polka', 'stripes', 'zigzag', 'mesh', 'particles', 'noise', 'abstract'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setBgType(type)}
                        className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                          bgType === type ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {bgType === "color" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Background Color</label>
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                      <div className="relative flex-shrink-0 w-10 h-10">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div 
                          className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95" 
                          style={{ backgroundColor: bgColor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <input 
                          type="text" 
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                          placeholder="#000000"
                        />
                        <p className="text-[10px] text-gray-400 mt-0.5">Hex color code</p>
                      </div>
                    </div>
                  </div>
                )}

                {['grid', 'dots', 'waves', 'polka', 'stripes', 'zigzag', 'mesh', 'particles', 'noise', 'abstract'].includes(bgType) && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Background Color</label>
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                        <div className="relative flex-shrink-0 w-10 h-10">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div 
                            className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95" 
                            style={{ backgroundColor: bgColor }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <input 
                            type="text" 
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                            placeholder="#000000"
                          />
                          <p className="text-[10px] text-gray-400 mt-0.5">Base color</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Pattern Color</label>
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                        <div className="relative flex-shrink-0 w-10 h-10">
                          <input
                            type="color"
                            value={bgSecondaryColor}
                            onChange={(e) => setBgSecondaryColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div 
                            className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95" 
                            style={{ backgroundColor: bgSecondaryColor }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <input 
                            type="text" 
                            value={bgSecondaryColor}
                            onChange={(e) => setBgSecondaryColor(e.target.value)}
                            className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                            placeholder="#000000"
                          />
                          <p className="text-[10px] text-gray-400 mt-0.5">Pattern accent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {bgType === "image" && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Image URL</label>
                    <input 
                      type="text" 
                      value={bgImage}
                      onChange={(e) => setBgImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <p className="text-xs text-gray-500 mt-2">Enter a direct link to an image.</p>
                  </div>
                )}

                {bgType === "video" && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Video URL</label>
                    <input 
                      type="text" 
                      value={bgVideo}
                      onChange={(e) => setBgVideo(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="w-full px-3 py-2 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <p className="text-xs text-gray-500 mt-2">Enter a direct link to an MP4 video.</p>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Profile Header</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Username Color</label>
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm">
                        <div className="relative flex-shrink-0 w-10 h-10">
                          <input
                            type="color"
                            value={usernameColor}
                            onChange={(e) => setUsernameColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div 
                            className="w-full h-full rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95" 
                            style={{ backgroundColor: usernameColor }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <input 
                            type="text" 
                            value={usernameColor}
                            onChange={(e) => setUsernameColor(e.target.value)}
                            className="w-full bg-transparent border-none text-sm font-medium text-gray-900 focus:ring-0 p-0 placeholder-gray-400"
                            placeholder="#000000"
                          />
                          <p className="text-[10px] text-gray-400 mt-0.5">Text color</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Profile Image Style</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { id: 'circle', label: 'Circle', style: { borderRadius: '50%' } },
                          { id: 'rounded', label: 'Rounded', style: { borderRadius: '8px' } },
                          { id: 'square', label: 'Square', style: { borderRadius: '0' } },
                          { id: 'star', label: 'Star', style: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' } },
                          { id: 'hexagon', label: 'Hex', style: { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' } },
                        ].map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setImageStyle(style.id)}
                            className={`aspect-square flex items-center justify-center bg-gray-100 rounded-lg border-2 transition-all ${
                              imageStyle === style.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent hover:bg-gray-200 text-gray-500'
                            }`}
                            title={style.label}
                          >
                            <div className="w-6 h-6 bg-current" style={style.style}></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-white border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-text-main">Layout</h2>
              <span className="text-xs text-text-muted">Drag to reorder</span>
            </div>
            <div
              className="min-h-[420px] border border-dashed border-border rounded-xl p-4 bg-surface-alt/50"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(undefined, event)}
              onDragEnter={(event) => event.preventDefault()}
            >
              {blocks.length === 0 && (
                <div className="h-full flex items-center justify-center text-text-muted text-sm">
                  Drop a block here to start.
                </div>
              )}

              {blocks.length > 0 && (
                <div
                  className={`transition-all duration-200 ease-out rounded-xl border-2 border-dashed flex items-center justify-center mb-2 ${
                    dragItem && dragItem.source === "palette"
                      ? "h-14 border-primary/30 bg-primary/5 opacity-100 hover:border-primary hover:bg-primary/10" 
                      : "h-0 border-transparent opacity-0 overflow-hidden"
                  }`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(0, event)}
                >
                  <span className="text-xs font-medium text-primary pointer-events-none">
                    Insert at top
                  </span>
                </div>
              )}

              {blocks.map((block, index) => (
                <div key={block.id} className="group">
                  <div
                    className={`rounded-xl mb-3 overflow-hidden transition-all duration-300 ${
                      dragItem?.id === block.id 
                        ? "border-2 border-dashed border-primary/40 bg-primary/5 opacity-100" 
                        : "border-2 border-transparent hover:border-primary/40 bg-white shadow-sm"
                    }`}
                    draggable
                    onDragStart={() => setDragItem({ source: "canvas", id: block.id })}
                    onDragEnd={() => setDragItem(null)}
                    onDrop={(event) => handleDrop(index, event)}
                    onDragOver={(event) => event.preventDefault()}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      if (dragItem?.source === "canvas" && dragItem.id !== block.id) {
                        setBlocks((prev) => {
                          const dragIndex = prev.findIndex((b) => b.id === dragItem.id);
                          const hoverIndex = prev.findIndex((b) => b.id === block.id);
                          if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) return prev;
                          
                          const next = [...prev];
                          const [moved] = next.splice(dragIndex, 1);
                          next.splice(hoverIndex, 0, moved);
                          return next;
                        });
                      }
                    }}
                  >
                    {dragItem?.id === block.id ? (
                      <div className="h-16 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary/60">Drop here</span>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center justify-between gap-3 p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedId(expandedId === block.id ? null : block.id)}
                      >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                          {/* Icon based on type */}
                          {block.type === 'heading' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/></svg>}
                          {block.type === 'text' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>}
                          {block.type === 'button' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                          {block.type === 'image' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>}
                          {block.type === 'socials' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>}
                          {block.type === 'video' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" ry="2"/><polygon points="10 9 15 12 10 15 10 9"/></svg>}
                          {block.type === 'divider' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-main">{block.title || block.type.charAt(0).toUpperCase() + block.type.slice(1)}</p>
                          <p className="text-xs text-text-muted">{block.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(block.id);
                          }}
                          type="button"
                          title="Remove block"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                        <div className={`transform transition-transform duration-200 ${expandedId === block.id ? 'rotate-180' : ''}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                      </div>
                    )}

                    {expandedId === block.id && dragItem?.id !== block.id && (
                      <div className="p-4 pt-0 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {block.type === "heading" && (
                          <div className="space-y-3 pt-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                              <input
                                value={block.title || ""}
                                onChange={(event) => handleFieldChange(block.id, "title", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Title"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Subtitle</label>
                              <textarea
                                value={block.body || ""}
                                onChange={(event) => handleFieldChange(block.id, "body", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Subtitle"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={block.textColor || "#000000"}
                                  onChange={(event) => handleFieldChange(block.id, "textColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Animation</label>
                              <div className="flex gap-2">
                                <select
                                  value={block.animation || "none"}
                                  onChange={(event) => handleFieldChange(block.id, "animation", event.target.value)}
                                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                  <option value="none">None</option>
                                  <option value="bounce">Bounce</option>
                                  <option value="pulse">Pulse</option>
                                  <option value="shake">Shake</option>
                                  <option value="wobble">Wobble</option>
                                </select>
                                {block.animation && block.animation !== "none" && (
                                  <select
                                    value={block.animationTrigger || "loop"}
                                    onChange={(event) => handleFieldChange(block.id, "animationTrigger", event.target.value)}
                                    className="w-32 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  >
                                    <option value="loop">Loop</option>
                                    <option value="once">Once</option>
                                    <option value="hover">Hover</option>
                                  </select>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "text" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Content</label>
                              <textarea
                                value={block.body || ""}
                                onChange={(event) => handleFieldChange(block.id, "body", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Write your text"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={block.textColor || "#4b5563"}
                                  onChange={(event) => handleFieldChange(block.id, "textColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Animation</label>
                              <div className="flex gap-2">
                                <select
                                  value={block.animation || "none"}
                                  onChange={(event) => handleFieldChange(block.id, "animation", event.target.value)}
                                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                  <option value="none">None</option>
                                  <option value="bounce">Bounce</option>
                                  <option value="pulse">Pulse</option>
                                  <option value="shake">Shake</option>
                                  <option value="wobble">Wobble</option>
                                </select>
                                {block.animation && block.animation !== "none" && (
                                  <select
                                    value={block.animationTrigger || "loop"}
                                    onChange={(event) => handleFieldChange(block.id, "animationTrigger", event.target.value)}
                                    className="w-32 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  >
                                    <option value="loop">Loop</option>
                                    <option value="once">Once</option>
                                    <option value="hover">Hover</option>
                                  </select>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "button" && (
                          <div className="space-y-3 pt-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Label</label>
                              <input
                                value={block.title || ""}
                                onChange={(event) => handleFieldChange(block.id, "title", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Button text"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">URL</label>
                              <input
                                value={block.href || ""}
                                onChange={(event) => handleFieldChange(block.id, "href", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Image URL (Optional)</label>
                              <input
                                value={block.buttonImage || ""}
                                onChange={(event) => handleFieldChange(block.id, "buttonImage", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://... (icon or photo)"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Text Alignment</label>
                              <div className="flex bg-gray-100 p-1 rounded-lg">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                  <button
                                    key={align}
                                    onClick={() => handleFieldChange(block.id, "buttonTextAlign", align)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                      (block.buttonTextAlign || 'center') === align 
                                        ? 'bg-white text-gray-900 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                  >
                                    {align.charAt(0).toUpperCase() + align.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Style</label>
                                <select
                                  value={block.buttonStyle || "solid"}
                                  onChange={(event) => handleFieldChange(block.id, "buttonStyle", event.target.value)}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                  <option value="solid">Solid</option>
                                  <option value="outline">Outline</option>
                                  <option value="ghost">Ghost</option>
                                  <option value="hard-shadow">Retro (Hard Shadow)</option>
                                  <option value="soft-shadow">Soft Shadow</option>
                                  <option value="3d">3D</option>
                                  <option value="glass">Glassmorphism</option>
                                  <option value="gradient">Gradient</option>
                                  <option value="neumorphism">Neumorphism</option>
                                  <option value="clay">Claymorphism</option>
                                  <option value="cyberpunk">Cyberpunk / Glitch</option>
                                  <option value="pixel">Pixel Art (8-bit)</option>
                                  <option value="neon">Neon Glow</option>
                                  <option value="sketch">Sketch / Hand-Drawn</option>
                                  <option value="gradient-border">Gradient Border</option>
                                  <option value="minimal-underline">Minimal Underline</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Shape</label>
                                <select
                                  value={block.buttonShape || "rounded"}
                                  onChange={(event) => handleFieldChange(block.id, "buttonShape", event.target.value)}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                  <option value="pill">Pill</option>
                                  <option value="rounded">Rounded</option>
                                  <option value="square">Square</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={block.accent || "#111827"}
                                    onChange={(event) => handleFieldChange(block.id, "accent", event.target.value)}
                                    className="h-9 w-full rounded cursor-pointer"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={block.textColor || "#ffffff"}
                                    onChange={(event) => handleFieldChange(block.id, "textColor", event.target.value)}
                                    className="h-9 w-full rounded cursor-pointer"
                                  />
                                </div>
                              </div>
                              {["hard-shadow", "soft-shadow", "3d", "gradient", "cyberpunk", "gradient-border", "neon", "pixel", "sketch", "neumorphism", "clay"].includes(block.buttonStyle || "") && (
                                <div className="col-span-2">
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">Secondary / Shadow Color</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={block.buttonShadowColor || block.accent || "#111827"}
                                      onChange={(event) => handleFieldChange(block.id, "buttonShadowColor", event.target.value)}
                                      className="h-9 w-full rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                              )}
                              <div className="col-span-2">
                                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={block.isNsfw || false}
                                    onChange={(event) => handleFieldChange(block.id, "isNsfw", event.target.checked as any)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  Sensitive Content (+18)
                                </label>
                              </div>
                              <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Animation</label>
                                <div className="flex gap-2">
                                  <select
                                    value={block.animation || "none"}
                                    onChange={(event) => handleFieldChange(block.id, "animation", event.target.value)}
                                    className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  >
                                    <option value="none">None</option>
                                    <option value="bounce">Bounce</option>
                                    <option value="pulse">Pulse</option>
                                    <option value="shake">Shake</option>
                                    <option value="wobble">Wobble</option>
                                  </select>
                                  {block.animation && block.animation !== "none" && (
                                    <select
                                      value={block.animationTrigger || "loop"}
                                      onChange={(event) => handleFieldChange(block.id, "animationTrigger", event.target.value)}
                                      className="w-32 rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    >
                                      <option value="loop">Loop</option>
                                      <option value="once">Once</option>
                                      <option value="hover">Hover</option>
                                    </select>
                                  )}
                                </div>
                              </div>                            </div>
                          </div>
                        )}

                        {block.type === "socials" && (
                          <div className="space-y-3 pt-3">
                            <p className="text-xs text-gray-500">Add your social media links below.</p>
                            
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
                                <select
                                  value={block.socialsLayout || "row"}
                                  onChange={(event) => handleFieldChange(block.id, "socialsLayout", event.target.value)}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                  <option value="row">Inline (Row)</option>
                                  <option value="column">List (Column)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Style</label>
                                <div className="flex items-center h-[38px]">
                                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={block.socialsLabel || false}
                                      onChange={(event) => handleFieldChange(block.id, "socialsLabel", event.target.checked as any)}
                                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    Show Text
                                  </label>
                                </div>
                              </div>
                            </div>

                            {['instagram', 'twitter', 'linkedin', 'youtube', 'github'].map((platform) => (
                              <div key={platform}>
                                <label className="text-xs font-medium text-gray-700 mb-1 block capitalize">{platform}</label>
                                <input
                                  value={block.socials?.[platform as keyof typeof block.socials] || ""}
                                  onChange={(event) => {
                                    const newSocials = { ...block.socials, [platform]: event.target.value };
                                    handleFieldChange(block.id, "socials", newSocials as any);
                                  }}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  placeholder={`https://${platform}.com/...`}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === "video" && (
                          <div className="pt-3">
                            <label className="text-xs font-medium text-gray-700 mb-1 block">YouTube URL</label>
                            <input
                              value={block.mediaUrl || ""}
                              onChange={(event) => handleFieldChange(block.id, "mediaUrl", event.target.value)}
                              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                        )}

                        {block.type === "image" && (
                          <div className="pt-3">
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Image URL</label>
                            <input
                              value={block.mediaUrl || ""}
                              onChange={(event) => handleFieldChange(block.id, "mediaUrl", event.target.value)}
                              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                              placeholder="https://..."
                            />
                          </div>
                        )}

                        {block.type === "blog" && (
                          <div className="pt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
                                <select
                                  value={block.blogLayout || "carousel"}
                                  onChange={(event) => handleFieldChange(block.id, "blogLayout", event.target.value)}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                  <option value="carousel">Carousel</option>
                                  <option value="list">List</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Card Style</label>
                                <select
                                  value={block.blogCardStyle || "featured"}
                                  onChange={(event) => handleFieldChange(block.id, "blogCardStyle", event.target.value)}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                  <option value="featured">Featured</option>
                                  <option value="minimal">Minimal</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Number of Posts: {block.blogPostCount || 3}</label>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={block.blogPostCount || 3}
                                onChange={(event) => handleFieldChange(block.id, "blogPostCount", event.target.value as any)}
                                className="w-full accent-primary cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>1</span>
                                <span>5</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "product" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Layout</label>
                              <select
                                value={block.productLayout || "grid"}
                                onChange={(event) => handleFieldChange(block.id, "productLayout", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                              >
                                <option value="grid">Grid</option>
                                <option value="list">List</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-700 block">Products</label>
                              {(block.products || []).map((product, index) => (
                                <div key={product.id} className="p-2 border border-gray-200 rounded-lg space-y-2">
                                  <input
                                    value={product.title}
                                    onChange={(e) => {
                                      const newProducts = [...(block.products || [])];
                                      newProducts[index] = { ...product, title: e.target.value };
                                      handleFieldChange(block.id, "products", newProducts as any);
                                    }}
                                    className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                                    placeholder="Product Title"
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      value={product.price}
                                      onChange={(e) => {
                                        const newProducts = [...(block.products || [])];
                                        newProducts[index] = { ...product, price: e.target.value };
                                        handleFieldChange(block.id, "products", newProducts as any);
                                      }}
                                      className="w-1/3 rounded border border-gray-200 px-2 py-1 text-xs"
                                      placeholder="Price"
                                    />
                                    <input
                                      value={product.url}
                                      onChange={(e) => {
                                        const newProducts = [...(block.products || [])];
                                        newProducts[index] = { ...product, url: e.target.value };
                                        handleFieldChange(block.id, "products", newProducts as any);
                                      }}
                                      className="w-2/3 rounded border border-gray-200 px-2 py-1 text-xs"
                                      placeholder="URL"
                                    />
                                  </div>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newProduct = { id: makeId(), title: "New Product", price: "$0.00", image: "https://placehold.co/300x300", url: "#" };
                                  handleFieldChange(block.id, "products", [...(block.products || []), newProduct] as any);
                                }}
                                className="w-full py-1.5 text-xs font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                              >
                                + Add Product
                              </button>
                            </div>
                          </div>
                        )}

                        {block.type === "calendar" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                              <input
                                value={block.calendarTitle || ""}
                                onChange={(event) => handleFieldChange(block.id, "calendarTitle", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Book a Call"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Booking URL</label>
                              <input
                                value={block.calendarUrl || ""}
                                onChange={(event) => handleFieldChange(block.id, "calendarUrl", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://calendly.com/..."
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                                <input
                                  type="color"
                                  value={block.calendarColor || "#ffffff"}
                                  onChange={(event) => handleFieldChange(block.id, "calendarColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Text</label>
                                <input
                                  type="color"
                                  value={block.calendarTextColor || "#1f2937"}
                                  onChange={(event) => handleFieldChange(block.id, "calendarTextColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Accent</label>
                                <input
                                  type="color"
                                  value={block.calendarAccentColor || "#2563eb"}
                                  onChange={(event) => handleFieldChange(block.id, "calendarAccentColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "map" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Location Name</label>
                              <input
                                value={block.mapTitle || ""}
                                onChange={(event) => handleFieldChange(block.id, "mapTitle", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="e.g. Our Office"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Address</label>
                              <input
                                value={block.mapAddress || ""}
                                onChange={(event) => handleFieldChange(block.id, "mapAddress", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="e.g. 123 Main St, City"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === "featured" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Product Title</label>
                              <input
                                value={block.featuredTitle || ""}
                                onChange={(event) => handleFieldChange(block.id, "featuredTitle", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Product Name"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Price</label>
                                <input
                                  value={block.featuredPrice || ""}
                                  onChange={(event) => handleFieldChange(block.id, "featuredPrice", event.target.value)}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  placeholder="$19.99"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Image URL</label>
                                <input
                                  value={block.featuredImage || ""}
                                  onChange={(event) => handleFieldChange(block.id, "featuredImage", event.target.value)}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Product URL</label>
                              <input
                                value={block.featuredUrl || ""}
                                onChange={(event) => handleFieldChange(block.id, "featuredUrl", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                                <input
                                  type="color"
                                  value={block.featuredColor || "#1f4d36"}
                                  onChange={(event) => handleFieldChange(block.id, "featuredColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                                <input
                                  type="color"
                                  value={block.featuredTextColor || "#ffffff"}
                                  onChange={(event) => handleFieldChange(block.id, "featuredTextColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "affiliate" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                              <input
                                value={block.affiliateTitle || ""}
                                onChange={(event) => handleFieldChange(block.id, "affiliateTitle", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Copy my coupon code"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Coupon Code</label>
                              <input
                                value={block.affiliateCode || ""}
                                onChange={(event) => handleFieldChange(block.id, "affiliateCode", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="CODE123"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Image URL</label>
                              <input
                                value={block.affiliateImage || ""}
                                onChange={(event) => handleFieldChange(block.id, "affiliateImage", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Affiliate URL</label>
                              <input
                                value={block.affiliateUrl || ""}
                                onChange={(event) => handleFieldChange(block.id, "affiliateUrl", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                                <input
                                  type="color"
                                  value={block.affiliateColor || "#ffffff"}
                                  onChange={(event) => handleFieldChange(block.id, "affiliateColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                                <input
                                  type="color"
                                  value={block.affiliateTextColor || "#1f2937"}
                                  onChange={(event) => handleFieldChange(block.id, "affiliateTextColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "event" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Event Title</label>
                              <input
                                value={block.eventTitle || ""}
                                onChange={(event) => handleFieldChange(block.id, "eventTitle", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Live Webinar"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Date & Time</label>
                              <input
                                type="datetime-local"
                                value={block.eventDate || ""}
                                onChange={(event) => handleFieldChange(block.id, "eventDate", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Button Text</label>
                                <input
                                  value={block.eventButtonText || ""}
                                  onChange={(event) => handleFieldChange(block.id, "eventButtonText", event.target.value)}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  placeholder="Register"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Button URL</label>
                                <input
                                  value={block.eventButtonUrl || ""}
                                  onChange={(event) => handleFieldChange(block.id, "eventButtonUrl", event.target.value)}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
                                <input
                                  type="color"
                                  value={block.eventColor || "#111827"}
                                  onChange={(event) => handleFieldChange(block.id, "eventColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                                <input
                                  type="color"
                                  value={block.eventTextColor || "#ffffff"}
                                  onChange={(event) => handleFieldChange(block.id, "eventTextColor", event.target.value)}
                                  className="h-9 w-full rounded cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "spotify" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Spotify URL</label>
                              <input
                                value={block.spotifyUrl || ""}
                                onChange={(event) => handleFieldChange(block.id, "spotifyUrl", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://open.spotify.com/track/..."
                              />
                              <p className="text-[10px] text-gray-500 mt-1">Supports tracks, albums, and playlists</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-700">Compact Player</label>
                                <button 
                                    onClick={() => handleFieldChange(block.id, "spotifyCompact", !block.spotifyCompact)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${block.spotifyCompact ? 'bg-blue-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${block.spotifyCompact ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>
                          </div>
                        )}

                        {block.type === "instagram" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Instagram Username</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                                <input
                                  value={block.instagramUsername || ""}
                                  onChange={(event) => handleFieldChange(block.id, "instagramUsername", event.target.value)}
                                  className="w-full rounded-lg border border-border pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  placeholder="username"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Display Type</label>
                              <select
                                value={block.instagramDisplayType || "grid"}
                                onChange={(event) => handleFieldChange(block.id, "instagramDisplayType", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                              >
                                <option value="grid">Grid (3 Columns)</option>
                                <option value="list">List (Vertical)</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-700">Show Username</label>
                                <button 
                                    onClick={() => handleFieldChange(block.id, "instagramShowText", block.instagramShowText === false ? true : false)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${block.instagramShowText !== false ? 'bg-blue-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${block.instagramShowText !== false ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {block.instagramShowText !== false && (
                                <>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">Text Position</label>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => handleFieldChange(block.id, "instagramTextPosition", "top")}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                                    block.instagramTextPosition === "top" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            >
                                                Top
                                            </button>
                                            <button
                                                onClick={() => handleFieldChange(block.id, "instagramTextPosition", "bottom")}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                                    (block.instagramTextPosition || "bottom") === "bottom" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            >
                                                Bottom
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                value={block.instagramTextColor || "#0095f6"}
                                                onChange={(event) => handleFieldChange(block.id, "instagramTextColor", event.target.value)}
                                                className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                                            />
                                            <span className="text-xs text-gray-500 uppercase">{block.instagramTextColor || "#0095f6"}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                          </div>
                        )}

                        {block.type === "tour" && (
                          <div className="pt-3 space-y-4">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Section Title</label>
                              <input
                                value={block.tourTitle || ""}
                                onChange={(event) => handleFieldChange(block.id, "tourTitle", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="TOURS"
                              />
                            </div>

                            <div className="space-y-3">
                              <label className="text-xs font-medium text-gray-700 block">Tour Dates</label>
                              
                              {(block.tours || []).map((tour, index) => (
                                <div key={tour.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 relative group">
                                  <button 
                                    onClick={() => {
                                      const newTours = [...(block.tours || [])];
                                      newTours.splice(index, 1);
                                      handleFieldChange(block.id, "tours", newTours);
                                    }}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  </button>

                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                      <label className="text-[10px] text-gray-500 uppercase font-bold">Date</label>
                                      <input
                                        value={tour.date}
                                        onChange={(e) => {
                                          const newTours = [...(block.tours || [])];
                                          newTours[index] = { ...tour, date: e.target.value };
                                          handleFieldChange(block.id, "tours", newTours);
                                        }}
                                        className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                                        placeholder="AUG 1"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-gray-500 uppercase font-bold">Location</label>
                                      <input
                                        value={tour.location}
                                        onChange={(e) => {
                                          const newTours = [...(block.tours || [])];
                                          newTours[index] = { ...tour, location: e.target.value };
                                          handleFieldChange(block.id, "tours", newTours);
                                        }}
                                        className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                                        placeholder="City, Country"
                                      />
                                    </div>
                                  </div>

                                  <div className="mb-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Image URL</label>
                                    <input
                                      value={tour.image || ""}
                                      onChange={(e) => {
                                        const newTours = [...(block.tours || [])];
                                        newTours[index] = { ...tour, image: e.target.value };
                                        handleFieldChange(block.id, "tours", newTours);
                                      }}
                                      className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                                      placeholder="https://..."
                                    />
                                  </div>

                                  <div className="mb-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Ticket Link</label>
                                    <input
                                      value={tour.ticketUrl || ""}
                                      onChange={(e) => {
                                        const newTours = [...(block.tours || [])];
                                        newTours[index] = { ...tour, ticketUrl: e.target.value };
                                        handleFieldChange(block.id, "tours", newTours);
                                      }}
                                      className="w-full bg-white rounded border border-gray-200 px-2 py-1 text-xs"
                                      placeholder="https://..."
                                    />
                                  </div>

                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={tour.sellingFast || false}
                                        onChange={(e) => {
                                          const newTours = [...(block.tours || [])];
                                          newTours[index] = { ...tour, sellingFast: e.target.checked, soldOut: e.target.checked ? false : tour.soldOut };
                                          handleFieldChange(block.id, "tours", newTours);
                                        }}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className="text-xs text-gray-600">Selling Fast</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={tour.soldOut || false}
                                        onChange={(e) => {
                                          const newTours = [...(block.tours || [])];
                                          newTours[index] = { ...tour, soldOut: e.target.checked, sellingFast: e.target.checked ? false : tour.sellingFast };
                                          handleFieldChange(block.id, "tours", newTours);
                                        }}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <span className="text-xs text-gray-600">Sold Out</span>
                                    </label>
                                  </div>
                                </div>
                              ))}

                              <button
                                onClick={() => {
                                  const newTours = [...(block.tours || [])];
                                  newTours.push({
                                    id: makeId(),
                                    date: "TBA",
                                    location: "City",
                                    image: "",
                                    ticketUrl: ""
                                  });
                                  handleFieldChange(block.id, "tours", newTours);
                                }}
                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add Tour Date
                              </button>
                            </div>
                          </div>
                        )}

                        {block.type === "youtube" && (
                          <div className="pt-3 space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">YouTube Channel URL</label>
                              <input
                                value={block.youtubeUrl || ""}
                                onChange={(event) => handleFieldChange(block.id, "youtubeUrl", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://youtube.com/@channel"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Display Type</label>
                              <select
                                value={block.youtubeDisplayType || "grid"}
                                onChange={(event) => handleFieldChange(block.id, "youtubeDisplayType", event.target.value)}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                              >
                                <option value="grid">Grid (3 Columns)</option>
                                <option value="list">List (Vertical)</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-700">Show Channel Link</label>
                                <button 
                                    onClick={() => handleFieldChange(block.id, "youtubeShowText", block.youtubeShowText === false ? true : false)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${block.youtubeShowText !== false ? 'bg-blue-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${block.youtubeShowText !== false ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {block.youtubeShowText !== false && (
                                <>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">Text Position</label>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => handleFieldChange(block.id, "youtubeTextPosition", "top")}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                                    block.youtubeTextPosition === "top" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            >
                                                Top
                                            </button>
                                            <button
                                                onClick={() => handleFieldChange(block.id, "youtubeTextPosition", "bottom")}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                                    (block.youtubeTextPosition || "bottom") === "bottom" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            >
                                                Bottom
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                value={block.youtubeTextColor || "#ff0000"}
                                                onChange={(event) => handleFieldChange(block.id, "youtubeTextColor", event.target.value)}
                                                className="h-9 w-9 rounded cursor-pointer border-0 p-0"
                                            />
                                            <span className="text-xs text-gray-500 uppercase">{block.youtubeTextColor || "#ff0000"}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                          </div>
                        )}



                        {block.type === "divider" && (
                          <p className="text-xs text-text-muted pt-3">Simple dividing line.</p>
                        )}

                        <div className="pt-2 border-t border-gray-50">
                          <label className="text-xs font-medium text-gray-700 mb-2 block">Alignment</label>
                          <div className="flex bg-gray-100 p-1 rounded-lg">
                            {(['left', 'center', 'right'] as const).map((align) => (
                              <button
                                key={align}
                                onClick={() => handleFieldChange(block.id, "align", align)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                                  (block.align || 'center') === align 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                {align.charAt(0).toUpperCase() + align.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`bg-transparent border-none p-0 shadow-none ${showMobilePreview ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4' : 'hidden lg:block'}`}>
            {showMobilePreview && (
                <button 
                    onClick={() => setShowMobilePreview(false)}
                    className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg z-50 text-gray-900 hover:bg-gray-100 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            )}
            <div className={`flex justify-center ${showMobilePreview ? 'scale-90 sm:scale-100' : 'sticky top-4'}`}>
              <div className="relative w-[320px] h-[640px] bg-black rounded-[3rem] shadow-2xl border-[8px] border-gray-900 ring-1 ring-white/10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-36 bg-black rounded-b-2xl z-20 border-b border-x border-white/10"></div>
                
                {/* Side buttons */}
                <div className="absolute -left-[10px] top-28 h-12 w-[3px] bg-gray-800 rounded-l-md"></div>
                <div className="absolute -left-[10px] top-44 h-12 w-[3px] bg-gray-800 rounded-l-md"></div>
                <div className="absolute -right-[10px] top-36 h-16 w-[3px] bg-gray-800 rounded-r-md"></div>

                {/* Screen */}
                <div 
                  className="w-full h-full rounded-[2.5rem] overflow-hidden relative flex flex-col"
                  style={{
                    backgroundColor: bgColor,
                    backgroundImage: 
                      bgType === 'image' ? `url(${bgImage})` : 
                      bgType === 'grid' ? `linear-gradient(${bgSecondaryColor} 1px, transparent 1px), linear-gradient(90deg, ${bgSecondaryColor} 1px, transparent 1px)` :
                      bgType === 'dots' ? `radial-gradient(${bgSecondaryColor} 1px, transparent 1px)` :
                      bgType === 'polka' ? `radial-gradient(${bgSecondaryColor} 20%, transparent 20%), radial-gradient(${bgSecondaryColor} 20%, transparent 20%)` :
                      bgType === 'stripes' ? `repeating-linear-gradient(45deg, ${bgColor}, ${bgColor} 10px, ${bgSecondaryColor} 10px, ${bgSecondaryColor} 20px)` :
                      bgType === 'zigzag' ? `linear-gradient(135deg, ${bgSecondaryColor} 25%, transparent 25%), linear-gradient(225deg, ${bgSecondaryColor} 25%, transparent 25%), linear-gradient(45deg, ${bgSecondaryColor} 25%, transparent 25%), linear-gradient(315deg, ${bgSecondaryColor} 25%, ${bgColor} 25%)` :
                      bgType === 'waves' ? `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='${encodeURIComponent(bgSecondaryColor)}' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` :
                      bgType === 'mesh' ? `radial-gradient(at 40% 20%, ${bgSecondaryColor} 0px, transparent 50%), radial-gradient(at 80% 0%, ${bgSecondaryColor} 0px, transparent 50%), radial-gradient(at 0% 50%, ${bgSecondaryColor} 0px, transparent 50%)` :
                      bgType === 'particles' ? `radial-gradient(${bgSecondaryColor} 2px, transparent 2px), radial-gradient(${bgSecondaryColor} 2px, transparent 2px)` :
                      bgType === 'noise' ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` :
                      bgType === 'abstract' ? `linear-gradient(30deg, ${bgSecondaryColor} 12%, transparent 12.5%, transparent 87%, ${bgSecondaryColor} 87.5%, ${bgSecondaryColor}), linear-gradient(150deg, ${bgSecondaryColor} 12%, transparent 12.5%, transparent 87%, ${bgSecondaryColor} 87.5%, ${bgSecondaryColor}), linear-gradient(30deg, ${bgSecondaryColor} 12%, transparent 12.5%, transparent 87%, ${bgSecondaryColor} 87.5%, ${bgSecondaryColor}), linear-gradient(150deg, ${bgSecondaryColor} 12%, transparent 12.5%, transparent 87%, ${bgSecondaryColor} 87.5%, ${bgSecondaryColor}), linear-gradient(60deg, ${bgSecondaryColor}77 25%, transparent 25.5%, transparent 75%, ${bgSecondaryColor}77 75%, ${bgSecondaryColor}77), linear-gradient(60deg, ${bgSecondaryColor}77 25%, transparent 25.5%, transparent 75%, ${bgSecondaryColor}77 75%, ${bgSecondaryColor}77)` :
                      undefined,
                    backgroundSize: 
                      bgType === 'image' ? 'cover' : 
                      bgType === 'grid' || bgType === 'dots' || bgType === 'stripes' || bgType === 'zigzag' ? '20px 20px' :
                      bgType === 'polka' ? '20px 20px' :
                      bgType === 'waves' ? 'auto' :
                      bgType === 'particles' ? '32px 32px' :
                      bgType === 'abstract' ? '20px 35px' :
                      'cover',
                    backgroundPosition: 
                      bgType === 'image' ? 'center' : 
                      bgType === 'polka' ? '0 0, 10px 10px' :
                      bgType === 'zigzag' ? '10px 0, 10px 0, 0 0, 0 0' :
                      bgType === 'particles' ? '0 0, 16px 16px' :
                      bgType === 'abstract' ? '0 0, 0 0, 10px 18px, 10px 18px, 0 0, 10px 18px' :
                      'center',
                    backgroundRepeat: 
                      bgType === 'image' ? 'no-repeat' : 'repeat',
                  }}
                >
                  {bgType === 'video' && bgVideo && (
                    <>
                      <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      >
                        <source src={bgVideo} type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 bg-black/30 z-0" />
                    </>
                  )}

                  {/* Status Bar Area */}
                  <div className="absolute top-0 w-full h-12 z-10 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                  
                  {/* Background Pattern */}
                  {bgType === 'color' && (
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                         style={{ 
                           backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px)', 
                           backgroundSize: '40px 100%' 
                         }} 
                    />
                  )}

                  {/* Top Navigation Bar */}
                  <div className="relative z-20 px-6 pt-14 pb-2 flex items-center justify-between">
                    <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </button>
                    <button className="h-10 px-4 rounded-full bg-white shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                      Subscribe
                    </button>
                  </div>

                  {/* Content Scrollable Area */}
                  <div className="flex-1 overflow-y-auto pb-8 px-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                    {/* User Profile Section */}
                    <div className="flex flex-col items-center gap-2 pt-8 pb-6">
                      <div 
                        className={`w-24 h-24 bg-gray-100 shadow-sm overflow-hidden ${
                          imageStyle === 'circle' ? 'rounded-full border-4 border-white' : 
                          imageStyle === 'rounded' ? 'rounded-2xl border-4 border-white' : 
                          imageStyle === 'square' ? 'rounded-none border-4 border-white' : 
                          ''
                        }`}
                        style={{
                          clipPath: 
                            imageStyle === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                            imageStyle === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                            undefined
                        }}
                      >
                        <img 
                          src={`/users-photos/${user?.id}.png`} 
                          onError={(e) => { e.currentTarget.src = `/users-photos/julia-soares.jpeg`; }}
                          alt={user?.fullname} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold" style={{ color: usernameColor }}>@{bio.sufix}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {previewBlocks.map((block) => {
                        if (block.type === "heading") {
                          const trigger = block.animationTrigger || 'loop';
                          const isHover = trigger === 'hover';
                          const animationStyle = block.animation && block.animation !== 'none' && !isHover
                            ? { animation: `${block.animation} 1s ${trigger === 'once' ? '1' : 'infinite'}` } 
                            : {};
                          const hoverClass = isHover && block.animation && block.animation !== 'none' ? `hover-anim-${block.id}` : '';

                          return (
                            <div key={block.id} className={`${textAlignClass(block.align)} py-2 ${hoverClass}`} style={animationStyle}>
                              {isHover && <style>{`.${hoverClass}:hover { animation: ${block.animation} 1s infinite; }`}</style>}
                              <h3 className="text-2xl font-bold leading-tight break-words" style={{ color: block.textColor || "#000000" }}>{block.title || "Heading"}</h3>
                              {block.body && <p className="mt-2 text-sm leading-relaxed break-words" style={{ color: block.textColor ? `${block.textColor}b3` : "#6b7280" }}>{block.body}</p>}
                            </div>
                          );
                        }

                        if (block.type === "text") {
                          const trigger = block.animationTrigger || 'loop';
                          const isHover = trigger === 'hover';
                          const animationStyle = block.animation && block.animation !== 'none' && !isHover
                            ? { animation: `${block.animation} 1s ${trigger === 'once' ? '1' : 'infinite'}` } 
                            : {};
                          const hoverClass = isHover && block.animation && block.animation !== 'none' ? `hover-anim-${block.id}` : '';

                          return (
                            <div key={block.id} className={`${textAlignClass(block.align)} ${hoverClass}`} style={animationStyle}>
                              {isHover && <style>{`.${hoverClass}:hover { animation: ${block.animation} 1s infinite; }`}</style>}
                              <p className="text-sm leading-relaxed break-words" style={{ color: block.textColor || "#4b5563" }}>{block.body}</p>
                            </div>
                          );
                        }

                        if (block.type === "button") {
                          const isDark = block.accent === "#111827" || block.accent === "#000000" || !block.accent;
                          const textColor = block.textColor || (isDark ? "#ffffff" : "#111827");
                          const style = block.buttonStyle || "solid";
                          const shape = block.buttonShape || "rounded";
                          const textAlign = block.buttonTextAlign || "center";
                          
                          let buttonClass = `relative flex items-center min-h-[60px] px-6 py-3 text-sm font-semibold w-full transition-transform active:scale-95 border`;
                          
                          // Shape
                          if (shape === "pill") buttonClass += " rounded-full";
                          else if (shape === "square") buttonClass += " rounded-lg";
                          else buttonClass += " rounded-2xl";

                          // Style
                          const bg = block.accent || "#111827";
                          const shadowColor = block.buttonShadowColor || bg;
                          let inlineStyle: React.CSSProperties = {};

                          if (style === "outline") {
                            buttonClass += " bg-transparent";
                            inlineStyle = { borderColor: bg, color: bg };
                          } else if (style === "ghost") {
                            buttonClass += " bg-transparent border-transparent shadow-none";
                            inlineStyle = { color: bg };
                          } else if (style === "hard-shadow") {
                            buttonClass += " border-solid";
                            inlineStyle = { 
                                backgroundColor: bg, 
                                color: textColor, 
                                borderColor: shadowColor,
                                borderWidth: '2px',
                                boxShadow: `4px 4px 0px 0px ${shadowColor}`,
                            };
                          } else if (style === "soft-shadow") {
                            buttonClass += " border-transparent";
                            inlineStyle = { 
                                backgroundColor: bg, 
                                color: textColor,
                                boxShadow: `0 10px 15px -3px ${shadowColor}40, 0 4px 6px -2px ${shadowColor}20`
                            };
                          } else if (style === "3d") {
                            buttonClass += " border-transparent active:translate-y-[2px] active:border-b-[2px]";
                            inlineStyle = { 
                                backgroundColor: bg, 
                                color: textColor,
                                borderBottom: `4px solid ${shadowColor}`,
                                transition: 'all 0.1s'
                            };
                          } else if (style === "glass") {
                            buttonClass += " border border-white/30 backdrop-blur-md bg-white/20";
                            inlineStyle = { color: textColor };
                          } else if (style === "gradient") {
                            buttonClass += " border-none";
                            inlineStyle = { 
                                background: `linear-gradient(45deg, ${bg}, ${shadowColor})`,
                                color: textColor 
                            };
                          } else if (style === "neumorphism") {
                            buttonClass += " border-none";
                            inlineStyle = { 
                                backgroundColor: bg,
                                color: textColor,
                                boxShadow: `-5px -5px 10px rgba(255,255,255,0.5), 5px 5px 10px ${shadowColor}40`
                            };
                          } else if (style === "clay") {
                            buttonClass += " border-none rounded-3xl";
                            inlineStyle = { 
                                backgroundColor: bg,
                                color: textColor,
                                boxShadow: `inset 6px 6px 12px rgba(255,255,255,0.4), inset -6px -6px 12px ${shadowColor}20, 8px 16px 24px ${shadowColor}40`
                            };
                          } else if (style === "cyberpunk") {
                            buttonClass += " border-l-4 font-mono uppercase rounded-none";
                            inlineStyle = { 
                                backgroundColor: bg,
                                color: textColor,
                                borderColor: shadowColor,
                                clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)'
                            };
                          } else if (style === "pixel") {
                            buttonClass += " border-none rounded-none m-1";
                            inlineStyle = { 
                                backgroundColor: bg,
                                color: textColor,
                                boxShadow: `-3px 0 0 0 ${shadowColor}, 3px 0 0 0 ${shadowColor}, 0 -3px 0 0 ${shadowColor}, 0 3px 0 0 ${shadowColor}`
                            };
                          } else if (style === "neon") {
                            buttonClass += " bg-transparent border-2";
                            inlineStyle = { 
                                borderColor: bg,
                                color: bg,
                                boxShadow: `0 0 10px ${shadowColor}, inset 0 0 10px ${shadowColor}`,
                                textShadow: `0 0 5px ${shadowColor}`
                            };
                          } else if (style === "sketch") {
                            buttonClass += " bg-transparent border-2";
                            inlineStyle = { 
                                borderColor: shadowColor,
                                color: bg,
                                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'
                            };
                          } else if (style === "gradient-border") {
                            buttonClass += " border-2 border-transparent bg-clip-padding";
                            inlineStyle = { 
                                background: `linear-gradient(#fff, #fff) padding-box, linear-gradient(to right, ${bg}, ${shadowColor}) border-box`,
                                color: bg
                            };
                          } else if (style === "minimal-underline") {
                            buttonClass += " bg-transparent border-b-4 border-t-0 border-x-0 rounded-none px-0";
                            inlineStyle = { 
                                borderColor: bg,
                                color: bg,
                                justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'
                            };
                          } else {
                            // Solid
                            buttonClass += " shadow-sm border-transparent";
                            inlineStyle = { backgroundColor: bg, color: textColor };
                          }

                          const trigger = block.animationTrigger || 'loop';
                          const isHover = trigger === 'hover';
                          const animationStyle = block.animation && block.animation !== 'none' && !isHover
                            ? { animation: `${block.animation} 1s ${trigger === 'once' ? '1' : 'infinite'}` } 
                            : {};
                          const hoverClass = isHover && block.animation && block.animation !== 'none' ? `hover-anim-${block.id}` : '';

                          return (
                            <div key={block.id} className={`flex ${alignmentClass(block.align)}`}>
                              {isHover && <style>{`.${hoverClass}:hover { animation: ${block.animation} 1s infinite; }`}</style>}
                              <a
                                className={`${buttonClass} ${hoverClass}`}
                                style={{ ...inlineStyle, ...animationStyle }}
                              >
                                {block.buttonImage && (
                                  <img 
                                    src={block.buttonImage} 
                                    alt="" 
                                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-lg object-cover" 
                                  />
                                )}
                                <span className={`flex-1 ${block.buttonImage ? 'pl-[66px]' : ''} text-${textAlign}`}>
                                  {block.title || "Button"}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShareData({ url: block.href || "", title: block.title || "" });
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/10 transition-colors z-10"
                                  style={{ color: inlineStyle.color }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                </button>
                              </a>
                            </div>
                          );
                        }

                        if (block.type === "socials") {
                          const links = block.socials || {};
                          const hasLinks = Object.values(links).some(url => url);
                          const layout = block.socialsLayout || "row";
                          const showLabel = block.socialsLabel || false;
                          
                          return (
                            <div key={block.id} className={`flex ${layout === 'column' ? 'flex-col' : 'flex-wrap'} gap-3 ${alignmentClass(block.align)}`}>
                              {!hasLinks && <div className="w-full text-center text-xs text-gray-400 italic">Add social links to see them here</div>}
                              {Object.entries(links).map(([platform, url]) => {
                                if (!url) return null;
                                return (
                                  <a key={platform} href={url} target="_blank" rel="noreferrer" 
                                     className={`
                                        flex items-center justify-center
                                        ${showLabel ? 'px-4 py-3 rounded-xl' : 'p-3 rounded-full'} 
                                        bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors
                                        ${layout === 'column' ? 'w-full' : ''}
                                     `}>
                                    {/* Simple icons for preview */}
                                    {platform === 'instagram' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>}
                                    {platform === 'twitter' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>}
                                    {platform === 'linkedin' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>}
                                    {platform === 'youtube' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>}
                                    {platform === 'github' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>}
                                    {showLabel && <span className="ml-2 font-medium capitalize">{platform}</span>}
                                  </a>
                                );
                              })}
                            </div>
                          );
                        }

                        if (block.type === "video") {
                          const videoId = block.mediaUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                          return (
                            <div key={block.id} className={`flex ${alignmentClass(block.align)}`}>
                              <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
                                {videoId ? (
                                  <iframe 
                                    src={`https://www.youtube.com/embed/${videoId}`} 
                                    className="absolute inset-0 w-full h-full" 
                                    allowFullScreen 
                                    title="YouTube video"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                    Enter YouTube URL
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        if (block.type === "image") {
                          return (
                            <div key={block.id} className={`flex ${alignmentClass(block.align)}`}>
                              {block.mediaUrl ? (
                                <div className="p-1 bg-white rounded-3xl border border-gray-100 shadow-sm w-full">
                                  <img src={block.mediaUrl} alt="bio" className="rounded-2xl w-full max-h-64 object-cover" />
                                </div>
                              ) : (
                                <div className="rounded-2xl bg-gray-100 border border-gray-200 h-32 w-full" />
                              )}
                            </div>
                          );
                        }

                        if (block.type === "blog") {
                          const posts = Array.from({ length: block.blogPostCount || 3 }).map((_, i) => ({
                            title: `Blog Post Title ${i + 1}`,
                            category: "Lifestyle",
                            readTime: "5 min read",
                            image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Post",
                            author: "By You"
                          }));
                          const layout = block.blogLayout || "carousel";
                          const cardStyle = block.blogCardStyle || "featured";

                          return (
                            <div key={block.id} className="relative group/carousel">
                              {layout === 'carousel' && (
                                <>
                                  <button 
                                    onClick={() => document.getElementById(`preview-blog-${block.id}`)?.scrollBy({ left: -230, behavior: 'smooth' })}
                                    className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                  </button>
                                  <button 
                                    onClick={() => document.getElementById(`preview-blog-${block.id}`)?.scrollBy({ left: 230, behavior: 'smooth' })}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                  </button>
                                </>
                              )}
                              <div 
                                id={`preview-blog-${block.id}`}
                                className={`w-full ${layout === 'carousel' ? 'overflow-x-auto px-10 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden' : 'flex flex-col gap-3'}`}
                                style={layout === 'carousel' ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
                              >
                                <div className={`${layout === 'carousel' ? 'flex gap-3 w-max' : 'flex flex-col gap-3'}`}>
                                  {posts.map((post, i) => (
                                    <article 
                                      key={i}
                                      className={`
                                        ${cardStyle === 'featured' 
                                          ? 'bg-amber-100 p-3 rounded-2xl flex flex-col gap-2.5 w-[200px]' 
                                          : 'bg-white border border-gray-200 p-3.5 rounded-2xl w-[160px]'}
                                        ${layout === 'list' ? 'w-full' : ''}
                                        shrink-0 snap-start
                                      `}
                                    >
                                      {cardStyle === 'featured' ? (
                                        <>
                                          <div className="aspect-[16/10] w-full bg-slate-200 rounded-xl overflow-hidden">
                                            <img src={post.image} alt="" className="w-full h-full object-cover" />
                                          </div>
                                          <div className="flex gap-1.5">
                                            <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-600">{post.category}</span>
                                            <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-600">{post.readTime}</span>
                                          </div>
                                          <h3 className="text-base font-extrabold text-gray-800 leading-tight">{post.title}</h3>
                                          <div className="flex items-center gap-1.5 mt-auto pt-1">
                                            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                                            <span className="text-xs text-gray-600">{post.author}</span>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <h3 className="font-bold text-sm text-gray-800 mb-1.5">{post.title}</h3>
                                          <div className="flex justify-between items-center">
                                            <span className="text-[11px] text-gray-500">{post.readTime}</span>
                                            <span className="text-[11px] font-medium text-blue-600">Read more &rarr;</span>
                                          </div>
                                        </>
                                      )}
                                    </article>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (block.type === "product") {
                          const products = block.products || [];
                          const layout = block.productLayout || "grid";
                          
                          return (
                            <div key={block.id} className={`${layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}`}>
                              {products.map((product) => (
                                <a key={product.id} href={product.url} className="block group">
                                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                    <div className="aspect-square w-full bg-gray-100">
                                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3">
                                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{product.title}</h3>
                                      <p className="text-sm font-bold text-primary mt-1">{product.price}</p>
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          );
                        }

                        if (block.type === "calendar") {
                          const title = block.calendarTitle || "Book a Call";
                          const url = block.calendarUrl || "#";
                          const bgColor = block.calendarColor || "#ffffff";
                          const textColor = block.calendarTextColor || "#1f2937";
                          const accentColor = block.calendarAccentColor || "#2563eb";
                          const today = new Date().getDate();
                          
                          return (
                            <div key={block.id}>
                              <a href={url} className="block rounded-3xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all" style={{ backgroundColor: bgColor }}>
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-bold text-lg" style={{ color: textColor }}>{title}</h3>
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>Book Now</span>
                                </div>
                                <div className="rounded-2xl p-4" style={{ backgroundColor: bgColor === '#ffffff' ? '#f8fafc' : 'rgba(0,0,0,0.05)' }}>
                                  <div className="flex justify-between mb-3 text-xs font-semibold" style={{ color: textColor }}>
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                  </div>
                                  <div className="grid grid-cols-7 gap-2 text-center text-xs" style={{ color: `${textColor}99` }}>
                                    {Array.from({ length: 31 }, (_, i) => {
                                      const day = i + 1;
                                      const isToday = day === today;
                                      return (
                                        <span 
                                          key={day}
                                          className={isToday ? "rounded-full w-6 h-6 flex items-center justify-center mx-auto" : ""}
                                          style={isToday ? { backgroundColor: accentColor, color: 'white' } : {}}
                                        >
                                          {day}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              </a>
                            </div>
                          );
                        }

                        if (block.type === "map") {
                          const title = block.mapTitle || "Our Office";
                          const address = block.mapAddress || "123 Main St, City";
                          const encodedAddress = encodeURIComponent(address);
                          
                          return (
                            <div key={block.id} className="relative h-48 rounded-3xl overflow-hidden border border-gray-200 bg-gray-50">
                              <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight={0} 
                                marginWidth={0} 
                                src={`https://maps.google.com/maps?q=${encodedAddress}&t=m&z=15&output=embed&iwloc=near`}
                                className="w-full h-full border-0 grayscale-[0.2]"
                              ></iframe>

                              {/* Address Card */}
                              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm max-w-[70%] pointer-events-none">
                                <h3 className="font-bold text-sm text-gray-900 leading-tight">{title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{address}</p>
                              </div>
                            </div>
                          );
                        }

                        if (block.type === "featured") {
                          const title = block.featuredTitle || "Glow lipstick";
                          const price = block.featuredPrice || "$19.99";
                          const image = block.featuredImage || "https://placehold.co/300x300";
                          const url = block.featuredUrl || "#";
                          const bgColor = block.featuredColor || "#1f4d36";
                          const textColor = block.featuredTextColor || "#ffffff";
                          
                          return (
                            <div key={block.id}>
                              <a href={url} className="block rounded-3xl overflow-hidden relative transition-all hover:scale-[1.01]" style={{ backgroundColor: bgColor, color: textColor }}>
                                {/* Top Badge */}
                                <div className="absolute top-3 -right-8 bg-white text-black py-1 px-8 rotate-45 text-[10px] font-extrabold shadow-sm z-10">
                                  TOTAL CLICK
                                </div>
                                
                                <div className="p-6 flex gap-5 items-center">
                                  {/* Image */}
                                  <div className="w-[100px] h-[100px] shrink-0 rounded-xl overflow-hidden bg-white/10">
                                    <img src={image} alt={title} className="w-full h-full object-cover" />
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1">
                                    <h3 className="m-0 mb-3 font-mono text-xl font-bold tracking-tighter">{title}</h3>
                                    
                                    {/* Lines representing description */}
                                    <div className="h-2 bg-white/30 rounded-full mb-2 w-full"></div>
                                    <div className="h-2 bg-white/30 rounded-full w-4/5"></div>
                                  </div>
                                </div>
                                
                                {/* Divider */}
                                <div className="h-px bg-white/20 mx-6"></div>
                                
                                {/* Bottom Action */}
                                <div className="p-4 text-center">
                                  <span className="text-lg font-medium">Buy now for {price}</span>
                                </div>
                              </a>
                            </div>
                          );
                        }

                        if (block.type === "event") {
                          return <EventBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "tour") {
                          return <TourBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "spotify") {
                          return <SpotifyBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "instagram") {
                          return <InstagramBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "youtube") {
                          return <YoutubeBlockPreview key={block.id} block={block} />;
                        }

                        if (block.type === "affiliate") {
                          const title = block.affiliateTitle || "Copy my coupon code";
                          const code = block.affiliateCode || "CODE123";
                          const image = block.affiliateImage || "https://placehold.co/300x300";
                          const url = block.affiliateUrl || "#";
                          const bgColor = block.affiliateColor || "#ffffff";
                          const textColor = block.affiliateTextColor || "#1f2937";
                          
                          return (
                            <div key={block.id}>
                              <div 
                                className="rounded-3xl p-6 text-center shadow-sm border border-gray-200"
                                style={{ backgroundColor: bgColor }}
                              >
                                <a href={url} className="block mb-4">
                                  <img src={image} alt={title} className="w-32 h-32 object-cover rounded-2xl mx-auto shadow-sm" />
                                </a>
                                <p 
                                  className="mb-3 text-sm font-semibold"
                                  style={{ color: textColor }}
                                >
                                  {title}
                                </p>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(code);
                                    // In a real app we might show a toast here
                                  }}
                                  className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-black/5 transition-colors font-mono text-base font-bold group"
                                  style={{ color: textColor, backgroundColor: 'rgba(255,255,255,0.5)' }}
                                >
                                  {code}
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return <hr key={block.id} className="border-gray-200 my-2" />;
                      })}
                      
                      <div className="text-center py-6 mt-6">
                        <a href="https://portyo.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline bg-white px-3 py-1.5 rounded-lg shadow-sm">
                          Powered by <span className="text-gray-900 font-extrabold">Portyo</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {shareData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             {/* Header */}
             <div className="flex items-center justify-between p-4 border-b border-gray-100">
               <h3 className="font-bold text-lg text-gray-900">Share link</h3>
               <button onClick={() => setShareData(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
               </button>
             </div>
             
             {/* Content */}
             <div className="p-6">
               {/* Preview Card */}
               <div className="bg-gray-900 rounded-2xl p-8 text-center text-white mb-8 shadow-xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black z-0"></div>
                 <div className="relative z-10">
                    <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-4 p-2 shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareData.url)}`} alt="QR Code" className="w-full h-full" />
                    </div>
                    <p className="font-medium truncate text-lg opacity-90">{shareData.title}</p>
                 </div>
               </div>

               {/* Social Icons */}
               <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-between px-2">
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(shareData.url);
                        // Could add a toast here
                    }}
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </div>
                    <span className="text-xs font-medium text-gray-600">Copy link</span>
                  </button>

                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white group-hover:bg-gray-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
                    </div>
                    <span className="text-xs font-medium text-gray-600">X</span>
                  </a>

                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white group-hover:opacity-90 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </div>
                    <span className="text-xs font-medium text-gray-600">Facebook</span>
                  </a>

                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white group-hover:opacity-90 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                    </div>
                    <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                  </a>

                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 min-w-[64px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white group-hover:opacity-90 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </div>
                    <span className="text-xs font-medium text-gray-600">LinkedIn</span>
                  </a>
               </div>
             </div>
             
             {/* Footer Promo */}
             <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
                <p className="font-bold text-sm text-gray-900 mb-1">Join Portyo</p>
                <p className="text-xs text-gray-500 mb-4">Create your own free bio link today.</p>
                <div className="flex gap-2 justify-center">
                    <a href="https://portyo.com/signup" target="_blank" rel="noreferrer" className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                        Sign up free
                    </a>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <button className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                        Report link
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function alignmentClass(align?: string) {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}

function textAlignClass(align?: string) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}
