import { type BioBlock } from "~/contexts/bio.context";
import { isValidUrl } from "~/utils/security";

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const joinBaseUrl = (baseUrl: string, path: string) => {
  if (!path) return path;
  if (isValidUrl(path)) return path;
  if (!baseUrl) return path;
  if (path.startsWith('/')) return `${baseUrl}${path}`;
  return `${baseUrl}/${path}`;
};

const normalizeProfileImageSrc = (input: string | null | undefined, userId: string | null | undefined, baseUrl: string) => {
  const trimmed = (input || '').trim();

  // Legacy/static fallback format: /users-photos/<something> -> /api/images/<userId>/medium.png
  // NOTE: the /api/images route uses Redis keys based on userId, not the legacy filename.
  if (trimmed.startsWith('/users-photos/') && userId) {
    return joinBaseUrl(baseUrl, `/api/images/${userId}/medium.png?v=${Date.now()}`);
  }

  if (trimmed) {
    return joinBaseUrl(baseUrl, trimmed);
  }

  if (userId) {
    return joinBaseUrl(baseUrl, `/api/images/${userId}/medium.png?v=${Date.now()}`);
  }

  return joinBaseUrl(baseUrl, '/Street Life - Head (1).svg');
};

const normalizeBackgroundImageSrc = (input: string | null | undefined, userId: string | null | undefined, baseUrl: string) => {
  const trimmed = (input || '').trim();
  if (trimmed) return joinBaseUrl(baseUrl, trimmed);
  if (userId) return joinBaseUrl(baseUrl, `/api/images/${userId}/original.png?v=${Date.now()}`);
  return '';
};

