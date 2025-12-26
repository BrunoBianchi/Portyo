import { type BioBlock } from "~/contexts/bio.context";

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const blockToHtml = (block: BioBlock): string => {
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
    const titleColor = block.textColor || "#0f172a";
    const bodyColor = block.textColor ? `${block.textColor}b3` : "#475569";
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:16px 0; ${animationStyle}">\n  <h2 style="margin:0; font-size:28px; font-weight:700; color:${titleColor};">${escapeHtml(
      block.title || "Heading"
    )}</h2>\n  ${block.body ? `<p style="margin:8px 0 0; color:${bodyColor};">${escapeHtml(block.body)}</p>` : ""}\n</section>`;
  }

  if (block.type === "text") {
    const textColor = block.textColor || "#475569";
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <p style="margin:0; color:${textColor}; line-height:1.6;">${escapeHtml(
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

    const nsfwAttr = block.isNsfw ? ` onclick="return confirm('This content is marked as 18+. Are you sure you want to continue?');"` : "";

    const imageHtml = block.buttonImage ? `<img src="${escapeHtml(block.buttonImage)}" alt="${escapeHtml(block.title || "Button image")}" style="position:absolute; left:6px; top:50%; transform:translateY(-50%); width:52px; height:52px; border-radius:8px; object-fit:cover;" />` : "";
    
    const textPadding = block.buttonImage ? "padding-left:66px;" : "";
    const textStyle = `flex:1; text-align:${textAlign}; ${textPadding}`;

    const shareButtonHtml = `
      <button aria-label="Share link" onclick="event.preventDefault(); event.stopPropagation(); window.openShare(event, '${escapeHtml(block.href || "")}', '${escapeHtml(block.title || "")}')" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:none; cursor:pointer; padding:8px; border-radius:50%; color:inherit; z-index:10;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    `;

    const tag = block.href ? 'a' : 'div';
    const hrefAttr = block.href ? ` href="${escapeHtml(block.href)}"` : ' role="button"';
    const cursorStyle = block.href ? 'cursor:pointer;' : 'cursor:default;';

    return `\n${extraHtml}<section style="text-align:${align}; padding:10px 0;">\n  <${tag}${hrefAttr} class="${animationClass}" style="${css} ${cursorStyle}"${nsfwAttr}>${imageHtml}<span style="${textStyle}">${escapeHtml(
      block.title || "Open link"
    )}</span>${shareButtonHtml}</${tag}>\n</section>`;
  }

  if (block.type === "image") {
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <img src="${escapeHtml(block.mediaUrl || "")}" alt="${escapeHtml(block.title || "")}" style="max-width:100%; border-radius:18px;" />\n</section>`;
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

      return `<a href="${escapeHtml(url)}" aria-label="${escapeHtml(platform)}" style="${style}">${iconSvg}${label}</a>`;
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
      date: "Oct 24, 2023",
      image: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Post",
      author: "By You",
      subtitle: "Category • Location",
      description: "FullStack Developer at Tech4Humans, working on projects for large insurance companies. I had the chance to participate in the development of new features..."
    }));

    const layout = block.blogLayout || "carousel";
    const cardStyle = block.blogCardStyle || "featured";
    const uniqueId = `blog-${block.id}`;

    // Colors
    const bgColor = block.blogBackgroundColor || (cardStyle === 'featured' ? '#fef3c7' : '#ffffff');
    const titleColor = block.blogTitleColor || '#1f2937';
    const textColor = block.blogTextColor || '#4b5563';
    const dateColor = block.blogDateColor || "#f59e0b";
    const tagBg = block.blogTagBackgroundColor || '#f3f4f6';
    const tagText = block.blogTagTextColor || '#4b5563';

    const cardsHtml = posts.map(post => {
      if (cardStyle === "featured") {
        return `
          <article style="flex:0 0 200px; scroll-snap-align:start; background:${bgColor}; border-radius:20px; padding:12px; display:flex; flex-direction:column; gap:10px; min-width:200px;">
            <div style="background:#e2e8f0; border-radius:12px; aspect-ratio:16/10; width:100%; overflow:hidden;">
               <img src="${post.image}" alt="${escapeHtml(post.title)}" style="width:100%; height:100%; object-fit:cover;" />
            </div>
            <div style="display:flex; gap:6px;">
              <span style="background:${tagBg}; color:${tagText}; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:600;">${post.category}</span>
              <span style="background:${tagBg}; color:${tagText}; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:600;">${post.readTime}</span>
            </div>
            <h3 style="font-size:16px; font-weight:800; line-height:1.3; color:${titleColor}; margin:0;">${post.title}</h3>
            <div style="display:flex; items-center; gap:6px; margin-top:auto;">
              <div style="width:20px; height:20px; background:#d1d5db; border-radius:50%;"></div>
              <span style="font-size:12px; color:${textColor};">${post.author}</span>
            </div>
          </article>
        `;
      } else if (cardStyle === "modern") {
        // Text-only minimalist style
        const widthStyle = layout === 'carousel' ? 'flex:0 0 280px; min-width:280px; border-right:1px solid #f3f4f6; padding-right:24px; margin-right:8px;' : 'width:100%; border-bottom:1px solid #f3f4f6; padding-bottom:16px; margin-bottom:16px;';
        
        return `
          <article style="${widthStyle} scroll-snap-align:start; display:flex; flex-direction:column; gap:8px;">
            <div style="font-size:12px; font-weight:700; color:${dateColor}; margin-bottom:4px;">${post.date}</div>
            <h3 style="font-size:18px; font-weight:700; line-height:1.2; color:${titleColor}; margin:0;">${post.title}</h3>
            <div style="font-size:12px; font-weight:500; opacity:0.8; color:${textColor}; margin-bottom:8px;">${post.subtitle}</div>
            <p style="font-size:12px; line-height:1.6; color:${textColor}; opacity:0.8; margin:0 0 12px 0; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${post.description}</p>
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:auto;">
               <span style="padding:2px 8px; border-radius:4px; font-size:10px; font-weight:500; border:1px solid ${tagBg}; color:${tagText}; background:transparent;">FullStack Dev</span>
               <span style="padding:2px 8px; border-radius:4px; font-size:10px; font-weight:500; border:1px solid ${tagBg}; color:${tagText}; background:transparent;">Soft Skills</span>
            </div>
          </article>
        `;
      } else {
        // Minimal style
        return `
          <article style="flex:0 0 160px; scroll-snap-align:start; background:${bgColor}; border:1px solid #e5e7eb; border-radius:16px; padding:14px; min-width:160px;">
            <h3 style="font-size:14px; font-weight:700; color:${titleColor}; margin:0 0 6px 0;">${post.title}</h3>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:${textColor};">${post.readTime}</span>
              <span style="font-size:11px; font-weight:500; color:${dateColor};">Read more &rarr;</span>
            </div>
          </article>
        `;
      }
    }).join("");

    if (layout === "carousel") {
      return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; position:relative; ${animationStyle}">
        <button aria-label="Scroll left" onclick="document.getElementById('${uniqueId}').scrollBy({left: -230, behavior: 'smooth'})" style="position:absolute; left:4px; top:50%; transform:translateY(-50%); z-index:10; background:white; border:1px solid #e5e7eb; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); color:#374151;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div id="${uniqueId}" style="display:flex; gap:12px; overflow-x:auto; padding:0 40px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none; -ms-overflow-style:none;">
          ${cardsHtml}
        </div>
        <button aria-label="Scroll right" onclick="document.getElementById('${uniqueId}').scrollBy({left: 230, behavior: 'smooth'})" style="position:absolute; right:4px; top:50%; transform:translateY(-50%); z-index:10; background:white; border:1px solid #e5e7eb; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); color:#374151;">
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
    const uniqueId = `product-${block.id}`;
    
    const bgColor = block.productBackgroundColor || "#ffffff";
    const textColor = block.productTextColor || "#1f2937";
    const accentColor = block.productAccentColor || "#2563eb";
    const btnText = block.productButtonText || "View Product";
    const cardStyleType = block.productCardStyle || "standard";

    const productItems = products.map(p => {
      const wrapperStyle = layout === "carousel" 
        ? "flex:0 0 170px; scroll-snap-align:start; min-width:170px;" 
        : "width:100%;";
      
      // Adjust wrapper width for minimal style in carousel
      const finalWrapperStyle = (layout === "carousel" && cardStyleType === "minimal")
        ? "flex:0 0 260px; scroll-snap-align:start; min-width:260px;"
        : wrapperStyle;

      if (cardStyleType === "minimal") {
         return `
          <a href="${escapeHtml(p.url)}" style="display:block; text-decoration:none; color:inherit; ${finalWrapperStyle}">
            <div style="background:${bgColor}; border-radius:16px; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.05); border:1px solid ${bgColor === '#ffffff' ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}; display:flex; align-items:center; padding:8px; gap:12px; height:100%;">
              <div style="width:64px; height:64px; flex-shrink:0; border-radius:12px; overflow:hidden; background:${bgColor === '#ffffff' ? '#f9fafb' : 'rgba(0,0,0,0.05)'};">
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover;" />
              </div>
              <div style="flex:1; min-width:0;">
                <h3 style="margin:0 0 4px 0; font-size:14px; font-weight:600; color:${textColor}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(p.title)}</h3>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <span style="font-size:13px; font-weight:700; color:${textColor}; opacity:0.8;">${escapeHtml(p.price)}</span>
                  <div style="display:flex; align-items:center; gap:4px; color:${accentColor}; font-size:12px; font-weight:600;">
                    <span>${escapeHtml(btnText)}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </a>
        `;
      }

      return `
      <a href="${escapeHtml(p.url)}" style="display:block; text-decoration:none; color:inherit; ${finalWrapperStyle}">
        <div style="background:${bgColor}; border-radius:20px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08); transition:transform 0.2s; height:100%; display:flex; flex-direction:column; border:1px solid ${bgColor === '#ffffff' ? '#f3f4f6' : 'rgba(255,255,255,0.1)'};">
          <div style="aspect-ratio:1; width:100%; position:relative; overflow:hidden; background:${bgColor === '#ffffff' ? '#f9fafb' : 'rgba(0,0,0,0.05)'};">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s;" />
            <div style="position:absolute; bottom:8px; right:8px; background:rgba(255,255,255,0.95); padding:4px 10px; border-radius:99px; font-size:12px; font-weight:700; color:#1f2937; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              ${escapeHtml(p.price)}
            </div>
          </div>
          <div style="padding:14px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
            <h3 style="margin:0 0 8px 0; font-size:15px; font-weight:600; color:${textColor}; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(p.title)}</h3>
            <div style="display:flex; align-items:center; gap:6px; color:${accentColor}; font-size:13px; font-weight:600; margin-top:auto;">
              <span>${escapeHtml(btnText)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </a>
    `;
    }).join("");

    if (layout === "carousel") {
      // Adjust scroll amount based on card width
      const scrollAmount = cardStyleType === "minimal" ? 276 : 186; // width + gap
      
      return `\n${extraHtml}<section class="${animationClass}" style="padding:16px 0; position:relative; ${animationStyle}">
        <button onclick="document.getElementById('${uniqueId}').scrollBy({left: -${scrollAmount}, behavior: 'smooth'})" style="position:absolute; left:4px; top:50%; transform:translateY(-50%); z-index:10; background:white; border:1px solid #e5e7eb; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.1); color:#374151; opacity:0.9;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div id="${uniqueId}" style="display:flex; gap:16px; overflow-x:auto; padding:4px 40px 20px 40px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none; -ms-overflow-style:none;">
          ${productItems}
        </div>
        <button onclick="document.getElementById('${uniqueId}').scrollBy({left: ${scrollAmount}, behavior: 'smooth'})" style="position:absolute; right:4px; top:50%; transform:translateY(-50%); z-index:10; background:white; border:1px solid #e5e7eb; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.1); color:#374151; opacity:0.9;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <style>#${uniqueId}::-webkit-scrollbar { display: none; }</style>
      </section>`;
    }

    const gridStyle = layout === "grid" 
      ? (cardStyleType === "minimal" ? "display:flex; flex-direction:column; gap:12px;" : "display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;")
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
            <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" style="width:100%; height:100%; object-fit:cover;" />
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
          <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" style="width:120px; height:120px; object-fit:cover; border-radius:16px; margin:0 auto; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
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
            ${bgImage ? `<img src="${escapeHtml(bgImage)}" alt="${escapeHtml(title)} - ${escapeHtml(location)}" style="width:100%; height:100%; object-fit:cover; opacity:0.8;" />` : `<div style="width:100%; height:100%; background:linear-gradient(to bottom, #374151, #111827);"></div>`}
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

export const blocksToHtml = (blocks: BioBlock[], user: any, bio: any) => {
  const shareUrl = bio.customDomain ? `https://${bio.customDomain}` : `https://${bio.sufix}.portyo.me`;
  const encodedShareUrl = encodeURIComponent(shareUrl);

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
        <img fetchpriority="high" src="/users-photos/${user?.id}-96.webp" srcset="/users-photos/${user?.id}-96.webp 1x, /users-photos/${user?.id}-192.webp 2x" onerror="this.onerror=function(){this.src='/users-photos/julia-soares.jpeg'}; this.srcset=''; this.src='/users-photos/${user?.id}.png';" alt="${user?.fullname || 'Profile Picture'}" style="width:100%; height:100%; object-fit:cover;" />
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

  const maxWidth = bio.maxWidth || 720;
  const cardStyle = bio.cardStyle || 'flat';
  const cardBg = bio.cardBackgroundColor || '#ffffff';
  const cardBorder = bio.cardBorderColor || '#e5e7eb';
  const cardWidth = bio.cardBorderWidth || 0;
  const cardRadius = bio.cardBorderRadius || 0;
  const cardShadow = bio.cardShadow || 'none';
  const cardPadding = bio.cardPadding || 24;

  let containerStyle = `max-width:${maxWidth}px; margin:0 auto; padding:${cardPadding}px; position:relative; z-index:1;`;

  if (cardStyle === 'card') {
    containerStyle += `background:${cardBg}; border:${cardWidth}px solid ${cardBorder}; border-radius:${cardRadius}px; box-shadow:${cardShadow}; margin-top: 24px; margin-bottom: 24px;`;
  } else if (cardStyle === 'glass') {
    containerStyle += `background:rgba(255,255,255,0.1); backdrop-filter:blur(10px); border:${cardWidth}px solid rgba(255,255,255,0.2); border-radius:${cardRadius}px; box-shadow:${cardShadow}; margin-top: 24px; margin-bottom: 24px;`;
  } else if (cardStyle === 'neumorphism') {
     containerStyle += `background:${cardBg}; border-radius:${cardRadius}px; box-shadow: 20px 20px 60px #d1d1d1, -20px -20px 60px #ffffff; margin-top: 24px; margin-bottom: 24px;`;
  } else if (cardStyle === 'outline') {
     containerStyle += `background:transparent; border:${cardWidth}px solid ${cardBorder}; border-radius:${cardRadius}px; margin-top: 24px; margin-bottom: 24px;`;
  }

  return `<div style="${bgStyle} min-height:100vh; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
    <style>
      body { margin: 0; padding: 0; box-sizing: border-box; }
      * { box-sizing: border-box; }
      ${animationsCss}
    </style>
    ${videoBgHtml}
    <main style="${containerStyle}">
      ${headerHtml}
      ${blocks.map(blockToHtml).join("")}
      <div style="text-align:center; padding:24px 0; margin-top:24px;">
        <a href="https://portyo.me" style="text-decoration:none; color:#6b7280; font-size:14px; font-weight:500; display:inline-flex; align-items:center; gap:4px; background:white; padding:6px 12px; border-radius:8px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
          Powered by <span style="color:#111827; font-weight:800;">Portyo</span>
        </a>
      </div>
    </main>
    <div id="share-modal" style="display:none; position:fixed; inset:0; z-index:50; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px);">
      <div style="background:white; border-radius:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); width:100%; max-width:448px; overflow:hidden; margin:16px; animation:zoomIn 0.2s ease-out;">
         <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; border-bottom:1px solid #f3f4f6;">
           <h3 style="font-weight:700; font-size:18px; color:#111827; margin:0;">Share link</h3>
           <button onclick="window.closeShare()" aria-label="Close share modal" style="padding:8px; border-radius:9999px; color:#6b7280; background:transparent; border:none; cursor:pointer; display:flex;">
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
              <button onclick="window.copyShareLink()" aria-label="Copy link to clipboard" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; background:transparent; border:none; cursor:pointer; padding:0;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; color:#374151;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">Copy link</span>
              </button>

              <a id="share-twitter" href="https://twitter.com/intent/tweet?url=${encodedShareUrl}" target="_blank" aria-label="Share on X (Twitter)" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#000000; display:flex; align-items:center; justify-content:center; color:white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">X</span>
              </a>

              <a id="share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}" target="_blank" aria-label="Share on Facebook" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#2563eb; display:flex; align-items:center; justify-content:center; color:white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">Facebook</span>
              </a>

              <a id="share-whatsapp" href="https://api.whatsapp.com/send?text=${encodedShareUrl}" target="_blank" aria-label="Share on WhatsApp" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#22c55e; display:flex; align-items:center; justify-content:center; color:white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">WhatsApp</span>
              </a>

              <a id="share-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}" target="_blank" aria-label="Share on LinkedIn" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
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
        <button onclick="window.closeSubscribe()" aria-label="Close subscribe modal" style="position:absolute; top:16px; right:16px; background:transparent; border:none; cursor:pointer; color:#9ca3af;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        
        <h3 style="font-size:20px; font-weight:900; color:#000; margin:0 0 24px 0; letter-spacing:0.05em; text-transform:uppercase;">JOIN THE LIST</h3>
        
        <form onsubmit="window.submitSubscribe(event)" style="display:flex; gap:12px;">
          <input type="email" placeholder="your@email.com" required style="flex:1; padding:16px; border-radius:16px; border:1px solid #e5e7eb; font-size:16px; outline:none; background:#f9fafb;" />
          <button type="submit" aria-label="Subscribe" style="width:56px; height:56px; border-radius:16px; background:#ccff00; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:black; flex-shrink:0; transition:transform 0.1s;">
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