export const blockToHtml = (block: BioBlock, bio: any): string => {
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
    const fontSize = block.fontSize || "32px";
    const fontWeight = block.fontWeight || "800";
    
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <h2 style="margin:0; font-size:${fontSize}; font-weight:${fontWeight}; color:${titleColor}; line-height:1.2; letter-spacing:-0.8px;">${escapeHtml(
      block.title || "Heading"
    )}</h2>\n  ${block.body ? `<p style="margin:12px 0 0; color:${bodyColor}; font-size:16px; line-height:1.6; font-weight:500;">${escapeHtml(block.body)}</p>` : ""}\n</section>`;
  }

  if (block.type === "text") {
    const textColor = block.textColor || "#475569";
    const fontSize = block.fontSize || "16px";
    const fontWeight = block.fontWeight || "500";
    
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <p style="margin:0; color:${textColor}; line-height:1.7; font-size:${fontSize}; font-weight:${fontWeight};">${escapeHtml(
      block.body || ""
    )}</p>\n</section>`;
  }

  if (block.type === "qrcode") {
    const layout = block.qrCodeLayout || "single";
    const fgColor = (block.qrCodeColor || "#000000").replace('#', '');
    const bgColor = (block.qrCodeBgColor || "#FFFFFF").replace('#', '');
    
    if (layout === "single") {
      const value = block.qrCodeValue || "https://example.com";
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}&color=${fgColor}&bgcolor=${bgColor}`;
      return `\n${extraHtml}<section class="${animationClass}" style="text-align:center; padding:12px 0; ${animationStyle}">\n  <div style="display:inline-block; padding:16px; background-color:#${bgColor}; border-radius:24px; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1);">\n    <img src="${qrUrl}" alt="QR Code" style="display:block; width:100%; max-width:200px; height:auto;" />\n  </div>\n</section>`;
    }

    const items = block.qrCodeItems || [];
    if (items.length === 0) return "";

    const gridStyle = layout === 'grid' 
      ? "display:grid; grid-template-columns:repeat(2, 1fr); gap:16px;" 
      : "display:flex; flex-direction:column; gap:16px;";

    const itemHtml = items.map(item => {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.value || "https://example.com")}&color=${fgColor}&bgcolor=${bgColor}`;
      return `
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:16px; background-color:#${bgColor}; border-radius:24px; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <img src="${qrUrl}" alt="QR Code" style="display:block; width:100%; max-width:150px; height:auto;" />
          ${item.label ? `<span style="font-size:14px; font-weight:500; color:#${fgColor}; text-align:center;">${escapeHtml(item.label)}</span>` : ""}
        </div>
      `;
    }).join("");

    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">\n  <div style="${gridStyle}">\n    ${itemHtml}\n  </div>\n</section>`;
  }


  if (block.type === "button") {
    const bg = block.accent || "#111827";
    const color = block.textColor || "#ffffff";
    const style = block.buttonStyle || "solid";
    const shape = block.buttonShape || "rounded";
    const shadowColor = block.buttonShadowColor || bg;
    const textAlign = block.buttonTextAlign || "center";
    
    const nsfwAttr = block.isNsfw ? ` onclick="return confirm('This content is marked as 18+. Are you sure you want to continue?');"` : "";
    const cleanHref = isValidUrl(block.href) ? block.href : '#';
    const tag = block.href ? 'a' : 'div';
    const hrefAttr = block.href ? ` href="${escapeHtml(cleanHref)}"` : ' role="button"';
    const cursorStyle = block.href ? 'cursor:pointer;' : 'cursor:default;';

    let css = `display:flex; align-items:center; position:relative; min-height:48px; padding:14px 28px; text-decoration:none; font-weight:700; font-size:15px; letter-spacing:-0.3px; width:100%; transition:all 280ms cubic-bezier(0.34, 1.56, 0.64, 1); ${animationStyle}`;
    
    if (shape === "pill") css += " border-radius:9999px;";
    else if (shape === "square") css += " border-radius:8px;";
    else css += " border-radius:14px;";

    if (style === "outline") {
      css += ` border:2px solid ${bg}; color:${bg}; background:transparent;`;
    } else if (style === "ghost") {
      css += ` background:transparent; color:${bg};`;
    } else if (style === "hard-shadow") {
      css += ` background:${bg}; color:${color}; border:2px solid ${shadowColor}; box-shadow:4px 4px 0px 0px ${shadowColor};`;
    } else if (style === "soft-shadow") {
      css += ` background:linear-gradient(135deg, ${bg}, ${shadowColor}); color:${color}; box-shadow:0 20px 25px -5px ${shadowColor}40, 0 10px 10px -5px ${shadowColor}20;`;
    } else if (style === "3d") {
      css += ` background:${bg}; color:${color}; border-bottom:4px solid ${shadowColor}; transform:translateY(0); transition:all 0.1s;`;
    } else if (style === "glass") {
      css += ` background:rgba(255, 255, 255, 0.08); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(255, 255, 255, 0.15); color:${color}; box-shadow:0 8px 32px 0 rgba(0, 0, 0, 0.05);`;
    } else if (style === "gradient") {
      css += ` background:linear-gradient(135deg, ${bg} 0%, ${shadowColor} 100%); color:${color}; border:none; box-shadow:0 12px 24px -8px ${shadowColor}60;`;
    } else if (style === "neumorphism") {
      css += ` background:${bg}; box-shadow:-6px -6px 14px rgba(255,255,255,0.6), 6px 6px 14px rgba(0,0,0,0.08); color:${color}; border:none;`;
    } else if (style === "clay") {
      css += ` background:${bg}; box-shadow:inset 6px 6px 12px rgba(255,255,255,0.4), inset -6px -6px 12px rgba(0,0,0,0.1), 8px 16px 24px rgba(0,0,0,0.15); border-radius:24px; color:${color}; border:none;`;
    } else if (style === "cyberpunk") {
      css += ` background:${bg}; clip-path:polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%); border-left:4px solid ${shadowColor}; color:${color}; font-family:monospace; text-transform:uppercase; border-radius:0;`;
    } else if (style === "pixel") {
      css += ` background:${bg}; box-shadow:-3px 0 0 0 ${shadowColor}, 3px 0 0 0 ${shadowColor}, 0 -3px 0 0 ${shadowColor}, 0 3px 0 0 ${shadowColor}; color:${color}; border-radius:0; border:none; margin:4px;`;
    } else if (style === "neon") {
      css += ` background:rgba(0,0,0,0.2); border:1px solid ${bg}; box-shadow:0 0 12px ${shadowColor}40, inset 0 0 12px ${shadowColor}20; color:${bg}; text-shadow:0 0 8px ${shadowColor}; backdrop-filter:blur(4px);`;
    } else if (style === "sketch") {
      css += ` background:transparent; border:2px solid ${shadowColor}; border-radius:255px 15px 225px 15px / 15px 225px 15px 255px; color:${bg};`;
    } else if (style === "gradient-border") {
      css += ` background:linear-gradient(#fff, #fff) padding-box, linear-gradient(to right, ${bg}, ${shadowColor}) border-box; border:2px solid transparent; color:${bg};`;
    } else if (style === "minimal-underline") {
      css += ` background:transparent; border:none; border-bottom:1px solid ${bg}40; border-radius:0; padding-left:0; padding-right:0; color:${bg}; justify-content:${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'}; transition: all 0.2s;`;
    } else if (style === "architect") {
      css += ` background:#ffffff; border:1px solid ${bg}20; color:${bg}; box-shadow:0 1px 2px rgba(0,0,0,0.05); font-weight:600; letter-spacing:0.5px;`;
    } else if (style === "material") {
      css += ` background:${bg}; color:${color}; border:none; box-shadow:0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);`;
    } else if (style === "brutalist") {
      css += ` background:${bg}; border:4px solid #000000; color:${color}; font-weight:900; text-transform:uppercase; letter-spacing:1px; border-radius:0; box-shadow:8px 8px 0 0 #000000;`;
    } else if (style === "outline-thick") {
      css += ` background:transparent; border:3px solid ${bg}; color:${bg}; font-weight:700;`;
    } else if (style as any === "image-grid") {
      // Custom HTML for image grid
      const bgImg = block.mediaUrl || block.buttonImage || "https://via.placeholder.com/300"; // Fallback
      const iconImg = block.buttonImage || ""; // Optional icon
      const label = escapeHtml(block.title || "");
      
      const iconHtml = iconImg 
          ? `<div style="width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.9); padding:6px; box-shadow:0 4px 12px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);">
               <img src="${escapeHtml(iconImg)}" style="width:100%; height:100%; object-fit:contain;" />
             </div>`
          : `<div style="height:34px;"></div>`;

      // Custom HTML for image grid as requested
      const cleanHref = isValidUrl(block.href) ? block.href : '#';
      const hrefAttr = block.href ? ` href="${escapeHtml(cleanHref)}"` : ' role="button"';
      return `\n${extraHtml}<section style="padding:6px; display:inline-block; width:50%; box-sizing:border-box; vertical-align:top;">
        <${tag}${hrefAttr} class="${animationClass}" style="position: relative; display: block; aspect-ratio: 261 / 151; width: 100%; border-radius: 20px; overflow: hidden; text-decoration: none; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.15); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform: scale(1); ${cursorStyle}" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'" ${nsfwAttr}>
          <div style="position:absolute; inset:0; background-color:#1f2937;">
            <img src="${escapeHtml(bgImg)}" alt="${escapeHtml(label)}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);"></div>
          </div>
          
          <div style="position:absolute; inset:0; padding:14px; display:flex; flex-direction:column; justify-content:space-between; color:white;">
            ${iconHtml}
            <span style="font-size:13px; font-weight:700; letter-spacing:0.01em; text-shadow:0 2px 4px rgba(0,0,0,0.3); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:center;">${label}</span>
          </div>
        </${tag}>
      </section>`;
    } else {
      // Default / Standard / Solid
      css += ` background:${bg}; color:${color}; border:1px solid rgba(0,0,0,0.06); box-shadow:0 4px 12px -2px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06);`;
    }

    const imageHtml = block.buttonImage ? `<img src="${escapeHtml(block.buttonImage)}" alt="${escapeHtml(block.title || "Button image")}" style="position:absolute; left:6px; top:50%; transform:translateY(-50%); width:52px; height:52px; border-radius:8px; object-fit:cover;" />` : "";
    
    const textPadding = block.buttonImage ? "padding-left:66px;" : "";
    const textStyle = `flex:1; text-align:${textAlign}; ${textPadding}`;

    const shareButtonHtml = `
      <button aria-label="Share link" onclick="event.preventDefault(); event.stopPropagation(); window.openShare(event, '${escapeHtml(isValidUrl(block.href) ? block.href : "")}', '${escapeHtml(block.title || "")}')" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:none; cursor:pointer; padding:8px; border-radius:50%; color:inherit; z-index:10;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    `;

    return `\n${extraHtml}<section style="padding:12px 0;">\n  <${tag}${hrefAttr} class="${animationClass}" style="${css} ${cursorStyle}"${nsfwAttr}>${imageHtml}<span style="${textStyle}">${escapeHtml(
      block.title || "Open link"
    )}</span>${shareButtonHtml}</${tag}>\n</section>`;
  }

  if (block.type === "image") {
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <img src="${escapeHtml(block.mediaUrl || "")}" alt="${escapeHtml(block.title || "")}" style="max-width:100%; border-radius:24px;" />\n</section>`;
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
        ? `display:flex; align-items:center; justify-content:center; padding:12px 16px; background:linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.02)); border:1.5px solid rgba(0,0,0,0.08); color:#374151; text-decoration:none; font-weight:700; border-radius:12px; width:${layout === 'column' ? '100%' : 'auto'}; transition:all 280ms ease; cursor:pointer;`
        : `display:inline-flex; align-items:center; justify-content:center; padding:12px; background:linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.02)); border:1.5px solid rgba(0,0,0,0.08); color:#374151; text-decoration:none; border-radius:12px; width:${layout === 'column' ? '100%' : 'auto'}; transition:all 280ms ease; cursor:pointer;`;

      const safeUrl = isValidUrl(url) ? url : '#';
      return `<a href="${escapeHtml(safeUrl)}" aria-label="${escapeHtml(platform)}" style="${style}">${iconSvg}${label}</a>`;
    }).join("");

    const containerStyle = layout === 'column' 
        ? `display:flex; flex-direction:column; gap:12px; align-items:${align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}; ${animationStyle}`
        : `display:flex; gap:12px; justify-content:${align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}; flex-wrap:wrap; ${animationStyle}`;

    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0;">\n  <div style="${containerStyle}">${icons}</div>\n</section>`;
  }

  if (block.type === "video") {
    const videoId = block.mediaUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    if (!videoId) return "";
    return `\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:24px;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe></div>\n</section>`;
  }

  if (block.type === "blog") {
    // Inject configuration for the client-side loader
    // We use a script that sets a global variable or directly modifies the loader's default config
    return `
      <script>
        window.blogConfig = {
          backgroundColor: "${block.blogBackgroundColor || '#ffffff'}",
          textColor: "${block.blogTextColor || '#1f2937'}" 
        };
      </script>
    `;
  }

  if (block.type === "product") {
    return "";
  }

  if (block.type === "marketing") {
    const slotId = block.marketingId;
    if (!slotId) return "";
    
    // We render a placeholder that React will hydrate via BioLayout -> MarketingWidget
    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div class="custom-marketing-block" data-marketing-id="${escapeHtml(slotId)}" data-bio-id="${bio.id}">
         <div style="padding:24px; text-align:center; background:rgba(255,255,255,0.5); border:2px dashed #9ca3af; border-radius:12px; color:#4b5563; font-family:inherit;">
           <div style="font-weight:600;">Marketing Slot</div>
         </div>
      </div>
    </section>`;
  }

  if (block.type === "form") {
    const formId = block.formId;
    if (!formId) return "";
    
    // We render a placeholder that React will hydrate
    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div class="custom-form-block" data-form-id="${escapeHtml(formId)}" data-bg-color="${escapeHtml(block.formBackgroundColor || "#ffffff")}" data-text-color="${escapeHtml(block.formTextColor || "#1f2937")}">
         <!-- Loading State for SSR/No-JS -->
         <div style="padding:24px; text-align:center; background:${escapeHtml(block.formBackgroundColor || "#ffffff")}; border-radius:24px; color:${escapeHtml(block.formTextColor || "#1f2937")}; border:1px solid rgba(0,0,0,0.1);">
           Loading form...
         </div>
      </div>
    </section>`;
  }

  if (block.type === "portfolio") {
    const title = block.portfolioTitle || "Portfólio";
    
    // We render a placeholder that React will hydrate with PortfolioWidget
    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div class="custom-portfolio-block" data-title="${escapeHtml(title)}" data-bio-id="${bio.id}">
         <!-- Loading State for SSR/No-JS -->
         <div style="padding:24px; text-align:center; background:#ffffff; border-radius:24px; color:#1f2937; border:1px solid rgba(0,0,0,0.1);">
           Loading portfolio...
         </div>
      </div>
    </section>`;
  }

  if (block.type === "calendar") {
    const title = block.calendarTitle || "Book a Call";
    const url = block.calendarUrl || "#";
    const bgColor = block.calendarColor || "#ffffff";
    const textColor = block.calendarTextColor || "#1f2937";
    const accentColor = block.calendarAccentColor || "#2563eb";
    
    // Generate a simple static calendar for the current month
    const currentDate = new Date();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDay = monthStart.getDay(); // 0 is Sunday
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    let calendarGridRows = '';
    let dayCount = 1;
    let currentRow = '';
    
    // Header row (Su Mo Tu...)
    const weekHeader = `
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; padding-left:4px; padding-right:4px;">
         ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<div style="width:36px; text-align:center; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">${d}</div>`).join('')}
      </div>
    `;

    // 6 rows max to cover all months
    for(let r=0; r<6; r++) {
         currentRow = '';
         let hasDays = false;
         for(let d=0; d<7; d++) {
             if((r===0 && d < startDay) || dayCount > daysInMonth) {
                 currentRow += `<div style="width:36px; height:36px;"></div>`; 
             } else {
                 hasDays = true;
                 const isToday = dayCount === currentDate.getDate();
                 currentRow += `
                   <div style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:99px; font-size:14px; cursor:pointer; background:${isToday ? '#000000' : 'transparent'}; color:${isToday ? '#ffffff' : '#374151'}; font-weight:${isToday ? '600' : '400'}; transition:background 0.2s;" onmouseover="if(!this.style.background.includes('000000')) this.style.background='#f3f4f6'" onmouseout="if(!this.style.background.includes('000000')) this.style.background='transparent'">
                     ${dayCount}
                   </div>
                 `;
                 dayCount++;
             }
         }
         if(hasDays) {
            calendarGridRows += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">${currentRow}</div>`;
         }
    }
    
    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div class="custom-booking-block" data-title="${escapeHtml(title)}" data-description="${escapeHtml(block.body || "")}" data-bio-id="${bio.id}" style="cursor:pointer; background:${bgColor}; border-radius:24px; padding:20px; border:1px solid #e5e7eb; box-shadow:0 2px 4px -2px rgba(0,0,0,0.05);">
         <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
           <h3 style="margin:0; font-size:18px; font-weight:700; color:${textColor};">${escapeHtml(title)}</h3>
           <span style="background:#eff6ff; color:#2563eb; padding:4px 12px; border-radius:99px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">Book It</span>
         </div>
         ${block.body ? `<p style="margin:0 0 20px 0; color:${textColor}; opacity:0.6; font-size:14px; line-height:1.5;">${escapeHtml(block.body)}</p>` : ""}
         
         <!-- Static Calendar Preview -->
         <div style="background:white; border-radius:16px; border:1px solid #f3f4f6; padding:16px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
             <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding:0 4px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                <span style="font-weight:700; color:#111827;">${monthName}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
             </div>
             ${weekHeader}
             <div>${calendarGridRows}</div>
         </div>
      </div>
    </section>`;
  }

  if (block.type === "map") {
    const title = block.mapTitle || "Our Office";
    const address = block.mapAddress || "123 Main St, City";
    const encodedAddress = encodeURIComponent(address);
    
    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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
    const url = isValidUrl(block.featuredUrl) ? block.featuredUrl : "#";
    const bgColor = block.featuredColor || "#1f4d36";
    const textColor = block.featuredTextColor || "#ffffff";
    
    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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
    const url = isValidUrl(block.affiliateUrl) ? block.affiliateUrl : "#";
    const bgColor = block.affiliateColor || "#ffffff";
    const textColor = block.affiliateTextColor || "#374151";
    
    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div style="background:${bgColor}; border-radius:24px; padding:24px; text-align:center; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1); border:1px solid #e5e7eb;">
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
    const btnUrl = isValidUrl(block.eventButtonUrl) ? block.eventButtonUrl : "#";
    const uniqueId = `countdown-${block.id}`;

    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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
      const ticketUrl = isValidUrl(tour.ticketUrl) ? tour.ticketUrl : "#";
      const isSoldOut = tour.soldOut;
      const isSellingFast = tour.sellingFast;

      let badgeHtml = "";
      if (isSoldOut) {
        badgeHtml = `<span style="background:#dc2626; color:white; font-size:10px; font-weight:700; padding:4px 8px; border-radius:99px; text-transform:uppercase; letter-spacing:0.05em;">Sold Out</span>`;
      } else if (isSellingFast) {
        badgeHtml = `<span style="background:rgba(0,0,0,0.8); color:white; font-size:10px; font-weight:700; padding:4px 8px; border-radius:99px; text-transform:uppercase; letter-spacing:0.05em; border:1px solid rgba(255,255,255,0.2);">Selling fast</span>`;
      }

      return `
        <a href="${escapeHtml(ticketUrl)}" target="_blank" style="flex:0 0 160px; scroll-snap-align:center; position:relative; aspect-ratio:3/4; border-radius:24px; overflow:hidden; text-decoration:none; display:block;">
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

    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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

  if (block.type === "button_grid") {
    const items = block.gridItems || [];
    if (items.length === 0) return "";

    const gridHtml = items.map(item => {
      const bgImg = item.image || item.icon || "";
      const iconImg = item.icon || "";
      const title = item.title || "";
      const url = isValidUrl(item.url) ? item.url : "#";

      return `
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="position:relative; display:block; aspect-ratio:261/151; width:100%; border-radius:15px; overflow:hidden; text-decoration:none; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1);" onmouseover="const i=this.querySelector('img');if(i)i.style.transform='scale(1.1)'" onmouseout="const i=this.querySelector('img');if(i)i.style.transform='scale(1)'">
          <div style="position:absolute; inset:0; background-color:#1f2937;">
            ${bgImg ? `<img src="${escapeHtml(bgImg)}" alt="${escapeHtml(title)}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s;" />` : `<div style="width:100%; height:100%; background:linear-gradient(to bottom right, #374151, #111827);"></div>`}
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);"></div>
          </div>
          
          <div style="position:absolute; inset:0; padding:12px; display:flex; flex-direction:column; justify-content:space-between; color:white;">
            ${iconImg ? `<div style="width:32px; height:32px; border-radius:50%; background:white; padding:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center;"><img src="${escapeHtml(iconImg)}" style="width:100%; height:100%; object-fit:contain;" /></div>` : '<div style="height:32px;"></div>'}
            ${title ? `<span style="font-size:14px; font-weight:700; text-shadow:0 1px 2px rgba(0,0,0,0.5); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:center;">${escapeHtml(title)}</span>` : ''}
          </div>
        </a>
      `;
    }).join("");

    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; width:100%;">
        ${gridHtml}
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

    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; overflow:hidden; ${animationStyle}">
      <iframe style="border-radius:24px; overflow:hidden; border:0;" src="${embedUrl}" width="100%" height="${isCompact ? "80" : "152"}" frameBorder="0" scrolling="no" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
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
    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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

    return `\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      ${textPosition === 'top' ? textHtml : ''}
      <div class="custom-youtube-feed" data-url="${escapeHtml(url)}" data-display-type="${displayType}" style="${gridStyle} border-radius:12px; overflow:hidden;">
        ${placeholders}
      </div>
      ${textPosition === 'bottom' ? textHtml : ''}
    </section>`;
  }

  return "\n<hr style=\"border:none; border-top:1px solid #E5E7EB; margin:18px 0;\" />";
};

export const blocksToHtml = (blocks: BioBlock[], user: any, bio: any, baseUrl: string = "") => {
  const shareUrl = bio.customDomain ? `https://${bio.customDomain}` : `https://portyo.me/p/${bio.sufix}`;
  const encodedShareUrl = encodeURIComponent(shareUrl);

  // Get amoeba keyframes early to include in animations
  const amoebaKeyframesContent = bio.imageStyle === 'amoeba' ? `
    @keyframes amoeba-pulse {
      0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
      25% { border-radius: 45% 55% 45% 55% / 50% 55% 45% 50%; }
      50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
      75% { border-radius: 45% 55% 45% 55% / 55% 50% 50% 45%; }
      100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    }
  ` : '';

  const animationsCss = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
    @keyframes wobble { 0% { transform: translateX(0%); } 15% { transform: translateX(-25%) rotate(-5deg); } 30% { transform: translateX(20%) rotate(3deg); } 45% { transform: translateX(-15%) rotate(-3deg); } 60% { transform: translateX(10%) rotate(2deg); } 75% { transform: translateX(-5%) rotate(-1deg); } 100% { transform: translateX(0%); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
    ${amoebaKeyframesContent}
  `;

  // Font Logic
  const font = bio.font || 'Inter';
  const fonts: Record<string, string> = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
    'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap',
    'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap',
    'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap',
    'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap',
    'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap',
    'Oswald': 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap',
    'Raleway': 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800;900&display=swap',
    'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  };

  
  let fontLink = fonts[font] ? `<link href="${fonts[font]}" rel="stylesheet">` : '';
  let fontFamily = font === 'Inter' ? "'Inter', sans-serif" : `'${font}', sans-serif`;

  if (font === 'Custom' && bio.customFontUrl) {
    fontLink = `
      <style>
        @font-face {
          font-family: 'CustomFont';
          src: url('${bio.customFontUrl}') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      </style>
    `;
    fontFamily = "'CustomFont', sans-serif";
  }
  
  const imageStyles: Record<string, string> = {
    circle: 'border-radius:50%;',
    rounded: 'border-radius:24px;',
    square: 'border-radius:0;',
    star: 'clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);',
    hexagon: 'clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);',
    amoeba: 'border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; animation: amoeba-pulse 6s ease-in-out infinite;'
  };
  
  const imgStyle = imageStyles[bio.imageStyle || 'circle'] || imageStyles.circle;
  const usernameColor = bio.usernameColor || '#111827';

  const hasProducts = blocks.some(b => b.type === 'product' || b.type === 'featured');
  const hasBlog = blocks.some(b => b.type === 'blog');

  const socials = bio.socials || {};
  const description = bio.description || "";
  const displayProfileImage = bio.displayProfileImage !== false;
  const handle = bio.username || bio.sufix || 'user';
  const displayName = user?.fullname || `@${handle}`;

  const socialIcons: Record<string, string> = {
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    tiktok: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>',
    twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
    youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    email: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    website: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    github: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>'
  };

  const socialLinksHtml = Object.entries(socials)
    .filter(([key, value]) => value && socialIcons[key])
    .map(([key, value]) => {
      let url = value as string;
      if (key === 'email' && !url.startsWith('mailto:')) url = `mailto:${url}`;
      else if (!url.startsWith('http') && key !== 'email') url = `https://${url}`;
      
      if (!isValidUrl(url)) url = '#';
      
      const colorMap: Record<string, string> = {
        instagram: '#E4405F',
        tiktok: '#000000',
        twitter: '#1DA1F2',
        youtube: '#FF0000',
        linkedin: '#0A66C2',
        email: '#EA4335',
        website: '#2563EB',
        github: '#111827'
      };

      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; background:white; color:${colorMap[key] || usernameColor}; box-shadow:0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); margin: 0 4px;" onmouseover="this.style.transform='scale(1.1) translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.2)';" onmouseout="this.style.transform='scale(1) translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
        ${socialIcons[key].replace('width="16" height="16"', 'width="20" height="20"').replace('stroke-width="2"', 'stroke-width="2.5"')}
      </a>`;
    })
    .join('');

  const maxWidth = 566;



  const darkenColor = (hex: string, amount: number) => {
    let color = hex.replace('#', '');
    if (color.length === 3) color = color.split('').map(c => c + c).join('');
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const navInactive = usernameColor;
  const navTextColor = darkenColor(usernameColor, 0.35);
  const navIndicator = navTextColor;
  const navBorder = 'rgba(0,0,0,0.08)';

 

  /* Card Styling Logic */
  const cardStyleType = bio.cardStyle || 'none';
  const cardBgColor = bio.cardBackgroundColor || '#ffffff';
  const cardOpacity = bio.cardOpacity !== undefined ? bio.cardOpacity : 100;
  const cardBlur = bio.cardBlur !== undefined ? bio.cardBlur : 10;
  
  let cardCss = '';
  if (cardStyleType !== 'none') {
    // Convert hex to rgb for rgba
    const r = parseInt(cardBgColor.substr(1, 2), 16);
    const g = parseInt(cardBgColor.substr(3, 2), 16);
    const b = parseInt(cardBgColor.substr(5, 2), 16);
    const alpha = cardOpacity / 100;
    
    cardCss += `background-color: rgba(${r}, ${g}, ${b}, ${alpha}); `;
    cardCss += `border-radius: 24px; padding: 32px 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); `;
    
    if (cardStyleType === 'frosted') {
        cardCss += `backdrop-filter: blur(${cardBlur}px); -webkit-backdrop-filter: blur(${cardBlur}px); border: 1px solid rgba(255,255,255,0.1); `;
    }
  }

  const profileImageSrc = normalizeProfileImageSrc(bio.profileImage, user?.id, baseUrl);

  const headerHtml = `
    <div id="profile-header-card" style="width:100%; max-width:${maxWidth}px; margin:0 auto 20px auto; display:flex; flex-direction:column; align-items:center; position:relative; z-index:10; padding-top: 40px;">
        
        ${bio.enableSubscribeButton ? `
        <button type="button" data-open-subscribe onclick="window.openSubscribe()" aria-label="Subscribe" style="position:absolute; top:10px; right:10px; width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.9); border:1px solid rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.1); color:#111827; transition:all 0.2s ease; z-index:20;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
        ` : ''}

        <!-- Profile Image -->
        <div style="width:120px; height:120px; ${imgStyle} overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.2); border:4px solid white; margin-bottom: 16px; background:#f3f4f6; position:relative;" ${bio.isPreview ? 'onmouseover="this.querySelector(\'.upload-overlay\').style.opacity=\'1\'" onmouseout="this.querySelector(\'.upload-overlay\').style.opacity=\'0\'"' : ''}>
               ${displayProfileImage ? `<img loading="lazy" src="${profileImageSrc}" onerror="this.src='${joinBaseUrl(baseUrl, '/Street Life - Head (1).svg')}'" alt="${escapeHtml(displayName)}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#e5e7eb; color:#9ca3af; font-size:40px;">U</div>`}
               
               ${bio.isPreview ? `
               <div class="upload-overlay" onclick="window.parent.postMessage({type: 'TRIGGER_IMAGE_UPLOAD'}, '*')" style="position:absolute; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; cursor:pointer; color:white; backdrop-filter:blur(2px);">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
               </div>
               ` : ''}
        </div>

        <!-- Name & Handle -->
        <h1 style="font-size:28px; font-weight:800; color:${usernameColor}; margin:0 0 4px 0; text-align:center; letter-spacing:-0.5px; line-height:1.2;">
            ${escapeHtml(displayName)}
            ${bio.isVerified ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6" style="display:inline-block; vertical-align:middle; margin-left:4px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
        </h1>
        <div style="font-size:15px; font-weight:600; color:${usernameColor}; opacity:0.6; margin-bottom:16px;">@${escapeHtml(handle)}</div>

        <!-- Description -->
        ${bio.description ? `<p style="font-size:16px; font-weight:500; color:${usernameColor}; opacity:0.8; margin:0 0 24px 0; line-height:1.6; text-align:center; max-width:480px;">${escapeHtml(bio.description)}</p>` : ''}

        <!-- Socials -->
        ${socialLinksHtml ? `<div style="display:flex; justify-content:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">${socialLinksHtml}</div>` : ''}

    </div>
  `;

  let bgStyle = 'background:#f8fafc;';
  const bgColor = bio.bgColor || '#f8fafc';
  const bgSecondary = bio.bgSecondaryColor || '#e2e8f0';
  let extraHtml = '';

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
  } else if (bio.bgType === 'dynamic-blur') {
    // Use bgImage if available, otherwise fallback to user profile picture
    const bgImg = normalizeBackgroundImageSrc(bio.bgImage, user?.id, baseUrl);
    bgStyle = `background: #000;`; // Fallback color
    // We add a pseudo-element or a fixed div for the blur effect in the HTML structure below
  } else if (bio.bgType === 'palm-leaves') {
    // Tropical palm leaves pattern - using actual SVG files with repeat and parallax
    bgStyle = `background-color: ${bgColor}; overflow-x: hidden;`; // Base color
    
    // We inject the layers into the HTML structure
    // Layer 1: Back layer, slower movement
    if (bio.isPreview) {
      extraHtml = `
        <div id="palm-layer-1" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/background/Design sem nome (4).svg');
          background-size: 600px 600px;
          background-repeat: repeat;
          opacity: 0.4;
          z-index: 0;
          pointer-events: none;
        "></div>
        <div id="palm-layer-2" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/background/Design sem nome (5).svg');
          background-size: 500px 500px;
          background-repeat: repeat;
          opacity: 0.6;
          z-index: 1;
          pointer-events: none;
        "></div>
      `;
    } else {
      extraHtml = `
        <div id="palm-layer-1" style="
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: url('/background/Design sem nome (4).svg');
          background-size: 600px 600px;
          background-repeat: repeat;
          transform: rotate(15deg) translateZ(0);
          opacity: 0.4;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        "></div>
        <div id="palm-layer-2" style="
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: url('/background/Design sem nome (5).svg');
          background-size: 500px 500px;
          background-repeat: repeat;
          transform: rotate(-10deg) translateZ(0);
          opacity: 0.6;
          z-index: 1;
          pointer-events: none;
          will-change: transform;
        "></div>
        <script>
          document.addEventListener('scroll', function() {
            const scrolled = window.scrollY;
            const layer1 = document.getElementById('palm-layer-1');
            const layer2 = document.getElementById('palm-layer-2');
            
            if (layer1) {
              layer1.style.transform = 'rotate(15deg) translateY(' + (scrolled * 0.2) + 'px) translateZ(0)';
            }
            if (layer2) {
              layer2.style.transform = 'rotate(-10deg) translateY(' + (scrolled * 0.5) + 'px) translateZ(0)';
            }
          }, { passive: true });
        </script>
      `;
    }

    // We'll append these to the videoBgHtml variable so they get injected into the body
    // This is a bit of a hack to reuse the existing injection point
    bio.bgVideo = "true"; // Trigger the injection logic if it wasn't already
  } else if (bio.bgType === 'wheat') {
    // Wheat pattern - using actual SVG files with repeat and parallax
    bgStyle = `background-color: ${bgColor}; overflow-x: hidden;`; // Base color
    
    // We inject the layers into the HTML structure
    if (bio.isPreview) {
      extraHtml = `
        <div id="wheat-layer-1" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/background/wheat/Design sem nome (7).svg');
          background-size: 600px 600px;
          background-repeat: repeat;
          opacity: 0.4;
          z-index: 0;
          pointer-events: none;
        "></div>
        <div id="wheat-layer-2" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/background/wheat/Design sem nome (8).svg');
          background-size: 500px 500px;
          background-repeat: repeat;
          opacity: 0.6;
          z-index: 1;
          pointer-events: none;
        "></div>
      `;
    } else {
      extraHtml = `
        <div id="wheat-layer-1" style="
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: url('/background/wheat/Design sem nome (7).svg');
          background-size: 600px 600px;
          background-repeat: repeat;
          transform: rotate(15deg) translateZ(0);
          opacity: 0.4;
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        "></div>
        <div id="wheat-layer-2" style="
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image: url('/background/wheat/Design sem nome (8).svg');
          background-size: 500px 500px;
          background-repeat: repeat;
          transform: rotate(-10deg) translateZ(0);
          opacity: 0.6;
          z-index: 1;
          pointer-events: none;
          will-change: transform;
        "></div>
        <script>
          document.addEventListener('scroll', function() {
            const scrolled = window.scrollY;
            const layer1 = document.getElementById('wheat-layer-1');
            const layer2 = document.getElementById('wheat-layer-2');
            
            if (layer1) {
              layer1.style.transform = 'rotate(15deg) translateY(' + (scrolled * 0.2) + 'px) translateZ(0)';
            }
            if (layer2) {
              layer2.style.transform = 'rotate(-10deg) translateY(' + (scrolled * 0.5) + 'px) translateZ(0)';
            }
          }, { passive: true });
        </script>
      `;
    }

    // We'll append these to the videoBgHtml variable so they get injected into the body
    // This is a bit of a hack to reuse the existing injection point
    bio.bgVideo = "true"; // Trigger the injection logic if it wasn't already

    // We'll append these to the videoBgHtml variable so they get injected into the body
    // This is a bit of a hack to reuse the existing injection point
    bio.bgVideo = "true"; // Trigger the injection logic if it wasn't already
    // We need to make sure we don't break existing reference, so we'll append to the string builder below
  } else if (bio.bgType === 'blueprint') {
    // Architectural blueprint grid pattern
    bgStyle = `background-color: #1e3a5f; background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px; background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px;`;
  } else if (bio.bgType === 'marble') {
    // White marble texture - simplified version
    bgStyle = `background-color: #f5f5f5; 
      background-image: 
        linear-gradient(90deg, rgba(0,0,0,0.02) 50%, transparent 50%),
        linear-gradient(rgba(0,0,0,0.02) 50%, transparent 50%),
        radial-gradient(circle at 20% 30%, rgba(220,220,220,0.4) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(200,200,200,0.3) 0%, transparent 50%),
        radial-gradient(circle at 60% 40%, rgba(210,210,210,0.35) 0%, transparent 60%);
      background-size: 50px 50px, 50px 50px, 100% 100%, 100% 100%, 100% 100%;
      background-position: 0 0, 25px 25px, 0 0, 0 0, 0 0;`;
  } else if (bio.bgType === 'concrete') {
    // Industrial concrete texture
    bgStyle = `background-color: #9ca3af; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='concrete'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23concrete)' opacity='0.15'/%3E%3C/svg%3E"), linear-gradient(135deg, rgba(156,163,175,1) 0%, rgba(107,114,128,1) 100%);`;
  } else if (bio.bgType === 'terracotta') {
    // Warm terracotta/clay pattern
    bgStyle = `background-color: #c2410c; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23ea580c' fill-opacity='0.3'%3E%3Cpath fill-rule='evenodd' d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/svg%3E");`;
  } else if (bio.bgType === 'wood-grain') {
    // Natural wood grain texture
    bgStyle = `background-color: #8B7355; background-image: linear-gradient(90deg, rgba(101,67,33,0.1) 50%, transparent 50%), linear-gradient(rgba(101,67,33,0.1) 50%, transparent 50%), linear-gradient(rgba(139,115,85,0.3) 0%, transparent 100%); background-size: 4px 100%, 100% 4px, 100% 100%;`;
  } else if (bio.bgType === 'brick') {
    // Classic brick wall pattern
    bgStyle = `background-color: #8B4513; background-image: linear-gradient(335deg, #b84a1f 23px, transparent 23px), linear-gradient(155deg, #b84a1f 23px, transparent 23px), linear-gradient(335deg, #b84a1f 23px, transparent 23px), linear-gradient(155deg, #b84a1f 23px, transparent 23px); background-size: 58px 58px; background-position: 0 2px, 4px 35px, 29px 31px, 34px 6px;`;
  } else if (bio.bgType === 'frosted-glass') {
    // Frosted glass effect with blur
    bgStyle = `background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); backdrop-filter: blur(10px) saturate(180%); -webkit-backdrop-filter: blur(10px) saturate(180%);`;
  } else if (bio.bgType === 'steel') {
    // Brushed steel metallic texture
    bgStyle = `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-image: linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 1px 100%, 100% 1px;`;
  }

  let videoBgHtml = (bio.bgType === 'video' && bio.bgVideo && bio.bgType !== 'palm-leaves') ? `
    <video autoplay loop muted playsinline style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:-1;">
      <source src="${bio.bgVideo}" type="video/mp4">
    </video>
    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.3); z-index:-1;"></div>
  ` : (bio.bgType === 'dynamic-blur') ? `
    <div style="position:fixed; inset:-20px; z-index:-1; background:url('${normalizeBackgroundImageSrc(bio.bgImage, user?.id, baseUrl)}') no-repeat center center; background-size:cover; filter:blur(40px) brightness(0.6); transform:scale(1.1);"></div>
    <div style="position:fixed; inset:0; z-index:-1; background:rgba(0,0,0,0.2);"></div>
  ` : '';

  if (bio.bgType === 'palm-leaves' || bio.bgType === 'wheat') {
    videoBgHtml += extraHtml;
  }


  const containerStyle = `max-width:${maxWidth}px; margin:0 auto; padding:16px; position:relative; z-index:1;`;




  // Tab Bar Logic
  const showTabs = hasProducts || hasBlog;
  const tabsHtml = showTabs ? `
    <div style="display:flex; justify-content:center; gap:24px; border-bottom:1px solid rgba(0,0,0,0.06); margin-bottom:24px; padding-bottom:16px;">
        <button id="tab-links" onclick="window.switchTab('links')" style="background:none; border:none; padding:8px 12px; font-size:15px; font-weight:700; color:${navTextColor}; cursor:pointer; position:relative; transition:opacity 0.2s;">
            Links
            <span style="position:absolute; bottom:-17px; left:0; right:0; height:3px; background:${navIndicator}; border-radius:3px 3px 0 0; transition:background 0.2s;"></span>
        </button>
        ${hasProducts ? `
        <button id="tab-shop" onclick="window.switchTab('shop')" style="background:none; border:none; padding:8px 12px; font-size:15px; font-weight:700; color:${navInactive}; opacity:0.85; cursor:pointer; position:relative; transition:opacity 0.2s;">
            Shop
            <span style="position:absolute; bottom:-17px; left:0; right:0; height:3px; background:transparent; border-radius:3px 3px 0 0; transition:background 0.2s;"></span>
        </button>` : ''}
        ${hasBlog ? `
        <button id="tab-blog" onclick="window.switchTab('blog')" style="background:none; border:none; padding:8px 12px; font-size:15px; font-weight:700; color:${navInactive}; opacity:0.85; cursor:pointer; position:relative; transition:opacity 0.2s;">
            Blog
            <span style="position:absolute; bottom:-17px; left:0; right:0; height:3px; background:transparent; border-radius:3px 3px 0 0; transition:background 0.2s;"></span>
        </button>` : ''}
    </div>
  ` : '';

  return `${fontLink}<div style="${bgStyle} min-height:100vh; font-family: ${fontFamily}; position:relative;">
    <style>
      html, body { min-height: 100%; }
      body {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      * { box-sizing: border-box; }
      a { color: inherit; }
      img { max-width: 100%; height: auto; }
      #profile-header-card { will-change: transform, opacity; }
      #profile-header-bg { will-change: filter, opacity; }

      /* Premium cards */
      .portyo-card {
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 12px 36px -24px rgba(0,0,0,0.6), 0 6px 16px -12px rgba(0,0,0,0.24);
        transform: translateZ(0);
      }
      .portyo-card::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        box-shadow: inset 0 0 0 1.2px rgba(255,255,255,0.12);
      }
      .portyo-card:hover {
        box-shadow: 0 20px 52px -32px rgba(0,0,0,0.8), 0 10px 24px -16px rgba(0,0,0,0.42);
        transform: translateY(-4px);
      }

      /* Smooth zoom on hover */
      .portyo-card-media {
        transition: transform 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        will-change: transform;
      }
      .portyo-card:hover .portyo-card-media {
        transform: scale(1.13);
      }

      /* Softer text rendering over images */
      .portyo-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.16) 52%, rgba(0,0,0,0) 82%);
      }

      /* Icon pill */
      .portyo-icon-pill {
        width: 40px;
        height: 40px;
        border-radius: 9999px;
        background: rgba(255,255,255,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 12px 28px -18px rgba(0,0,0,0.75);
        backdrop-filter: blur(8px);
      }

      /* Button smooth transitions */
      a[role="button"], a[href]:not(.portyo-card), div[role="button"] {
        transition: all 150ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      }

      @media (prefers-reduced-motion: reduce) {
        #profile-header-card, #profile-header-bg { transition: none !important; }
        .portyo-parallax-media { transition: none !important; }
      }
      ${animationsCss}
    </style>
    ${videoBgHtml}

    <main id="profile-container" style="${containerStyle} ${cardCss} position:relative; z-index:10;">
      ${headerHtml}
      ${tabsHtml}
      
      <div id="links-feed" style="position:relative; z-index:20; display:block; animation:fadeIn 0.3s ease-out;">
        ${blocks.map(b => blockToHtml(b, bio)).join("")}
      </div>

      <div id="shop-feed" style="display:none; animation:fadeIn 0.3s ease-out;">
        <div id="shop-products-container" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:16px;">
          <div style="grid-column: 1/-1; text-align:center; padding:40px; color:#6b7280;">Loading products...</div>
        </div>
      </div>

      <div id="blog-feed" style="display:none; animation:fadeIn 0.3s ease-out;">
        <div id="blog-posts-container" style="display:flex; flex-direction:column; gap:16px;">
          <div style="text-align:center; padding:40px; color:#6b7280;">Loading posts...</div>
        </div>
      </div>


    </main>
    <div id="share-modal" style="display:none; position:fixed; inset:0; z-index:50; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);">
      <div style="background:white; border-radius:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.3); width:100%; max-width:448px; overflow:hidden; margin:16px; animation:zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
         <div style="display:flex; align-items:center; justify-content:space-between; padding:20px; border-bottom:1px solid rgba(0,0,0,0.08);">
           <h3 style="font-weight:700; font-size:18px; color:#111827; margin:0;">Share this link</h3>
           <button onclick="window.closeShare()" aria-label="Close share modal" style="padding:8px; border-radius:9999px; color:#6b7280; background:rgba(0,0,0,0.05); border:none; cursor:pointer; display:flex; transition:all 200ms ease;" onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.05)'">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
           </button>
         </div>
         <div style="padding:28px;">
           <div style="background:linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius:20px; padding:32px; text-align:center; color:white; margin-bottom:28px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1); position:relative; overflow:hidden;">
             <div style="position:absolute; inset:0; background:radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent); z-index:0;"></div>
             <div style="position:relative; z-index:10;">
                <div style="width:128px; height:128px; background:white; border-radius:16px; margin:0 auto 20px auto; padding:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.2);">
                    <img id="share-qr" src="" alt="QR Code" style="width:100%; height:100%;" />
                </div>
                <p id="share-title" style="font-weight:700; font-size:18px; opacity:0.95; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></p>
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

    <div id="subscribe-modal" style="display:none; position:fixed; inset:0; z-index:50; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);">
      <div style="background:white; border-radius:24px; padding:24px; width:100%; max-width:400px; margin:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.3); position:relative; animation:zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
        <button onclick="window.closeSubscribe()" aria-label="Close subscribe modal" style="position:absolute; top:16px; right:16px; background:rgba(0,0,0,0.05); border:none; cursor:pointer; color:#6b7280; padding:8px; border-radius:9999px; display:flex; transition:all 200ms ease;" onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.05)'">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        
        <h3 style="font-size:22px; font-weight:900; color:#111827; margin:0 0 8px 0; letter-spacing:-0.5px;">Join the list</h3>
        <p style="font-size:14px; color:#6b7280; margin:0 0 24px 0; font-weight:500;">Get the latest updates delivered to your inbox.</p>
        
        <form id="subscribe-form" onsubmit="window.submitSubscribe(event)" style="width:100%; display:flex; align-items:stretch; gap:0;">
          <div style="display:flex; align-items:center; gap:8px; padding:6px; width:100%; background:#f9fafb; border:1.5px solid #e5e7eb; border-radius:16px; box-shadow:0 15px 35px -16px rgba(0,0,0,0.15);">
            <input type="email" placeholder="your@email.com" required style="flex:1; min-width:0; padding:14px 14px; border:none; background:transparent; font-size:16px; outline:none; font-weight:600; color:#111827;" />
            <button type="submit" aria-label="Subscribe" style="width:52px; height:52px; border-radius:12px; background:linear-gradient(135deg, #111827, #1f2937); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:white; flex-shrink:0; transition:all 200ms ease; box-shadow:0 4px 12px -2px rgba(17, 24, 39, 0.2);" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 20px -2px rgba(17, 24, 39, 0.3)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px -2px rgba(17, 24, 39, 0.2)'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </form>
        <p style="margin:16px 0 0 0; font-size:13px; color:#6b7280; text-align:center; display:none;" id="subscribe-success">✓ Thanks for subscribing!</p>
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
      window.submitSubscribe = async function(e) {
        e.preventDefault();
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : '';
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // API Base URL - resolves to backend even when preview is on :5173
        const API_BASE_URL = (function() {
          const forced = window.API_BASE_URL;
          if (forced) return forced;
          const origin = window.location.origin || '';
          if (origin.includes('localhost:5173')) return 'http://localhost:3000/api';
          if (origin.includes('portyo.me')) return 'https://api.portyo.me/api';
          if (origin.includes('127.0.0.1:5173')) return 'http://127.0.0.1:3000/api';
          return origin ? (origin + '/api') : 'https://api.portyo.me/api';
        })();

        if (email) {
            if(submitBtn) {
              submitBtn.disabled = true;
              submitBtn.innerHTML = '<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
            }

            try {
              console.log('Submitting email to:', \`\${API_BASE_URL}/public/email/subscribe/${bio.id}\`);
              const response = await fetch(\`\${API_BASE_URL}/public/email/subscribe/${bio.id}\`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
              });



              if (response.ok) {
                const successMsg = document.getElementById('subscribe-success');
                if (successMsg) {
                    successMsg.style.display = 'block';
                    successMsg.textContent = 'Thanks for subscribing!';
                    successMsg.style.color = '#10b981';
                }
                if (emailInput) emailInput.value = '';
                setTimeout(() => {
                    window.closeSubscribe();
                }, 2000);
              } else if (response.status === 409) {
                 // Email already exists - treat as success for user privacy or show specific message
                 const successMsg = document.getElementById('subscribe-success');
                 if (successMsg) {
                    successMsg.style.display = 'block';
                    successMsg.textContent = 'Thanks for subscribing!'; // Or "You are already subscribed"
                    successMsg.style.color = '#10b981';
                 }
                 if (emailInput) emailInput.value = '';
                 setTimeout(() => {
                    window.closeSubscribe();
                 }, 2000);
              } else {
                const data = await response.json();
                const successMsg = document.getElementById('subscribe-success');
                if (successMsg) {
                    successMsg.style.display = 'block';
                    successMsg.textContent = data.message || 'Something went wrong.';
                    successMsg.style.color = '#ef4444';
                }
              }
            } catch (err) {
               console.error('Subscribe error:', err);
               const successMsg = document.getElementById('subscribe-success');
                if (successMsg) {
                    successMsg.style.display = 'block';
                    successMsg.textContent = 'Failed to connect to server.';
                    successMsg.style.color = '#ef4444';
                }
            } finally {
              if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
              }
            }
        }
      };

      // Safety: wire handler in case onsubmit is stripped by sanitization
      const subscribeForm = document.getElementById('subscribe-form');
      if (subscribeForm && !subscribeForm.getAttribute('data-wired')) {
        subscribeForm.setAttribute('data-wired', 'true');
        subscribeForm.addEventListener('submit', window.submitSubscribe);
      }

      // Blog & Tabs Logic
      window.blogLoaded = false;
      window.shopLoaded = false;
      
      function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
      }

      window.switchTab = function(tabName) {
        const linksTab = document.getElementById('tab-links');
        const shopTab = document.getElementById('tab-shop');
        const blogTab = document.getElementById('tab-blog');
        const linksFeed = document.getElementById('links-feed');
        const shopFeed = document.getElementById('shop-feed');
        const blogFeed = document.getElementById('blog-feed');
        
        // Reset all
        [linksTab, shopTab, blogTab].forEach(t => {
          if(t) {
            t.style.color = '${navInactive}';
            t.style.opacity = '0.9';
            const indicator = t.querySelector('span');
            if (indicator) indicator.style.background = 'transparent';
          }
        });
        [linksFeed, shopFeed, blogFeed].forEach(f => {
          if(f) f.style.display = 'none';
        });

        if (tabName === 'shop') {
            if (shopTab) {
            shopTab.style.color = '${navTextColor}';
            shopTab.style.opacity = '1';
            const indicator = shopTab.querySelector('span');
            if (indicator) indicator.style.background = '${navIndicator}';
            }
            if (shopFeed) shopFeed.style.display = 'block';
            
            if (!window.shopLoaded) {
                window.loadProducts();
            }
            
            if (window.location.pathname !== '/shop') {
                window.history.pushState({ tab: 'shop' }, '', '/shop');
            }
        } else if (tabName === 'blog') {
            if (blogTab) {
            blogTab.style.color = '${navTextColor}';
            blogTab.style.opacity = '1';
            const indicator = blogTab.querySelector('span');
            if (indicator) indicator.style.background = '${navIndicator}';
            }
            if (blogFeed) blogFeed.style.display = 'block';
            
            if (!window.blogLoaded) {
                window.loadBlogPosts();
            }
            
            if (window.location.pathname !== '/blog') {
                window.history.pushState({ tab: 'blog' }, '', '/blog');
            }
        } else {
            if (linksTab) {
                linksTab.style.color = '${navTextColor}';
            linksTab.style.opacity = '1';
            const indicator = linksTab.querySelector('span');
            if (indicator) indicator.style.background = '${navIndicator}';
            }
            if (linksFeed) linksFeed.style.display = 'block';
            
            if (window.location.pathname !== '/') {
                window.history.pushState({ tab: 'links' }, '', '/');
            }
        }
      };

      window.loadProducts = async function() {
        const container = document.getElementById('shop-products-container');
        const API_BASE_URL = 'https://api.portyo.me/api'; 
        
        try {
            const response = await fetch(\`\${API_BASE_URL}/public/products/${bio.id}\`);
            if (!response.ok) throw new Error('Failed to fetch products');
            
            const products = await response.json();
            window.shopLoaded = true;
            
            if (products.length === 0) {
                container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#6b7280;">No products found.</div>';
                return;
            }
            
            container.innerHTML = products.map(product => {
                const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.price || 0);
                const image = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/300x300?text=Product';
                
                return \`
                    <a href="\${product.url || '#'}" target="_blank" class="product-card-item" style="display:flex; flex-direction:column; background:white; border-radius:24px; overflow:hidden; box-shadow:0 4px 20px -8px rgba(0,0,0,0.08); border:1px solid rgba(0,0,0,0.04); text-decoration:none; transition:all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); height:100%; position:relative;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 30px -10px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px -8px rgba(0,0,0,0.08)'">
                        <div style="position:relative; aspect-ratio:1; overflow:hidden; background:#f3f4f6;">
                            <img src="\${image}" alt="\${escapeHtml(product.name)}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" />
                            <div style="position:absolute; bottom:12px; left:12px; background:rgba(255,255,255,0.9); backdrop-filter:blur(8px); padding:6px 14px; border-radius:99px; color:#111827; font-size:13px; font-weight:700; box-shadow:0 4px 10px rgba(0,0,0,0.08);">
                                \${price}
                            </div>
                        </div>
                        <div style="padding:16px; flex:1; display:flex; flex-direction:column;">
                            <h3 style="font-size:16px; font-weight:700; color:#111827; margin:0 0 12px 0; line-height:1.4; flex:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">\${escapeHtml(product.name)}</h3>
                            <div style="background:#111827; color:white; text-align:center; padding:12px; border-radius:14px; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:8px;">
                                <span>View Product</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </div>
                        </div>
                    </a>
                \`;
            }).join('');
            
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#ef4444;">Failed to load products.</div>';
        }
      };

      window.loadBlogPosts = async function() {
        const container = document.getElementById('blog-posts-container');
        const API_BASE_URL = 'https://api.portyo.me/api'; 
        
        try {
            const response = await fetch(\`\${API_BASE_URL}/public/blog/${bio.id}\`);
            if (!response.ok) throw new Error('Failed to fetch posts');
            
            const posts = await response.json();
            window.blogLoaded = true;
            
            if (posts.length === 0) {
                container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#6b7280;">No posts yet.</div>';
                return;
            }

            // Apply grid layout
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            container.style.gap = '24px';
            
            container.innerHTML = posts.map((post, index) => {
                const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const wordCount = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\\s+/).length : 0;
                const readTime = Math.max(1, Math.ceil(wordCount / 200));
                const excerpt = post.content ? post.content.replace(/<[^>]*>/g, '') : '';
                
                // Extract first image from content if available, else placeholder
                let image = 'https://placehold.co/600x400?text=Blog+Post';
                const imgMatch = post.content && post.content.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) {
                    image = imgMatch[1];
                }

                const authorName = (typeof bio !== 'undefined' && (bio.seoTitle || bio.subdomain)) ? (bio.seoTitle || bio.subdomain) : 'Author';
                const authorImage = (typeof bio !== 'undefined' && (bio.profileImage || bio.favicon || bio.ogImage)) ? (bio.profileImage || bio.favicon || bio.ogImage) : ('https://ui-avatars.com/api/?name=' + encodeURIComponent(authorName) + '&background=random');


                return \`
                    <div class="blog-card-item" data-index="\${index}" onclick="(function(){ window.location.href='/blog/post/\${post.id}'; })()" style="
                        background:white; border-radius:24px; overflow:hidden; box-shadow:0 8px 25px -8px rgba(0,0,0,0.08); 
                        border:1px solid rgba(0,0,0,0.03); padding:20px; text-decoration:none; cursor:pointer;
                        display:flex; flex-wrap:wrap; align-items:flex-start; min-height:180px;
                        position: \${posts.length > 1 ? 'absolute' : 'relative'}; top:0; left:0; right:0;
                        transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                        transform-origin: top center;
                        background: #ffffff;
                    ">
                        <!-- Content -->
                        <div style="flex:1; min-width:200px; padding-right:16px; display:flex; flex-direction:column;">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                                <div style="width:24px; height:24px; border-radius:50%; background:#f3f4f6; overflow:hidden;">
                                    <img src="\${authorImage}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=User'" />
                                </div>
                                <span style="font-size:12px; font-weight:600; color:#374151;">\${escapeHtml(authorName)}</span>
                            </div>
                            <h3 style="font-size:18px; font-weight:800; color:#111827; margin:0 0 8px 0; line-height:1.3; letter-spacing:-0.01em; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                                \${escapeHtml(post.title)}
                            </h3>
                            <div style="margin-top:auto; display:flex; align-items:center; justify-content:space-between; width:100%; padding-top:12px;">
                                <div style="font-size:12px; color:#6b7280; font-weight:500;">
                                    \${date} <span style="margin:0 4px; opacity:0.5">•</span> \${readTime} min read
                                </div>
                                <div style="display:flex; align-items:center; gap:12px; color:#4b5563; font-size:13px; font-weight:600;">
                                    <div style="display:flex; align-items:center; gap:4px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                        <span>\${Math.floor(Math.random() * 500) + 100}</span>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:4px;">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                        <span>\${Math.floor(Math.random() * 200) + 20}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Image -->
                        <div style="width:120px; height:120px; flex-shrink:0;">
                            <div style="width:100%; height:100%; border-radius:12px; overflow:hidden; background:#f3f4f6;">
                                <img src="\${image}" alt="\${escapeHtml(post.title)}" style="width:100%; height:100%; object-fit:cover;" />
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
            
            if (posts.length > 1) {
                const controls = \`
                    <div style="display:flex; justify-content:center; gap:16px; margin-top:24px; padding-top:220px;">
                        <button onclick="window.changeBlogStack(-1)" style="width:44px; height:44px; border-radius:50%; background:white; border:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.05); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button onclick="window.changeBlogStack(1)" style="width:44px; height:44px; border-radius:50%; background:#111827; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.15); transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                \`;
                
                // Add interactivity
                if (!window.changeBlogStack) {
                    window.blogStackState = { activeIndex: 0, total: posts.length };
                    window.changeBlogStack = function(dir) {
                        const s = window.blogStackState;
                        s.activeIndex = (s.activeIndex + dir + s.total) % s.total;
                        window.updateCards(s.activeIndex, s.total);
                    };
                    window.updateCards = function(activeIndex, total) {
                        const cards = document.querySelectorAll('.blog-card-item');
                        cards.forEach((card, i) => {
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
                    setTimeout(() => window.updateCards(0, posts.length), 0);
                }
                
                container.innerHTML = \`<div style="position:relative; height:auto; min-height:260px;">\${container.innerHTML}\${controls}</div>\`;
            }
            
        } catch (err) {
            console.error(err);
            container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#ef4444;">Failed to load posts.</div>';
        }
      };

      // History handling removed for iframe compatibility

      // Form Loader
      window.loadForms = async function() {
        const containers = document.querySelectorAll('.custom-form-block');
        if (containers.length === 0) return;

        const API_BASE_URL = 'https://api.portyo.me/api';

        const escapeHtml = (unsafe) => {
            return (unsafe || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        containers.forEach(async (container) => {
            const formId = container.getAttribute('data-form-id');
            const bgColor = container.getAttribute('data-bg-color') || '#ffffff';
            const textColor = container.getAttribute('data-text-color') || '#1f2937';

            if (!formId) return;

            try {
                const response = await fetch(\`\${API_BASE_URL}/public/forms/\${formId}\`);
                if (!response.ok) throw new Error('Failed to fetch form');
                const form = await response.json();

                // Build HTML
                let fieldsHtml = '';
                if (form.fields) {
                    fieldsHtml = form.fields.map(field => {
                        let inputHtml = '';
                        const commonClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white/50 text-gray-900";
                        const labelHtml = \`<label style="display:block; font-size:14px; font-weight:600; opacity:0.9; margin-bottom:6px;">\${escapeHtml(field.label)} \${field.required ? '<span style="color:#ef4444">*</span>' : ''}</label>\`;
                        
                        if (field.type === 'textarea') {
                            inputHtml = \`<textarea placeholder="\${escapeHtml(field.placeholder)}" rows="3" class="\${commonClass}" style="width:100%; box-sizing:border-box; display:block; resize:vertical; padding:10px 16px; border-radius:12px; border:1px solid #e5e7eb; background:rgba(255,255,255,0.5);"></textarea>\`;
                        } else if (field.type === 'select') {
                            const options = (field.options || []).map(opt => \`<option>\${escapeHtml(typeof opt === 'string' ? opt : opt.label)}</option>\`).join('');
                            inputHtml = \`<select class="\${commonClass}" style="width:100%; box-sizing:border-box; display:block; padding:10px 16px; border-radius:12px; border:1px solid #e5e7eb; background:rgba(255,255,255,0.5); appearance:auto;">
                                <option disabled selected>Select an option</option>
                                \${options}
                            </select>\`;
                        } else {
                            inputHtml = \`<input type="\${field.type}" placeholder="\${escapeHtml(field.placeholder)}" class="\${commonClass}" style="width:100%; box-sizing:border-box; display:block; padding:10px 16px; border-radius:12px; border:1px solid #e5e7eb; background:rgba(255,255,255,0.5);" />\`;
                        }

                        return \`<div style="margin-bottom:16px;">\${labelHtml}\${inputHtml}</div>\`;
                    }).join('');
                }

                const btnBg = textColor === '#ffffff' ? '#ffffff' : '#111827';
                const btnColor = textColor === '#ffffff' ? '#111827' : '#ffffff';

                container.innerHTML = \`
                    <div style="padding:24px; border-radius:16px; border:1px solid rgba(0,0,0,0.05); background:\${bgColor}; color:\${textColor}; text-align:left;">
                        <h3 style="font-size:20px; font-weight:700; margin:0 0 8px 0;">\${escapeHtml(form.title)}</h3>
                        \${form.description ? \`<p style="font-size:14px; opacity:0.8; margin:0 0 24px 0; white-space:pre-wrap;">\${escapeHtml(form.description)}</p>\` : ''}
                        <form onsubmit="event.preventDefault(); alert('This is a preview. Forms work on the live page.');">
                            \${fieldsHtml}
                            <button type="submit" style="width:100%; padding:12px 24px; border-radius:12px; font-weight:700; background:\${btnBg}; color:\${btnColor}; border:none; cursor:pointer; margin-top:8px;">
                                \${escapeHtml(form.submitButtonText || "Submit")}
                            </button>
                        </form>
                    </div>
                \`;

            } catch (err) {
                console.error("Form load error", err);
                container.innerHTML = \`<div style="padding:24px; text-align:center; color:#ef4444;">Failed to load form definitions.</div>\`;
            }
        });
      };

      // Initial Load
      if (window.location.pathname === '/blog') {
        window.switchTab('blog');
      } else if (window.location.pathname === '/shop') {
        window.switchTab('shop');
      }

      // Load Forms
      if (window.loadForms) window.loadForms();

    </script>

  </div>`;
};
