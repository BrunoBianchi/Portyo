import { type BioBlock } from "~/contexts/bio.context";
import { isValidUrl, normalizeExternalUrl } from "~/utils/security";
import { normalizeSocialProfileUrl } from "~/utils/social-links";
import { BUTTON_GRID_ICON_FALLBACKS } from "~/constants/button-grid-icons";

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

  return joinBaseUrl(baseUrl, '/base-img/card_base_image.png');
};

const normalizeBackgroundImageSrc = (input: string | null | undefined, userId: string | null | undefined, baseUrl: string) => {
  const trimmed = (input || '').trim();
  if (trimmed) return joinBaseUrl(baseUrl, trimmed);
  if (userId) return joinBaseUrl(baseUrl, `/api/images/${userId}/original.png?v=${Date.now()}`);
  return '';
};

const getBlockShadowStyle = (shadow?: string): string => {
  const shadowMap: Record<string, string> = {
    'none': '',
    'sm': 'box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);',
    'md': 'box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);',
    'lg': 'box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);',
    'xl': 'box-shadow:0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);',
    '2xl': 'box-shadow:0 25px 50px -12px rgb(0 0 0 / 0.25);',
    'glow': 'box-shadow:0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2);',
  };
  return shadowMap[shadow || 'none'] || '';
};

const wrapWithBlockStyles = (block: BioBlock, content: string, animationStyle: string, animationClass: string): string => {
  // Se não houver estilos de bloco customizados, retorna o conteúdo original
  const hasCustomStyle = block.blockBackground || 
    block.blockBorderWidth || 
    block.blockShadow || 
    block.blockPadding !== undefined ||
    block.blockOpacity !== undefined ||
    block.entranceAnimation;

  if (!hasCustomStyle) {
    return content;
  }

  // Construir os estilos do container
  const bgColor = block.blockBackground || 'transparent';
  const textColor = block.textColor || 'inherit';
  const opacity = (block.blockOpacity ?? 100) / 100;
  const borderRadius = block.blockBorderRadius ?? 12;
  const borderWidth = block.blockBorderWidth ?? 0;
  const borderColor = block.blockBorderColor || '#E5E7EB';
  const padding = block.blockPadding ?? 0;
  const shadow = getBlockShadowStyle(block.blockShadow);

  // Estilos do wrapper
  const wrapperStyles = [
    `background-color: ${bgColor}`,
    `color: ${textColor}`,
    `border-radius: ${borderRadius}px`,
    borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor}` : '',
    `padding: ${padding}px`,
    `opacity: ${opacity}`,
    shadow,
    'transition: all 0.2s ease',
  ].filter(Boolean).join('; ');

  // Animação de entrada
  let entranceHtml = '';
  if (block.entranceAnimation && block.entranceAnimation !== 'none') {
    const delay = block.entranceDelay || 0;
    const animationCss = `${block.entranceAnimation} 0.6s ease-out ${delay}ms both`;
    entranceHtml = `<style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
@keyframes flipIn { from { opacity: 0; transform: perspective(400px) rotateY(90deg); } to { opacity: 1; transform: perspective(400px) rotateY(0deg); } }
</style>`;
    
    // Envolver o conteúdo com animação
    return `${entranceHtml}<div class="${animationClass}" style="${wrapperStyles}; animation: ${animationCss}">${content}</div>`;
  }

  return `<div class="${animationClass}" style="${wrapperStyles}; ${animationStyle}">${content}</div>`;
};

export interface HtmlGeneratorExtraData {
  sponsoredLinks?: Array<{
    trackingCode: string;
    position: number;
    offer: {
      id: string;
      title: string;
      description: string;
      imageUrl?: string;
      linkUrl: string;
      backgroundColor?: string;
      textColor?: string;
      layout: string;
      companyName?: string;
      companyLogo?: string;
    };
  }>;
}

export const blockToHtml = (block: BioBlock, bio: any, extraData?: HtmlGeneratorExtraData): string => {
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

  // Helper to wrap content with block styles
  const wrap = (content: string, customBlock?: BioBlock): string => {
    return wrapWithBlockStyles(customBlock || block, content, animationStyle, animationClass);
  };

  if (block.type === "heading") {
    const titleColor = block.textColor || "#0f172a";
    const bodyColor = block.textColor ? `${block.textColor}b3` : "#475569";
    const fontSize = block.fontSize || "32px";
    const fontWeight = block.fontWeight || "800";
    
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <h2 style="margin:0; font-size:${fontSize}; font-weight:${fontWeight}; color:${titleColor}; line-height:1.2; letter-spacing:-0.8px;">${escapeHtml(
      block.title || "Título"
    )}</h2>\n  ${block.body ? `<p style="margin:12px 0 0; color:${bodyColor}; font-size:16px; line-height:1.6; font-weight:500;">${escapeHtml(block.body)}</p>` : ""}\n</section>`);
  }

  if (block.type === "text") {
    const textColor = block.textColor || "#475569";
    const fontSize = block.fontSize || "16px";
    const fontWeight = block.fontWeight || "500";
    
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <p style="margin:0; color:${textColor}; line-height:1.7; font-size:${fontSize}; font-weight:${fontWeight};">${escapeHtml(
      block.body || ""
    )}</p>\n</section>`);
  }

  if (block.type === "qrcode") {
    const layout = block.qrCodeLayout || "single";
    const fgColor = (block.qrCodeColor || "#000000").replace('#', '');
    const bgColor = (block.qrCodeBgColor || "#FFFFFF").replace('#', '');
    
    if (layout === "single") {
      const value = block.qrCodeValue || "https://example.com";
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}&color=${fgColor}&bgcolor=${bgColor}`;
      return wrap(`\n${extraHtml}<section class="${animationClass}" style="text-align:center; padding:12px 0; ${animationStyle}">\n  <div style="display:inline-block; padding:16px; background-color:#${bgColor}; border-radius:24px; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1);">\n    <img src="${qrUrl}" alt="QR Code" style="display:block; width:100%; max-width:200px; height:auto;" />\n  </div>\n</section>`);
    }

    const items = block.qrCodeItems || [];
    if (items.length === 0) return wrap("");

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

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">\n  <div style="${gridStyle}">\n    ${itemHtml}\n  </div>\n</section>`);
  }

  if (block.type === "whatsapp") {
    const phone = (block.whatsappNumber || "").replace(/\D/g, "");
    const message = block.whatsappMessage || "Olá! Quero falar com você.";
    const label = block.title || "Falar no WhatsApp";
    const style = block.whatsappStyle || "solid";
    const shape = block.whatsappShape || "pill";
    const variation = block.whatsappVariation || "direct-button";
    const accent = block.blockBackground || block.accent || "#25D366";
    const textColor = block.textColor || "#ffffff";
    const href = phone ? `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}` : "#";

    // Pre-filled form variation
    if (variation === "pre-filled-form") {
      return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:16px; background:#f9fafb; border-radius:16px; ${animationStyle}">
        <form onsubmit="event.preventDefault(); const msg = this.querySelector('textarea').value; window.open('https://wa.me/${phone}?text=' + encodeURIComponent(msg), '_blank');" style="display:flex; flex-direction:column; gap:12px;">
          <label style="font-weight:600; font-size:14px; color:#374151;">Mensagem para WhatsApp</label>
          <textarea name="message" rows="3" placeholder="Digite sua mensagem..." style="width:100%; padding:12px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:14px; resize:vertical; font-family:inherit;" required>${escapeHtml(message)}</textarea>
          <button type="submit" style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:12px; background:${accent}; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer; font-size:14px; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
            Enviar no WhatsApp
          </button>
        </form>
      </section>`);
    }

    // Direct button (default)
    let css = "display:flex; align-items:center; justify-content:center; gap:10px; width:100%; min-height:48px; padding:14px 20px; font-weight:700; font-size:15px; text-decoration:none; transition:all 240ms ease;";

    if (shape === "pill") css += " border-radius:999px;";
    else if (shape === "square") css += " border-radius:10px;";
    else css += " border-radius:16px;";

    if (style === "outline") {
      css += ` background:transparent; border:2px solid ${accent}; color:${accent};`;
    } else if (style === "glass") {
      css += ` background:rgba(255,255,255,0.2); color:${textColor}; border:1px solid rgba(255,255,255,0.35); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); box-shadow:0 10px 30px rgba(0,0,0,0.08);`;
    } else if (style === "gradient") {
      css += ` background:linear-gradient(135deg, ${accent} 0%, #128C7E 100%); color:${textColor}; box-shadow:0 12px 25px rgba(18, 140, 126, 0.35);`;
    } else if (style === "neon") {
      css += ` background:rgba(0,0,0,0.05); color:${accent}; border:1px solid ${accent}; box-shadow:0 0 14px ${accent}55, inset 0 0 12px ${accent}33;`;
    } else if (style === "minimal") {
      css += ` background:transparent; color:${accent}; border-bottom:2px solid ${accent}55; border-radius:0; padding-left:0; padding-right:0;`;
    } else if (style === "dark") {
      css += ` background:#0f172a; color:#ffffff; border:1px solid rgba(255,255,255,0.08); box-shadow:0 10px 24px rgba(15, 23, 42, 0.35);`;
    } else if (style === "soft") {
      css += ` background:${accent}; color:${textColor}; box-shadow:0 12px 25px rgba(37, 211, 102, 0.35);`;
    } else {
      css += ` background:${accent}; color:${textColor}; box-shadow:0 8px 20px rgba(37, 211, 102, 0.25);`;
    }

    const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>`;
    const targetAttr = phone ? " target=\"_blank\" rel=\"noopener noreferrer\"" : "";
    const wrapperBlock = block.blockBackground ? { ...block, blockBackground: undefined } : block;

    return wrap(`\n${extraHtml}<section style="padding:12px 0;">\n  <a href="${escapeHtml(href)}"${targetAttr} class="${animationClass}" style="${css} ${animationStyle}">${icon}<span>${escapeHtml(label)}</span></a>\n</section>`, wrapperBlock);
  }


  if (block.type === "button") {
    const bg = block.blockBackground || bio.buttonColor || block.accent || "#111827";
    const color = block.textColor || bio.buttonTextColor || "#ffffff";
    const style = block.buttonStyle || bio.buttonStyle || "solid";
    const shape = block.buttonShape || (bio.buttonRadius === "square"
      ? "square"
      : bio.buttonRadius === "full"
        ? "pill"
        : "rounded");
    const shadowColor = block.buttonShadowColor || bg;
    const textAlign = block.buttonTextAlign || "center";
    const shadowPreset = block.buttonShadow || bio.buttonShadow || "none";
    
    const normalized = normalizeExternalUrl(block.href);
    const cleanHref = isValidUrl(normalized) ? normalized : '#';
    const nsfwAttr = (block.isNsfw && cleanHref !== '#')
      ? ` data-nsfw="true" data-nsfw-url="${escapeHtml(cleanHref)}" data-nsfw-target="_blank"`
      : "";
    const tag = block.href ? 'a' : 'div';
    const targetAttr = (cleanHref !== '#') ? ' target="_blank" rel="noopener noreferrer"' : '';
    const hrefAttr = block.href ? ` href="${escapeHtml(cleanHref)}"${targetAttr}` : ' role="button"';
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
      const normalized = normalizeExternalUrl(block.href);
      const cleanHref = isValidUrl(normalized) ? normalized : '#';
      const targetAttr = (cleanHref !== '#') ? ' target="_blank" rel="noopener noreferrer"' : '';
      const hrefAttr = block.href ? ` href="${escapeHtml(cleanHref)}"${targetAttr}` : ' role="button"';
      return wrap(`\n${extraHtml}<section style="padding:6px; display:inline-block; width:50%; box-sizing:border-box; vertical-align:top;">
        <${tag}${hrefAttr} class="${animationClass}" style="position: relative; display: block; aspect-ratio: 261 / 151; width: 100%; border-radius: 20px; overflow: hidden; text-decoration: none; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.15); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform: scale(1); ${cursorStyle}" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'" ${nsfwAttr}>
          <div style="position:absolute; inset:0; background-color:#1f2937;">
            <img src="${escapeHtml(bgImg)}" data-src-debug="${escapeHtml(bgImg)}" alt="${escapeHtml(label)}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s;" onerror="if(this.dataset.srcDebug && this.src !== this.dataset.srcDebug && !this.dataset.retried){this.dataset.retried='true'; this.src=this.dataset.srcDebug;}" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);"></div>
          </div>
          
          <div style="position:absolute; inset:0; padding:14px; display:flex; flex-direction:column; justify-content:space-between; color:white;">
            ${iconHtml}
            <span style="font-size:13px; font-weight:700; letter-spacing:0.01em; text-shadow:0 2px 4px rgba(0,0,0,0.3); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:center;">${label}</span>
          </div>
        </${tag}>
      </section>`);
    } else {
      // Default / Standard / Solid
      css += ` background:${bg}; color:${color}; border:1px solid rgba(0,0,0,0.1); box-shadow:0 8px 24px -6px rgba(0,0,0,0.18), 0 4px 8px -2px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.08);`;
    }

    if (shadowPreset === "soft") {
      css += ` box-shadow:0 12px 24px rgba(0,0,0,0.18);`;
    } else if (shadowPreset === "strong") {
      css += ` box-shadow:0 16px 36px rgba(0,0,0,0.28);`;
    } else if (shadowPreset === "hard") {
      css += ` box-shadow:5px 5px 0px rgba(0,0,0,0.4);`;
    }

    const imageHtml = block.buttonImage ? `<img src="${escapeHtml(block.buttonImage)}" alt="${escapeHtml(block.title || "Imagem do botão")}" style="position:absolute; left:6px; top:50%; transform:translateY(-50%); width:52px; height:52px; border-radius:8px; object-fit:cover;" />` : "";
    
    const textPadding = block.buttonImage ? "padding-left:66px;" : "";
    const textStyle = `flex:1; text-align:${textAlign}; ${textPadding}`;

    const shareButtonHtml = `
      <button data-nsfw-ignore="true" aria-label="Compartilhar link" onclick="event.preventDefault(); event.stopPropagation(); window.openShare(event, '${escapeHtml(isValidUrl(block.href) ? block.href : "")}', '${escapeHtml(block.title || "")}')" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:transparent; border:none; cursor:pointer; padding:8px; border-radius:50%; color:inherit; z-index:10;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    `;

    return wrap(`\n${extraHtml}<section style="padding:12px 0;">\n  <${tag}${hrefAttr} class="${animationClass}" style="${css} ${cursorStyle}"${nsfwAttr}>${imageHtml}<span style="${textStyle}">${escapeHtml(
      block.title || "Abrir link"
    )}</span>${shareButtonHtml}</${tag}>\n</section>`, block.blockBackground ? { ...block, blockBackground: undefined } : block);
  }

  if (block.type === "image") {
    // Build transform CSS
    const scale = block.imageScale ? block.imageScale / 100 : 1;
    const rotation = block.imageRotation || 0;
    const transforms = [];
    if (scale !== 1) transforms.push(`scale(${scale})`);
    if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
    const transformStyle = transforms.length > 0 ? `transform:${transforms.join(' ')};` : '';

    // Build filter CSS
    const filters = [];
    if (block.imageBlur) filters.push(`blur(${block.imageBlur}px)`);
    if (block.imageBrightness && block.imageBrightness !== 100) filters.push(`brightness(${block.imageBrightness / 100})`);
    if (block.imageContrast && block.imageContrast !== 100) filters.push(`contrast(${block.imageContrast / 100})`);
    if (block.imageSaturation && block.imageSaturation !== 100) filters.push(`saturate(${block.imageSaturation / 100})`);
    if (block.imageGrayscale) filters.push('grayscale(1)');
    if (block.imageSepia) filters.push('sepia(1)');
    const filterStyle = filters.length > 0 ? `filter:${filters.join(' ')};` : '';

    // Border styles
    const borderRadius = block.imageBorderRadius || 24;
    const borderWidth = block.imageBorderWidth || 0;
    const borderColor = block.imageBorderColor || '#000000';
    const borderStyle = borderWidth > 0 ? `border:${borderWidth}px solid ${borderColor};` : '';

    // Shadow styles
    const shadowMap: Record<string, string> = {
      'none': '',
      'sm': 'box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);',
      'md': 'box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);',
      'lg': 'box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);',
      'xl': 'box-shadow:0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);',
      '2xl': 'box-shadow:0 25px 50px -12px rgb(0 0 0 / 0.25);',
    };
    const shadowStyle = shadowMap[block.imageShadow || 'none'] || '';

    // Hover effect classes
    const hoverEffect = block.imageHoverEffect || 'none';
    const hoverId = `img-hover-${block.id}`;
    let hoverCss = '';
    if (hoverEffect !== 'none') {
      if (hoverEffect === 'zoom') {
        hoverCss = `<style>.${hoverId}:hover { transform:scale(1.1) ${rotation !== 0 ? `rotate(${rotation}deg)` : ''}; }</style>`;
      } else if (hoverEffect === 'lift') {
        hoverCss = `<style>.${hoverId}:hover { transform:translateY(-8px) ${scale !== 1 ? `scale(${scale})` : ''} ${rotation !== 0 ? `rotate(${rotation}deg)` : ''}; box-shadow:0 25px 50px -12px rgb(0 0 0 / 0.25); }</style>`;
      } else if (hoverEffect === 'glow') {
        hoverCss = `<style>.${hoverId}:hover { box-shadow:0 0 30px rgba(99, 102, 241, 0.6), 0 0 60px rgba(99, 102, 241, 0.3); }</style>`;
      } else if (hoverEffect === 'tilt') {
        hoverCss = `<style>.${hoverId}:hover { transform:perspective(1000px) rotateY(-5deg) rotateX(5deg) ${scale !== 1 ? `scale(${scale})` : ''}; }</style>`;
      }
    }

    const imgStyle = `max-width:100%; border-radius:${borderRadius}px; ${borderStyle} ${shadowStyle} ${transformStyle} ${filterStyle} transition:all 0.3s ease;`;
    
    return wrap(`\n${extraHtml}${hoverCss}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <img class="${hoverId}" src="${escapeHtml(block.mediaUrl || "")}" alt="${escapeHtml(block.title || "")}" style="${imgStyle}" />\n</section>`);
  }

  if (block.type === "socials") {
    const links = block.socials || {};
    const layout = block.socialsLayout || "row";
    const showLabel = block.socialsLabel || false;
    const variation = block.socialsVariation || "icon-grid";

    const icons = Object.entries(links).map(([platform, url]) => {
      if (!url) return "";
      const normalizedSocialUrl = normalizeSocialProfileUrl(platform, String(url));
      const safeUrl = isValidUrl(normalizedSocialUrl) ? normalizedSocialUrl : '#';
      
      // SVG paths for icons
      const svgPaths: Record<string, string> = {
        instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
        twitter: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
        tiktok: '<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>',
        linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
        youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
        github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
        facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
        email: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
        website: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
        threads: '<path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.228 1.33-2.929.812-.616 1.904-.942 3.07-1.017.88-.057 1.762.01 2.626.163-.1-.574-.303-1.033-.607-1.366-.455-.498-1.174-.755-2.14-.768h-.041c-.776 0-1.745.218-2.446.82l-1.285-1.607c1.065-.853 2.402-1.307 3.731-1.33h.058c1.4.018 2.543.465 3.394 1.331.755.77 1.222 1.823 1.395 3.132.573.116 1.1.278 1.572.49 1.26.567 2.203 1.46 2.727 2.585.795 1.707.861 4.486-1.254 6.56-1.799 1.765-4.014 2.553-7.164 2.58z"/>',
        twitch: '<path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>',
        discord: '<path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.076.076 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/>',
        pinterest: '<path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12S18.627 0 12 0z"/>',
        snapchat: '<path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.989-.217a3.1 3.1 0 01.46-.12c.12-.016.24-.016.36-.06.36 0 .66.12.899.36.18.18.3.42.3.66 0 .12-.044.27-.09.39-.45.54-1.17.63-1.83.72-.18.03-.36.06-.54.12-.27.06-.45.18-.57.39-.12.21-.12.45-.06.66.3.93.9 1.95 1.68 2.7.27.27.6.48.93.63.45.225.78.375.78.69.015.27-.195.555-.39.69-.615.42-1.44.63-2.1.72-.075.015-.135.045-.165.09-.03.06-.045.135-.06.21-.03.135-.06.285-.12.42-.045.12-.15.27-.42.27-.12 0-.27-.015-.45-.06-.42-.09-.87-.18-1.35-.18-.225 0-.45.015-.66.06-.6.135-1.11.585-1.62 1.05-.45.42-.93.855-1.62 1.17-.15.06-.3.09-.48.135-.21.06-.42.09-.63.09-.24 0-.45-.045-.66-.12a3.6 3.6 0 01-.48-.15c-.69-.315-1.17-.75-1.62-1.17-.51-.465-.99-.915-1.62-1.05a3.1 3.1 0 00-.66-.06c-.48 0-.93.09-1.35.18-.18.03-.33.06-.45.06-.27 0-.375-.15-.42-.27a3.3 3.3 0 01-.12-.42c-.015-.075-.03-.15-.06-.21-.03-.048-.09-.075-.165-.09-.66-.09-1.485-.3-2.1-.72-.21-.135-.405-.42-.39-.69 0-.315.33-.465.78-.69.33-.15.66-.36.93-.63.78-.75 1.38-1.77 1.68-2.7.06-.21.06-.45-.06-.66-.12-.21-.3-.33-.57-.39-.18-.06-.36-.09-.54-.12-.66-.09-1.38-.18-1.83-.72A.87.87 0 011.8 11.7c0-.24.12-.48.3-.66.24-.24.54-.36.899-.36.12.044.24.044.36.06.147.03.313.075.46.12.33.1.689.201.989.217.198 0 .326-.045.401-.09a5.1 5.1 0 01-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z"/>',
        whatsapp: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.463 3.49 11.815 11.815 0 0012.05 0z"/>',
        telegram: '<path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>',
        spotify: '<circle cx="12" cy="12" r="10"/><path d="M8 15s1-1 4-1 5 2 5 2"/><path d="M7 12.5s1.5-1.5 5-1.5 6 2.5 6 2.5"/><path d="M6 10s2-2 6-2 7 3 7 3"/>',
        behance: '<path d="M1 5h8v14H1z"/><path d="M15 5h8v14h-8z"/><path d="M5 2v10"/><path d="M19 2v10"/>',
        dribbble: '<circle cx="12" cy="12" r="10"/><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"/><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"/><path d="M8.56 2.49c4.36 6 6.13 12 7.65 18.76"/>'
      };

      const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPaths[platform] || ''}</svg>`;
      
      // Detailed list variation shows labels and descriptions
      if (variation === "detailed-list") {
        const descriptions: Record<string, string> = {
          instagram: 'Siga no Instagram',
          twitter: 'Conecte no X',
          tiktok: 'Siga no TikTok',
          linkedin: 'Adicione no LinkedIn',
          youtube: 'Inscreva-se no YouTube',
          github: 'Confira no GitHub',
          facebook: 'Curta no Facebook',
          email: 'Envie um email',
          website: 'Visite o site',
          threads: 'Siga no Threads',
          twitch: 'Assista na Twitch',
          discord: 'Entre no Discord',
          pinterest: 'Siga no Pinterest',
          snapchat: 'Adicione no Snapchat',
          whatsapp: 'Converse no WhatsApp',
          telegram: 'Converse no Telegram',
          spotify: 'Ouça no Spotify',
          behance: 'Veja no Behance',
          dribbble: 'Veja no Dribbble'
        };
        return `<a href="${escapeHtml(safeUrl)}" style="display:flex; align-items:center; gap:12px; padding:14px 16px; background:white; border:1.5px solid rgba(0,0,0,0.08); border-radius:12px; text-decoration:none; transition:all 0.2s; width:100%;" onmouseover="this.style.borderColor='rgba(0,0,0,0.2)'" onmouseout="this.style.borderColor='rgba(0,0,0,0.08)'>
          <div style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.02)); border-radius:8px;">${iconSvg}</div>
          <div style="flex:1; text-align:left;">
            <div style="font-weight:700; color:#1f2937; text-transform:capitalize;">${platform}</div>
            <div style="font-size:12px; color:#6b7280;">${descriptions[platform] || ''}</div>
          </div>
        </a>`;
      }
      
      // Floating buttons - will be positioned fixed
      if (variation === "floating-buttons") {
        return `<a href="${escapeHtml(safeUrl)}" aria-label="${escapeHtml(platform)}" style="display:flex; align-items:center; justify-content:center; width:48px; height:48px; background:white; border:1.5px solid rgba(0,0,0,0.08); color:#374151; text-decoration:none; border-radius:50%; box-shadow:0 4px 6px rgba(0,0,0,0.1); transition:all 280ms ease;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">${iconSvg}</a>`;
      }
      
      // Icon grid (default)
      const label = showLabel ? `<span style="margin-left:8px; text-transform:capitalize;">${platform}</span>` : "";
      const style = showLabel 
        ? `display:flex; align-items:center; justify-content:center; padding:12px 16px; background:linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.02)); border:1.5px solid rgba(0,0,0,0.08); color:#374151; text-decoration:none; font-weight:700; border-radius:12px; width:${layout === 'column' ? '100%' : 'auto'}; transition:all 280ms ease; cursor:pointer;`
        : `display:inline-flex; align-items:center; justify-content:center; padding:12px; background:linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.02)); border:1.5px solid rgba(0,0,0,0.08); color:#374151; text-decoration:none; border-radius:12px; width:${layout === 'column' ? '100%' : 'auto'}; transition:all 280ms ease; cursor:pointer;`;

      return `<a href="${escapeHtml(safeUrl)}" aria-label="${escapeHtml(platform)}" style="${style}">${iconSvg}${label}</a>`;
    }).join("");

    // Floating buttons get fixed positioning
    if (variation === "floating-buttons") {
      return wrap(`\n${extraHtml}<div style="position:fixed; right:16px; bottom:16px; display:flex; flex-direction:column; gap:12px; z-index:1000;">${icons}</div>`);
    }

    const containerStyle = variation === "detailed-list" || layout === 'column'
        ? `display:flex; flex-direction:column; gap:12px; align-items:${align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}; ${animationStyle}`
        : `display:flex; gap:12px; justify-content:${align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}; flex-wrap:wrap; ${animationStyle}`;

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0;">\n  <div style="${containerStyle}">${icons}</div>\n</section>`);
  }

  if (block.type === "video") {
    const videoId = block.mediaUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    if (!videoId) return "";
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="text-align:${align}; padding:12px 0; ${animationStyle}">\n  <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:24px;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe></div>\n</section>`);
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
    if (!slotId) {
      return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
        <div style="padding:24px; text-align:center; background:#f3f4f6; border:2px dashed #d1d5db; border-radius:16px; color:#6b7280; font-size:14px;">
          Nenhum slot de marketing configurado. Edite este bloco para adicionar um ID de slot.
        </div>
      </section>`);
    }
    
    // We render a placeholder that React will hydrate via BioLayout -> MarketingWidget
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div class="custom-marketing-block" data-marketing-id="${escapeHtml(slotId)}" data-bio-id="${bio.id}">
         <div style="padding:24px; text-align:center; background:rgba(255,255,255,0.5); border:2px dashed #9ca3af; border-radius:12px; color:#4b5563; font-family:inherit;">
           <div style="font-weight:600;">Marketing Slot</div>
         </div>
      </div>
    </section>`);
  }

  if (block.type === "form") {
    const formId = block.formId;
    if (!formId) return "";
    
    // We render a placeholder that React will hydrate
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div class="custom-form-block" data-form-id="${escapeHtml(formId)}" data-bg-color="${escapeHtml(block.formBackgroundColor || "#ffffff")}" data-text-color="${escapeHtml(block.formTextColor || "#1f2937")}">
         <!-- Loading State for SSR/No-JS -->
         <div style="padding:24px; text-align:center; background:${escapeHtml(block.formBackgroundColor || "#ffffff")}; border-radius:24px; color:${escapeHtml(block.formTextColor || "#1f2937")}; border:1px solid rgba(0,0,0,0.1);">
           Carregando formulário...
         </div>
      </div>
    </section>`);
  }

  if (block.type === "portfolio") {
    const title = block.portfolioTitle || "Portfólio";
    
    // We render a placeholder that React will hydrate with PortfolioWidget
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div class="custom-portfolio-block" data-title="${escapeHtml(title)}" data-bio-id="${bio.id}">
         <!-- Loading State for SSR/No-JS -->
         <div style="padding:24px; text-align:center; background:#ffffff; border-radius:24px; color:#1f2937; border:1px solid rgba(0,0,0,0.1);">
           Carregando portfólio...
         </div>
      </div>
    </section>`);
  }

  if (block.type === "experience") {
    const title = block.experienceTitle || "Experiência";
    const experiences = block.experiences || [];
    
    // Colors
    const roleColor = block.experienceRoleColor || "#111827";
    const textColor = block.experienceTextColor || "#374151";
    const lineColor = block.experienceLineColor || "#e5e7eb";

    const itemsHtml = experiences
      .map((experience, index) => {
        const role = escapeHtml(experience.role || "");
        const company = escapeHtml(experience.company || "");
        const period = escapeHtml(experience.period || "");
        const location = escapeHtml(experience.location || "");
        const description = experience.description
          ? escapeHtml(experience.description).replace(/\n/g, "<br />")
          : "";
        
        // Use roleColor for the dot as well
        const dotColor = roleColor; 

        return `
          <div style="position:relative; margin-bottom:32px; padding-left:14px;">
             <!-- Timeline Dot -->
             <div style="position:absolute; left:-27px; top:6px; width:12px; height:12px; border-radius:50%; background:${dotColor}; border:2px solid #ffffff; box-shadow:0 0 0 2px ${dotColor}10;"></div>
             
             <!-- Content -->
             <div style="display:flex; flex-direction:column; gap:4px;">
               <div style="font-weight:700; font-size:16px; color:${roleColor}; line-height:1.3;">${role}</div>
               
               <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-size:13px; color:${textColor}b3; font-weight:500;">
                 <span>${company}</span>
                 ${location ? `<span style="width:3px; height:3px; border-radius:50%; background:${textColor}60;"></span><span>${location}</span>` : ""}
               </div>

               ${period ? `<div style="font-size:12px; color:${textColor}90; font-family:monospace; margin-top:2px; background:${lineColor}40; align-self:flex-start; padding:2px 8px; border-radius:4px;">${period}</div>` : ""}

               ${description ? `<p style="margin:8px 0 0; color:${textColor}; font-size:14px; line-height:1.6;">${description}</p>` : ""}
             </div>
          </div>
        `;
      })
      .join("");

    const emptyHtml = experiences.length === 0
      ? `<div style="padding:16px; border:1px dashed ${lineColor}; border-radius:16px; color:${textColor}80; font-size:13px; text-align:center;">Adicione sua primeira experiência</div>`
      : "";

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div style="padding:16px 20px;">
        <h3 style="margin:0 0 24px 0; font-size:20px; font-weight:800; color:${roleColor}; letter-spacing:-0.5px;">${escapeHtml(title)}</h3>
        
        <!-- Timeline Container -->
        <div style="border-left:2px solid ${lineColor}; margin-left:8px; padding-top:4px;">
           ${itemsHtml || emptyHtml}
        </div>
      </div>
    </section>`);
  }

  if (block.type === "calendar") {
    const title = block.calendarTitle || "Agendar Chamada";
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
         ${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => `<div style="width:36px; text-align:center; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">${d}</div>`).join('')}
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
    
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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
    </section>`);
  }

  if (block.type === "map") {
    const title = block.mapTitle || "Nosso Escritório";
    const address = block.mapAddress || "123 Main St, City";
    const encodedAddress = encodeURIComponent(address);
    
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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
    </section>`);
  }

  if (block.type === "featured") {
    const title = block.featuredTitle || "Item em Destaque";
    const price = block.featuredPrice || "$19.99";
    const image = block.featuredImage || "/base-img/card_base_image.png";
    const url = isValidUrl(block.featuredUrl) ? block.featuredUrl : "#";
    const bgColor = block.featuredColor || "#1f4d36";
    const textColor = block.featuredTextColor || "#ffffff";
    
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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
    </section>`);
  }

  if (block.type === "affiliate") {
    const title = block.affiliateTitle || "Copie meu cupom";
    const code = block.affiliateCode || "CODE123";
    const image = block.affiliateImage || "/base-img/card_base_image.png";
    const url = isValidUrl(block.affiliateUrl) ? block.affiliateUrl : "#";
    const bgColor = block.affiliateColor || "#ffffff";
    const textColor = block.affiliateTextColor || "#374151";
    
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div style="background:${bgColor}; border-radius:24px; padding:24px; text-align:center; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1); border:1px solid #e5e7eb;">
        <a href="${escapeHtml(url)}" style="display:block; margin-bottom:16px;">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" style="width:120px; height:120px; object-fit:cover; border-radius:16px; margin:0 auto; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
        </a>
        <p style="margin:0 0 12px 0; font-size:14px; font-weight:600; color:${textColor};">${escapeHtml(title)}</p>
        <button onclick="navigator.clipboard.writeText('${escapeHtml(code)}').then(() => { this.innerHTML = 'Copiado!'; setTimeout(() => { this.innerHTML = '${escapeHtml(code)} <svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' style=\'display:inline-block; vertical-align:middle; margin-left:4px;\'><rect width=\'14\' height=\'14\' x=\'8\' y=\'8\' rx=\'2\' ry=\'2\'/><path d=\'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\'/></svg>'; }, 2000); })" style="width:100%; border:2px dashed #cbd5e1; border-radius:16px; padding:12px; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; background:rgba(255,255,255,0.5); font-family:monospace; font-size:16px; font-weight:700; color:${textColor}; transition:all 0.2s;">
          ${escapeHtml(code)}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
    </section>`);
  }

  if (block.type === "event") {
    const title = block.eventTitle || "Evento ao Vivo";
    const date = block.eventDate || new Date(Date.now() + 86400000 * 7).toISOString();
    const bgColor = block.eventColor || "#111827";
    const textColor = block.eventTextColor || "#ffffff";
    const btnText = block.eventButtonText || "Inscrever-se";
    const btnUrl = isValidUrl(block.eventButtonUrl) ? block.eventButtonUrl : "#";
    const uniqueId = `countdown-${block.id}`;

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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
    </section>`);
  }

  if (block.type === "tour") {
    const tours = block.tours || [];
    const title = block.tourTitle || "TOURS";
    const uniqueId = `tour-${block.id}`;

    if (tours.length === 0) {
      return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
        <h3 style="text-align:center; font-size:14px; font-weight:700; letter-spacing:0.1em; margin:0 0 16px 0; color:#111827;">${escapeHtml(title.toUpperCase())}</h3>
        <div style="padding:24px; text-align:center; background:#f3f4f6; border:2px dashed #d1d5db; border-radius:16px; color:#6b7280; font-size:14px;">
          Nenhuma data de turnê adicionada. Edite este bloco para adicionar shows.
        </div>
      </section>`);
    }

    const cards = tours.map(tour => {
      const bgImage = tour.image || "";
      const date = tour.date || "TBA";
      const location = tour.location || "Local";
      const ticketUrl = isValidUrl(tour.ticketUrl) ? tour.ticketUrl : "#";
      const isSoldOut = tour.soldOut;
      const isSellingFast = tour.sellingFast;

      let badgeHtml = "";
      if (isSoldOut) {
        badgeHtml = `<span style="background:#dc2626; color:white; font-size:10px; font-weight:700; padding:4px 8px; border-radius:99px; text-transform:uppercase; letter-spacing:0.05em;">Esgotado</span>`;
      } else if (isSellingFast) {
        badgeHtml = `<span style="background:rgba(0,0,0,0.8); color:white; font-size:10px; font-weight:700; padding:4px 8px; border-radius:99px; text-transform:uppercase; letter-spacing:0.05em; border:1px solid rgba(255,255,255,0.2);">Acabando</span>`;
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

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
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
    </section>`);
  }

  if (block.type === "button_grid") {
    const items = block.gridItems || [];
    if (items.length === 0) {
      return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
        <div style="padding:24px; text-align:center; background:#f3f4f6; border:2px dashed #d1d5db; border-radius:16px; color:#6b7280; font-size:14px;">
          Nenhum item na grade. Edite este bloco para adicionar itens.
        </div>
      </section>`);
    }

    const gridHtml = items.map(item => {
      const bgImg = item.image || "";
      const iconKey = item.icon || "";
      const iconText = BUTTON_GRID_ICON_FALLBACKS[iconKey] || iconKey;
      const title = item.title || "";
      const normalized = normalizeExternalUrl(item.url);
      const url = isValidUrl(normalized) ? normalized : "#";

      return `
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="position:relative; display:block; aspect-ratio:261/151; width:100%; border-radius:15px; overflow:hidden; text-decoration:none; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1);" onmouseover="const i=this.querySelector('img');if(i)i.style.transform='scale(1.1)'" onmouseout="const i=this.querySelector('img');if(i)i.style.transform='scale(1)'">
          <div style="position:absolute; inset:0; background-color:#1f2937;">
            ${bgImg ? `<img src="${escapeHtml(bgImg)}" data-src-debug="${escapeHtml(bgImg)}" alt="${escapeHtml(title)}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s;" onerror="if(this.dataset.srcDebug && this.src !== this.dataset.srcDebug && !this.dataset.retried){this.dataset.retried='true'; this.src=this.dataset.srcDebug;}" />` : `<div style="width:100%; height:100%; background:linear-gradient(to bottom right, #374151, #111827);"></div>`}
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);"></div>
          </div>
          
          <div style="position:absolute; inset:0; padding:12px; display:flex; flex-direction:column; justify-content:space-between; color:white;">
            ${iconKey ? `<div style="width:32px; height:32px; border-radius:50%; background:white; box-shadow:0 2px 4px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; font-size:15px; line-height:1;">${escapeHtml(iconText)}</div>` : '<div style="height:32px;"></div>'}
            ${title ? `<span style="font-size:14px; font-weight:700; text-shadow:0 1px 2px rgba(0,0,0,0.5); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:center;">${escapeHtml(title)}</span>` : ''}
          </div>
        </a>
      `;
    }).join("");

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; width:100%;">
        ${gridHtml}
      </div>
    </section>`);
  }

  if (block.type === "spotify") {
    const url = block.spotifyUrl;
    const isCompact = block.spotifyCompact;
    const variation = block.spotifyVariation || "single-track";
    
    if (!url) return "";

    let embedUrl = "";
    let height = "152";
    
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

    // Adjust height based on variation
    if (variation === "artist-profile") {
      height = "380";
    } else if (variation === "album" || variation === "playlist") {
      height = "380";
    } else if (variation === "single-track") {
      height = isCompact ? "80" : "152";
    }

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; overflow:hidden; ${animationStyle}">
      <iframe style="border-radius:24px; overflow:hidden; border:0;" src="${embedUrl}" width="100%" height="${height}" frameBorder="0" scrolling="no" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </section>`);
  }

  if (block.type === "instagram") {
    const username = block.instagramUsername || "instagram";
    const instagramBioId = block.bioId || bio?.id || "";
    const url = `https://instagram.com/${username}`;
    const displayType = block.instagramDisplayType || "grid";
    const variation = block.instagramVariation || "grid-shop";
    const uniqueId = `instagram-${block.id}`;
    const showText = block.instagramShowText !== false;
    const textPosition = block.instagramTextPosition || "bottom";
    const textColor = block.instagramTextColor || "#0095f6";
    
    // Different rendering based on variation
    if (variation === "simple-link") {
      // Variation 1: Simple button link
      const buttonStyle = `
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:12px 24px;
        background:linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
        color:white;
        text-decoration:none;
        border-radius:12px;
        font-weight:600;
        font-size:14px;
        transition:transform 0.2s;
      `;
      
      return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; text-align:center; ${animationStyle}">
        <a href="${escapeHtml(url)}" target="_blank" style="${buttonStyle}" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          Siga @${escapeHtml(username)} no Instagram
        </a>
      </section>`);
    }
    
    // Variation 2: Grid-shop (with shopping/link indicators on hover)
    if (variation === "grid-shop") {
      const gridStyle = displayType === 'grid' 
        ? "display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;" 
        : "display:flex; flex-direction:column; gap:12px;";

      const imageStyle = displayType === 'grid'
        ? "aspect-ratio:1; width:100%;"
        : "aspect-ratio:1; width:100%; max-height:400px;";

      // Initial placeholders with loading spinner (SSR)
      const placeholders = [1, 2, 3].map(() => `
        <div style="position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6; border-radius:8px;">
          <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
             <div style="width:24px; height:24px; border:2px solid #d1d5db; border-top-color:#0095f6; border-radius:50%; animation:spin 1s linear infinite;"></div>
          </div>
        </div>
      `).join('');

      const textHtml = showText ? `
        <div style="text-align:center; ${textPosition === 'top' ? 'margin-bottom:12px;' : 'margin-top:12px;'}">
          <a href="${escapeHtml(url)}" target="_blank" style="display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:${textColor}; text-decoration:none; padding:6px 12px; background:rgba(0,149,246,0.1); border-radius:20px; transition:background 0.2s;" onmouseover="this.style.background='rgba(0,149,246,0.15)'" onmouseout="this.style.background='rgba(0,149,246,0.1)'">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            @${escapeHtml(username)}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
          </a>
        </div>
      ` : '';

      return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
        ${textPosition === 'top' ? textHtml : ''}
        <div id="${uniqueId}" class="custom-instagram-feed" data-bio-id="${escapeHtml(String(instagramBioId))}" data-username="${escapeHtml(username)}" data-display-type="${displayType}" data-variation="${variation}" style="${gridStyle} border-radius:12px; overflow:hidden;">
          ${placeholders}
        </div>
        ${textPosition === 'bottom' ? textHtml : ''}
      </section>`);
    }
    
    // Variation 3: Visual-gallery (clean, minimal, photo-focused)
    if (variation === "visual-gallery") {
      const gridStyle = displayType === 'grid' 
        ? "display:grid; grid-template-columns:repeat(3, 1fr); gap:2px;" 
        : "display:flex; flex-direction:column; gap:8px;";

      const imageStyle = displayType === 'grid'
        ? "aspect-ratio:1; width:100%;"
        : "aspect-ratio:1; width:100%; max-height:400px;";

      // Initial placeholders with loading spinner (SSR)
      const placeholders = [1, 2, 3].map(() => `
        <div style="position:relative; ${imageStyle} overflow:hidden; background:#fafafa;">
          <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
             <div style="width:20px; height:20px; border:2px solid #e0e0e0; border-top-color:#0095f6; border-radius:50%; animation:spin 1s linear infinite;"></div>
          </div>
        </div>
      `).join('');

      const textHtml = showText ? `
        <div style="text-align:center; ${textPosition === 'top' ? 'margin-bottom:8px;' : 'margin-top:8px;'}">
          <a href="${escapeHtml(url)}" target="_blank" style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:500; color:${textColor}; text-decoration:none; opacity:0.8; transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            @${escapeHtml(username)}
          </a>
        </div>
      ` : '';

      return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
        ${textPosition === 'top' ? textHtml : ''}
        <div id="${uniqueId}" class="custom-instagram-feed" data-bio-id="${escapeHtml(String(instagramBioId))}" data-username="${escapeHtml(username)}" data-display-type="${displayType}" data-variation="${variation}" style="${gridStyle} border-radius:16px; overflow:hidden;">
          ${placeholders}
        </div>
        ${textPosition === 'bottom' ? textHtml : ''}
      </section>`);
    }
    
    // Fallback to grid-shop if variation is not recognized
    const gridStyle = displayType === 'grid' 
      ? "display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;" 
      : "display:flex; flex-direction:column; gap:12px;";

    const imageStyle = displayType === 'grid'
      ? "aspect-ratio:1; width:100%;"
      : "aspect-ratio:1; width:100%; max-height:400px;";

    const placeholders = [1, 2, 3].map(() => `
      <div style="position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6; border-radius:8px;">
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

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      ${textPosition === 'top' ? textHtml : ''}
      <div id="${uniqueId}" class="custom-instagram-feed" data-bio-id="${escapeHtml(String(instagramBioId))}" data-username="${escapeHtml(username)}" data-display-type="${displayType}" data-variation="${variation}" style="${gridStyle} border-radius:12px; overflow:hidden;">
        ${placeholders}
      </div>
      ${textPosition === 'bottom' ? textHtml : ''}
    </section>`);
  }

  if (block.type === "threads") {
    const username = block.threadsUsername || "threads";
    const threadsBioId = block.bioId || bio?.id || "";
    const url = `https://threads.net/@${username}`;
    const displayType = block.threadsDisplayType || "grid";
    const variation = block.threadsVariation || "thread-grid";
    const uniqueId = `threads-${block.id}`;
    const showText = block.threadsShowText !== false;
    const textPosition = block.threadsTextPosition || "bottom";
    const textColor = block.threadsTextColor || "#111111";

    if (variation === "simple-link") {
      const buttonStyle = `
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:12px 24px;
        background:#111111;
        color:white;
        text-decoration:none;
        border-radius:12px;
        font-weight:700;
        font-size:14px;
        transition:transform 0.2s;
      `;

      return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; text-align:center; ${animationStyle}">
        <a href="${escapeHtml(url)}" target="_blank" style="${buttonStyle}" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          <span style="font-weight:900; font-size:16px; line-height:1;">@</span>
          Siga @${escapeHtml(username)} no Threads
        </a>
      </section>`);
    }

    const gridStyle = displayType === 'grid'
      ? "display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;"
      : "display:flex; flex-direction:column; gap:10px;";

    const imageStyle = displayType === 'grid'
      ? "aspect-ratio:1; width:100%;"
      : "aspect-ratio:1; width:100%; max-height:400px;";

    const placeholders = [1, 2, 3].map(() => `
      <div style="position:relative; ${imageStyle} overflow:hidden; background:#f3f4f6; border-radius:10px;">
        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
           <div style="width:22px; height:22px; border:2px solid #d1d5db; border-top-color:#111111; border-radius:50%; animation:spin 1s linear infinite;"></div>
        </div>
      </div>
    `).join('');

    const textHtml = showText ? `
      <div style="text-align:center; ${textPosition === 'top' ? 'margin-bottom:10px;' : 'margin-top:10px;'}">
        <a href="${escapeHtml(url)}" target="_blank" style="display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:${textColor}; text-decoration:none; padding:6px 12px; background:rgba(17,17,17,0.06); border-radius:999px;">
          <span style="font-weight:900; font-size:14px; line-height:1;">@</span>
          @${escapeHtml(username)}
        </a>
      </div>
    ` : '';

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      ${textPosition === 'top' ? textHtml : ''}
      <div id="${uniqueId}" class="custom-threads-feed" data-bio-id="${escapeHtml(String(threadsBioId))}" data-username="${escapeHtml(username)}" data-display-type="${displayType}" data-variation="${variation}" style="${gridStyle} border-radius:12px; overflow:hidden;">
        ${placeholders}
      </div>
      ${textPosition === 'bottom' ? textHtml : ''}
    </section>`);
  }

  if (block.type === "youtube") {
    const url = block.youtubeUrl || "https://youtube.com/@youtube";
    const displayType = block.youtubeDisplayType || "grid";
    const variation = block.youtubeVariation || "full-channel";
    const showText = block.youtubeShowText !== false;
    const textPosition = block.youtubeTextPosition || "bottom";
    const textColor = block.youtubeTextColor || "#ff0000";
    
    // Single video variation - embed the video directly
    if (variation === "single-video" && url.includes('watch?v=')) {
      const videoId = url.split('watch?v=')[1]?.split('&')[0];
      if (videoId) {
        return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
          <div style="position:relative; width:100%; padding-bottom:56.25%; border-radius:12px; overflow:hidden;">
            <iframe style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </section>`);
      }
    }
    
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

    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      ${textPosition === 'top' ? textHtml : ''}
      <div class="custom-youtube-feed" data-url="${escapeHtml(url)}" data-display-type="${displayType}" data-variation="${variation}" style="${gridStyle} border-radius:12px; overflow:hidden;">
        ${placeholders}
      </div>
      ${textPosition === 'bottom' ? textHtml : ''}
    </section>`);
  }

  // Sponsored Links block - render real offer data when available
  if (block.type === "sponsored_links") {
    const links = extraData?.sponsoredLinks || [];
    
    if (links.length === 0) {
      // Fallback placeholder when no data available
      return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
        <div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:10px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          <span style="font-size:10px; color:#9ca3af; font-weight:500;">Patrocinado</span>
        </div>
        <div style="width:100%; border-radius:16px; overflow:hidden; border:2px solid #e5e7eb;">
          <div style="padding:16px; display:flex; align-items:center; gap:12px; background:#10b981;">
            <div style="width:48px; height:48px; border-radius:12px; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:18px; flex-shrink:0;">S</div>
            <div style="flex:1; min-width:0;">
              <p style="margin:0; font-size:14px; font-weight:700; color:white; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Sponsored Link</p>
              <p style="margin:4px 0 0; font-size:12px; color:rgba(255,255,255,0.8); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Clique para visitar</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </div>
        </div>
      </section>`);
    }
    
    const externalLinkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; opacity:0.6;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
    
    const linksHtml = links.map(link => {
      const offer = link.offer;
      const bgColor = offer.backgroundColor || "#10b981";
      const txtColor = offer.textColor || "#ffffff";
      const layout = offer.layout || "card";
      const initial = escapeHtml(offer.title.charAt(0));
      const title = escapeHtml(offer.title);
      const desc = escapeHtml(offer.description || "");
      const imgHtml = offer.imageUrl
        ? `<img src="${escapeHtml(offer.imageUrl)}" alt="${title}" style="width:48px; height:48px; border-radius:12px; object-fit:cover; flex-shrink:0; border:2px solid rgba(255,255,255,0.2);" />`
        : `<div style="width:48px; height:48px; border-radius:12px; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:18px; flex-shrink:0;">${initial}</div>`;
      
      if (layout === "banner") {
        const bannerImgHtml = offer.imageUrl
          ? `<img src="${escapeHtml(offer.imageUrl)}" alt="${title}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; flex-shrink:0;" />`
          : `<div style="width:40px; height:40px; border-radius:8px; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; flex-shrink:0;">${initial}</div>`;
        return `<div style="width:100%; border-radius:12px; overflow:hidden; background:${bgColor}; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:12px; padding:12px 16px;">
            ${bannerImgHtml}
            <div style="flex:1; min-width:0;">
              <p style="margin:0; font-size:14px; font-weight:700; color:${txtColor}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${title}</p>
              <p style="margin:2px 0 0; font-size:12px; color:${txtColor}; opacity:0.8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${desc}</p>
            </div>
            <span style="color:${txtColor};">${externalLinkSvg}</span>
          </div>
        </div>`;
      }
      
      if (layout === "compact") {
        const compactImgHtml = offer.imageUrl
          ? `<img src="${escapeHtml(offer.imageUrl)}" alt="${title}" style="width:24px; height:24px; border-radius:4px; object-fit:cover; flex-shrink:0;" />`
          : `<div style="width:24px; height:24px; border-radius:4px; background:${bgColor}; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:700; flex-shrink:0;">${initial}</div>`;
        return `<div style="display:flex; align-items:center; gap:10px; width:100%; padding:8px 12px; border-radius:8px; border:1px solid #e5e7eb; background:white; margin-bottom:8px;">
          ${compactImgHtml}
          <span style="font-size:14px; font-weight:500; color:#1f2937; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${title}</span>
          <span style="color:#9ca3af;">${externalLinkSvg}</span>
        </div>`;
      }
      
      // Default: card layout
      return `<div style="width:100%; border-radius:16px; overflow:hidden; border:2px solid #e5e7eb; margin-bottom:8px;">
        <div style="padding:16px; display:flex; align-items:center; gap:12px; background:${bgColor};">
          ${imgHtml}
          <div style="flex:1; min-width:0;">
            <p style="margin:0; font-size:14px; font-weight:700; color:${txtColor}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${title}</p>
            <p style="margin:4px 0 0; font-size:12px; color:${txtColor}; opacity:0.8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${desc}</p>
          </div>
          <span style="color:${txtColor};">${externalLinkSvg}</span>
        </div>
      </div>`;
    }).join("");
    
    return wrap(`\n${extraHtml}<section class="${animationClass}" style="padding:12px 0; ${animationStyle}">
      <div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:10px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        <span style="font-size:10px; color:#9ca3af; font-weight:500;">Patrocinado</span>
      </div>
      ${linksHtml}
    </section>`);
  }

  return "\n<hr style=\"border:none; border-top:1px solid #E5E7EB; margin:18px 0;\" />";
};

export const blocksToHtml = (blocks: BioBlock[], user: any, bio: any, baseUrl: string = "", extraData?: HtmlGeneratorExtraData) => {
  if (!bio) bio = {};
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
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
    @keyframes flipIn { from { opacity: 0; transform: perspective(400px) rotateY(90deg); } to { opacity: 1; transform: perspective(400px) rotateY(0deg); } }
    @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
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
    const extension = bio.customFontUrl.split('.').pop()?.toLowerCase();
    let format = 'truetype';
    if (extension === 'woff') format = 'woff';
    if (extension === 'woff2') format = 'woff2';
    if (extension === 'otf') format = 'opentype';
    if (extension === 'ttf') format = 'truetype';

    fontLink = `
      <style>
        @font-face {
          font-family: 'CustomFont';
          src: url('${bio.customFontUrl}') format('${format}');
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

  const layoutFromImageStyle = bio.imageStyle === 'hero' ? 'hero' : 'classic';
  const profileImageLayout = bio.profileImageLayout || layoutFromImageStyle;
  const profileImageSize = bio.profileImageSize || 'small';
  const titleStyle = bio.titleStyle || 'text';

  const imageStyleKey = imageStyles[bio.imageStyle || ''] ? (bio.imageStyle || 'circle') : 'circle';
  const imgStyle = imageStyles[imageStyleKey] || imageStyles.circle;
  const usernameColor = bio.usernameColor || '#111827';

  const hasProducts = blocks.some(b => b.type === 'product' || b.type === 'featured');
  const hasBlog = blocks.some(b => b.type === 'blog');

  const socials = bio.socials || {};
  const description = bio.description || "";
  const displayProfileImage = bio.displayProfileImage !== false;
  const handle = bio.username || bio.sufix || 'user';
  const displayName = bio.sufix || 'User';
  const profileImageSrc = normalizeProfileImageSrc(bio.profileImage, user?.id, baseUrl);
  const titleLogoSrc = bio.favicon || bio.ogImage || profileImageSrc;

  const classicImageSize = profileImageSize === 'large' ? 190 : 150;
  const heroImageHeight = profileImageSize === 'large' ? 280 : 210;

  const profileImageHtml = displayProfileImage ? (profileImageLayout === 'hero'
    ? `
        <div style="width:100%; height:${heroImageHeight}px; border-radius:24px; overflow:hidden; box-shadow:0 14px 30px -10px rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.4); margin-bottom: 18px; background:#f3f4f6; position:relative;" ${bio.isPreview ? 'onmouseover="this.querySelector(\'.upload-overlay\').style.opacity=\'1\'" onmouseout="this.querySelector(\'.upload-overlay\').style.opacity=\'0\'"' : ''}>
               <img loading="lazy" src="${profileImageSrc}" onerror="this.src='${joinBaseUrl(baseUrl, '/base-img/card_base_image.png')}'" alt="${escapeHtml(displayName)}" style="width:100%; height:100%; object-fit:cover;" />
               ${bio.isPreview ? `
               <div class="upload-overlay" onclick="window.parent.postMessage({type: 'TRIGGER_IMAGE_UPLOAD'}, '*')" style="position:absolute; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; cursor:pointer; color:white; backdrop-filter:blur(2px);">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
               </div>
               ` : ''}
        </div>
      `
    : `
        <div style="width:${classicImageSize}px; height:${classicImageSize}px; ${imgStyle} overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.2); border:4px solid white; margin-bottom: 16px; background:#f3f4f6; position:relative;" ${bio.isPreview ? 'onmouseover="this.querySelector(\'.upload-overlay\').style.opacity=\'1\'" onmouseout="this.querySelector(\'.upload-overlay\').style.opacity=\'0\'"' : ''}>
               <img loading="lazy" src="${profileImageSrc}" onerror="this.src='${joinBaseUrl(baseUrl, '/base-img/card_base_image.png')}'" alt="${escapeHtml(displayName)}" style="width:100%; height:100%; object-fit:cover;" />
               ${bio.isPreview ? `
               <div class="upload-overlay" onclick="window.parent.postMessage({type: 'TRIGGER_IMAGE_UPLOAD'}, '*')" style="position:absolute; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; cursor:pointer; color:white; backdrop-filter:blur(2px);">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
               </div>
               ` : ''}
        </div>
      `
  ) : '';

  const titleHtml = (titleStyle === 'logo' && titleLogoSrc)
    ? `
        <div style="display:flex; justify-content:center; align-items:center; margin:0 0 8px 0;">
          <img loading="lazy" src="${titleLogoSrc}" onerror="this.style.display='none'" alt="${escapeHtml(displayName)}" style="max-width:180px; max-height:64px; object-fit:contain;" />
        </div>
      `
    : `
        <h1 style="font-size:28px; font-weight:800; color:${usernameColor}; margin:0 0 4px 0; text-align:center; letter-spacing:-0.5px; line-height:1.2;">
            ${escapeHtml(displayName)}
            ${bio.verified ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-verified-badge="true" title="Portyo.me verificou a autenticidade desta página e confirmou que ela e seu dono são condizentes" aria-label="Portyo.me verificou a autenticidade desta página e confirmou que ela e seu dono são condizentes" style="display:inline-block; vertical-align:middle; margin-left:2px;"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74Z" fill="#3b82f6"/><path d="m9 12 2 2 4-4" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
        </h1>
      `;

  const socialIcons: Record<string, string> = {
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    tiktok: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>',
    twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    email: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    website: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    github: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    threads: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.228 1.33-2.929.812-.616 1.904-.942 3.07-1.017.88-.057 1.762.01 2.626.163-.1-.574-.303-1.033-.607-1.366-.455-.498-1.174-.755-2.14-.768h-.041c-.776 0-1.745.218-2.446.82l-1.285-1.607c1.065-.853 2.402-1.307 3.731-1.33h.058c1.4.018 2.543.465 3.394 1.331.755.77 1.222 1.823 1.395 3.132.573.116 1.1.278 1.572.49 1.26.567 2.203 1.46 2.727 2.585.795 1.707.861 4.486-1.254 6.56-1.799 1.765-4.014 2.553-7.164 2.58zM9.982 15.124c.044.807.424 1.29.997 1.66.638.414 1.427.588 2.242.547 1.074-.058 1.9-.45 2.455-1.14.364-.454.64-1.048.82-1.797a10.4 10.4 0 0 0-2.32-.282c-.848.015-1.553.19-2.04.507-.414.268-.648.622-.672 1.018a.858.858 0 0 0 .018.178z"/></svg>',
    twitch: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>',
    discord: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>',
    pinterest: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>',
    snapchat: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.989-.217.15-.045.313-.09.46-.12.12-.016.24-.016.36-.06.36 0 .66.12.899.36.18.18.3.42.3.66 0 .12-.044.27-.09.39-.45.54-1.17.63-1.83.72-.18.03-.36.06-.54.12-.27.06-.45.18-.57.39-.12.21-.12.45-.06.66.3.93.9 1.95 1.68 2.7.27.27.6.48.93.63.45.225.78.375.78.69.015.27-.195.555-.39.69-.615.42-1.44.63-2.1.72-.075.015-.135.045-.165.09-.03.06-.045.135-.06.21-.03.135-.06.285-.12.42-.045.12-.15.27-.42.27-.12 0-.27-.015-.45-.06-.42-.09-.87-.18-1.35-.18-.225 0-.45.015-.66.06-.6.135-1.11.585-1.62 1.05-.45.42-.93.855-1.62 1.17-.15.06-.3.09-.48.135-.21.06-.42.09-.63.09-.24 0-.45-.045-.66-.12-.165-.045-.33-.09-.48-.15-.69-.315-1.17-.75-1.62-1.17-.51-.465-.99-.915-1.62-1.05-.21-.045-.45-.06-.66-.06-.48 0-.93.09-1.35.18-.18.03-.33.06-.45.06-.27 0-.375-.15-.42-.27-.045-.135-.09-.285-.12-.42-.015-.075-.03-.15-.06-.21-.03-.048-.09-.075-.165-.09-.66-.09-1.485-.3-2.1-.72-.21-.135-.405-.42-.39-.69 0-.315.33-.465.78-.69.33-.15.66-.36.93-.63.78-.75 1.38-1.77 1.68-2.7.06-.21.06-.45-.06-.66-.12-.21-.3-.33-.57-.39-.18-.06-.36-.09-.54-.12-.66-.09-1.38-.18-1.83-.72-.045-.12-.09-.27-.09-.39 0-.24.12-.48.3-.66.24-.24.54-.36.899-.36.12.044.24.044.36.06.147.03.313.075.46.12.33.1.689.201.989.217.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z"/></svg>',
    whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    telegram: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
    spotify: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    behance: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.609.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM6.545 10.16c.618 0 1.13-.14 1.53-.436.4-.296.6-.75.6-1.36 0-.345-.06-.625-.19-.84-.13-.216-.3-.384-.52-.506-.22-.12-.47-.2-.75-.244-.28-.04-.56-.06-.84-.06H3.31v3.45h3.235zm.195 5.487c.315 0 .61-.03.89-.09.28-.06.53-.16.75-.3.22-.14.39-.34.52-.59.13-.25.19-.57.19-.96 0-.75-.22-1.29-.66-1.63-.44-.33-1.01-.5-1.73-.5H3.31v4.07h3.43zM15.35 6.3h5.76v1.51h-5.76V6.3zM18.29 20c-.93 0-1.77-.14-2.53-.42-.75-.28-1.4-.68-1.93-1.19-.54-.51-.95-1.12-1.25-1.82-.3-.7-.44-1.47-.44-2.32 0-.85.15-1.63.44-2.33.3-.7.72-1.3 1.25-1.82.54-.51 1.18-.9 1.93-1.19.76-.28 1.6-.43 2.53-.43.93 0 1.77.14 2.53.43.76.29 1.4.68 1.93 1.19.54.52.95 1.12 1.25 1.82.3.7.44 1.48.44 2.33h-8.34c.064.82.35 1.46.87 1.94.52.48 1.18.72 1.99.72.57 0 1.065-.15 1.49-.47.42-.31.72-.7.9-1.16h2.66c-.19.66-.48 1.26-.9 1.78-.42.53-.91.97-1.49 1.34-.57.37-1.21.64-1.91.83-.69.19-1.4.28-2.12.28zM20.6 13.1c-.06-.37-.18-.7-.37-1.01-.19-.3-.42-.56-.7-.77-.28-.21-.6-.37-.95-.49-.35-.12-.73-.18-1.14-.18-.41 0-.78.06-1.13.17-.35.11-.66.28-.93.5s-.5.48-.67.79c-.17.31-.28.66-.33 1.03h6.22v-.04z"/></svg>',
    dribbble: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.81zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.29zm10.335 3.483c-.218.29-1.91 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>'
  };

  const socialLinksHtml = Object.entries(socials)
    .filter(([key, value]) => value && socialIcons[key])
    .map(([key, value]) => {
      let url = normalizeSocialProfileUrl(key, String(value));
      
      if (!isValidUrl(url)) url = '#';
      
      const colorMap: Record<string, string> = {
        instagram: '#E4405F',
        tiktok: '#000000',
        twitter: '#000000',
        youtube: '#FF0000',
        linkedin: '#0A66C2',
        email: '#EA4335',
        website: '#2563EB',
        github: '#111827',
        facebook: '#1877F2',
        threads: '#000000',
        twitch: '#9146FF',
        discord: '#5865F2',
        pinterest: '#E60023',
        snapchat: '#FFFC00',
        whatsapp: '#25D366',
        telegram: '#26A5E4',
        spotify: '#1DB954',
        behance: '#1769FF',
        dribbble: '#EA4C89'
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
  const cardBorderColor = bio.cardBorderColor || 'rgba(0,0,0,0.06)';
  const cardBorderWidth = typeof bio.cardBorderWidth === 'number' ? Math.max(0, bio.cardBorderWidth) : 1;
  const cardBorderRadius = typeof bio.cardBorderRadius === 'number' ? Math.max(0, bio.cardBorderRadius) : 24;
  const cardPadding = typeof bio.cardPadding === 'number' ? Math.max(0, bio.cardPadding) : 32;
  const cardPaddingTop = Math.max(10, Math.round(cardPadding * 0.35));
  const cardShadow = bio.cardShadow || 'lg';

  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
  const withCardOpacity = (color: string, opacityPercent: number) => {
    const alpha = clamp01(opacityPercent / 100);
    if (!color) return `rgba(255, 255, 255, ${alpha})`;

    const hexMatch = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) {
        hex = hex.split('').map((char) => char + char).join('');
      }
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const rgbMatch = color.trim().match(/^rgba?\(([^)]+)\)$/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map((part) => part.trim());
      if (parts.length >= 3) {
        const r = Number(parts[0]);
        const g = Number(parts[1]);
        const b = Number(parts[2]);
        const currentAlpha = parts.length >= 4 ? Number(parts[3]) : 1;
        const mergedAlpha = clamp01((Number.isFinite(currentAlpha) ? currentAlpha : 1) * alpha);
        if ([r, g, b].every(Number.isFinite)) {
          return `rgba(${r}, ${g}, ${b}, ${mergedAlpha})`;
        }
      }
    }

    return color;
  };

  const getCardShadowCss = (shadow: string) => {
    switch (shadow) {
      case 'none':
        return 'none';
      case 'sm':
        return '0 1px 2px rgba(0,0,0,0.10)';
      case 'md':
        return '0 6px 14px -6px rgba(0,0,0,0.22), 0 2px 6px -2px rgba(0,0,0,0.14)';
      case 'xl':
        return '0 22px 44px -18px rgba(0,0,0,0.40), 0 10px 22px -10px rgba(0,0,0,0.24)';
      case '2xl':
        return '0 28px 60px -24px rgba(0,0,0,0.52), 0 14px 30px -12px rgba(0,0,0,0.28)';
      case 'lg':
      default:
        return '0 14px 30px -12px rgba(0,0,0,0.30), 0 6px 14px -6px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.08)';
    }
  };
  
  let cardCss = '';
  if (cardStyleType !== 'none') {
    cardCss += `background-color: ${withCardOpacity(cardBgColor, cardOpacity)}; `;
    cardCss += `border-radius: ${cardBorderRadius}px; padding: ${cardPaddingTop}px 24px ${cardPadding}px; `;
    cardCss += `box-shadow: ${getCardShadowCss(cardShadow)}; `;
    cardCss += cardBorderWidth > 0
      ? `border: ${cardBorderWidth}px solid ${cardBorderColor}; `
      : 'border: none; ';
    
    if (cardStyleType === 'frosted' || cardStyleType === 'glass') {
        cardCss += `backdrop-filter: blur(${Math.max(cardBlur, 12)}px); -webkit-backdrop-filter: blur(${Math.max(cardBlur, 12)}px); `;
        cardCss += cardBorderWidth > 0
          ? `border: ${cardBorderWidth}px solid ${cardBorderColor}; `
          : `border: 1px solid rgba(255,255,255,0.25); `;
        cardCss += `box-shadow: 0 8px 32px -8px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3); `;
    }
  }

  const subscribeButtonHtml = bio.enableSubscribeButton ? `
        <button type="button" data-open-subscribe onclick="window.openSubscribe()" aria-label="Subscribe" style="position:absolute; top:12px; right:12px; width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.9); border:1px solid rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.1); color:#111827; transition:all 0.2s ease; z-index:20;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
  ` : '';

  const heroHeaderHtml = `
    <div id="profile-header-card" style="width:100%; max-width:${maxWidth}px; margin:0 auto 20px auto; display:flex; flex-direction:column; position:relative; z-index:10;">
        <div style="width:100%; height:${profileImageSize === 'large' ? 380 : 320}px; border-radius:32px; overflow:hidden; box-shadow:0 28px 60px -28px rgba(0,0,0,0.65); background:#0f172a; position:relative;">
          ${subscribeButtonHtml}
          ${displayProfileImage ? `<img loading="lazy" src="${profileImageSrc}" onerror="this.src='${joinBaseUrl(baseUrl, '/base-img/card_base_image.png')}'" alt="${escapeHtml(displayName)}" style="width:100%; height:100%; object-fit:cover;" />` : ''}
          <div style="position:absolute; inset:0; pointer-events:none; background:linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 65%);"></div>
          <div style="position:absolute; bottom:0; left:0; right:0; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; text-align:center; padding:0 20px 28px; gap:8px;">
            ${(titleStyle === 'logo' && titleLogoSrc)
              ? `<img loading="lazy" src="${titleLogoSrc}" onerror="this.style.display='none'" alt="${escapeHtml(displayName)}" style="max-width:220px; max-height:78px; object-fit:contain; filter:drop-shadow(0 6px 16px rgba(0,0,0,0.6));" />`
              : `<div style="font-size:32px; font-weight:900; color:#ffffff; text-shadow:0 6px 18px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3);">${escapeHtml(displayName)}${bio.verified ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-verified-badge="true" title="Portyo.me verificou a autenticidade desta página e confirmou que ela e seu dono são condizentes" aria-label="Portyo.me verificou a autenticidade desta página e confirmou que ela e seu dono são condizentes" style="display:inline-block; vertical-align:middle; margin-left:6px;"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74Z" fill="#3b82f6"/><path d="m9 12 2 2 4-4" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}</div>`}
            <div style="font-size:16px; font-weight:600; color:rgba(255,255,255,0.85); text-shadow:0 2px 8px rgba(0,0,0,0.4);">@${escapeHtml(handle)}</div>
            ${socialLinksHtml ? `<div style="display:flex; justify-content:center; flex-wrap:wrap; gap:10px; margin-top:4px;">${socialLinksHtml}</div>` : ''}
          </div>
        </div>
        ${bio.description ? `<p style="font-size:15px; font-weight:500; color:${usernameColor}; opacity:0.85; margin:20px auto 0; line-height:1.6; text-align:center; max-width:520px; padding:0 20px;">${escapeHtml(bio.description)}</p>` : ''}
    </div>
  `;

  const classicHeaderHtml = `
    <div id="profile-header-card" style="width:100%; max-width:${maxWidth}px; margin:0 auto 20px auto; display:flex; flex-direction:column; align-items:center; position:relative; z-index:10; padding-top:40px;">
        ${subscribeButtonHtml}

        <!-- Profile Image -->
        ${profileImageHtml}

        <!-- Name & Handle -->
        ${titleHtml}
        <div style="font-size:15px; font-weight:600; color:${usernameColor}; opacity:0.6; margin-bottom:16px;">@${escapeHtml(handle)}</div>

        <!-- Description -->
        ${bio.description ? `<p style="font-size:16px; font-weight:500; color:${usernameColor}; opacity:0.8; margin:0 0 24px 0; line-height:1.6; text-align:center; max-width:480px;">${escapeHtml(bio.description)}</p>` : ''}

        <!-- Socials -->
        ${socialLinksHtml ? `<div style="display:flex; justify-content:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">${socialLinksHtml}</div>` : ''}

    </div>
  `;

  const headerHtml = profileImageLayout === 'hero' ? heroHeaderHtml : classicHeaderHtml;

  let bgStyle = 'background:#f8fafc;';
  const bgColor = bio.bgColor || '#f8fafc';
  const bgSecondary = bio.bgSecondaryColor || '#e2e8f0';
  let extraHtml = '';

  if (bio.bgType === 'color') {
    bgStyle = `background:${bgColor};`;
  } else if (bio.bgType === 'image' && bio.bgImage) {
    const fit = bio.bgImageFit || 'contain';
    const repeat = fit === 'repeat';
    bgStyle = `background-image:url('${bio.bgImage}'); background-position:center top; background-size:${repeat ? 'auto' : fit}; background-repeat:${repeat ? 'repeat' : 'no-repeat'}; background-attachment:scroll; background-color:${bgColor};`;
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
        <div id="palm-layer-1" data-parallax-layer data-parallax-speed="0.2" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/background/Design sem nome (4).svg');
          background-size: 600px 600px;
          background-repeat: repeat;
          transform: rotate(15deg) translateZ(0);
          opacity: 0.4;
          z-index: 0;
          pointer-events: none;
        "></div>
        <div id="palm-layer-2" data-parallax-layer data-parallax-speed="0.5" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/background/Design sem nome (5).svg');
          background-size: 500px 500px;
          background-repeat: repeat;
          transform: rotate(-10deg) translateZ(0);
          opacity: 0.6;
          z-index: 1;
          pointer-events: none;
        "></div>
      `;
    } else {
      extraHtml = `
        <div id="palm-layer-1" data-parallax-layer data-parallax-speed="0.2" style="
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
        <div id="palm-layer-2" data-parallax-layer data-parallax-speed="0.5" style="
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
        <div id="wheat-layer-1" data-parallax-layer data-parallax-speed="0.2" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/background/wheat/Design sem nome (7).svg');
          background-size: 600px 600px;
          background-repeat: repeat;
          transform: rotate(15deg) translateZ(0);
          opacity: 0.4;
          z-index: 0;
          pointer-events: none;
        "></div>
        <div id="wheat-layer-2" data-parallax-layer data-parallax-speed="0.5" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/background/wheat/Design sem nome (8).svg');
          background-size: 500px 500px;
          background-repeat: repeat;
          transform: rotate(-10deg) translateZ(0);
          opacity: 0.6;
          z-index: 1;
          pointer-events: none;
        "></div>
      `;
    } else {
      extraHtml = `
        <div id="wheat-layer-1" data-parallax-layer data-parallax-speed="0.2" style="
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
        <div id="wheat-layer-2" data-parallax-layer data-parallax-speed="0.5" style="
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
  } else if (bio.bgType === 'aurora') {
    // Northern lights aurora effect with animation
    bgStyle = `background: linear-gradient(135deg, ${bgColor} 0%, ${bgSecondary} 50%, ${bgColor} 100%);`;
    extraHtml += `
      <div style="position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden;">
        <div style="position:absolute; inset:-50%; background: radial-gradient(ellipse 80% 50% at 50% 120%, ${bgSecondary}80, transparent), radial-gradient(ellipse 60% 40% at 30% 100%, ${bgColor}60, transparent); animation: aurora 15s ease-in-out infinite alternate; will-change:transform;"></div>
      </div>
      <style>@keyframes aurora { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-10%) scale(1.1); } }</style>
    `;
  } else if (bio.bgType === 'mesh-gradient') {
    // Modern mesh gradient with multiple color stops
    bgStyle = `background-color: ${bgColor}; background-image: radial-gradient(at 40% 20%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 80% 0%, ${bgColor} 0px, transparent 50%), radial-gradient(at 0% 50%, ${bgSecondary} 0px, transparent 50%), radial-gradient(at 80% 50%, ${bgColor}80 0px, transparent 50%), radial-gradient(at 0% 100%, ${bgSecondary}80 0px, transparent 50%), radial-gradient(at 80% 100%, ${bgColor} 0px, transparent 50%), radial-gradient(at 0% 0%, ${bgSecondary} 0px, transparent 50%);`;
  } else if (bio.bgType === 'gradient') {
    // Simple linear gradient
    bgStyle = `background: linear-gradient(135deg, ${bgColor} 0%, ${bgSecondary} 100%);`;
  } else if (bio.bgType === 'gradient-animated') {
    // Animated gradient background
    bgStyle = `background: linear-gradient(-45deg, ${bgColor}, ${bgSecondary}, ${bgColor}, ${bgSecondary}); background-size: 400% 400%; animation: gradientMove 15s ease infinite;`;
    extraHtml += `<style>@keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }</style>`;
  } else if (bio.bgType === 'geometric') {
    // Modern geometric pattern
    bgStyle = `background-color: ${bgColor}; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(bgSecondary)}' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");`;
  } else if (bio.bgType === 'bubbles') {
    // Floating bubbles animated effect
    bgStyle = `background-color: ${bgColor};`;
    extraHtml += `
      <div style="position:fixed; inset:0; overflow:hidden; z-index:0; pointer-events:none;">
        ${[...Array(10)].map((_, i) => `<div style="position:absolute; bottom:-100px; left:${10 + i * 9}%; width:${20 + i * 5}px; height:${20 + i * 5}px; background: ${bgSecondary}40; border-radius:50%; animation: floatBubble ${5 + i * 2}s linear infinite; animation-delay:${i * 0.5}s;"></div>`).join('')}
      </div>
      <style>@keyframes floatBubble { 0% { transform: translateY(0) scale(1); opacity: 0.6; } 100% { transform: translateY(-120vh) scale(0.4); opacity: 0; } }</style>
    `;
  } else if (bio.bgType === 'confetti') {
    // Falling confetti effect
    bgStyle = `background-color: ${bgColor};`;
    const colors = [bgSecondary, bgColor, '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'];
    extraHtml += `
      <div style="position:fixed; inset:0; overflow:hidden; z-index:0; pointer-events:none;">
        ${[...Array(30)].map((_, i) => `<div style="position:absolute; top:-20px; left:${Math.random() * 100}%; width:${8 + Math.random() * 8}px; height:${8 + Math.random() * 8}px; background: ${colors[i % colors.length]}; animation: fallConfetti ${3 + Math.random() * 4}s linear infinite; animation-delay:${Math.random() * 5}s; transform: rotate(${Math.random() * 360}deg);"></div>`).join('')}
      </div>
      <style>@keyframes fallConfetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(120vh) rotate(720deg); opacity: 0.3; } }</style>
    `;
  } else if (bio.bgType === 'starfield') {
    // Twinkling starfield effect
    bgStyle = `background: radial-gradient(ellipse at bottom, #1B2838 0%, #090A0F 100%);`;
    extraHtml += `
      <div style="position:fixed; inset:0; overflow:hidden; z-index:0; pointer-events:none;">
        ${[...Array(50)].map((_, i) => `<div style="position:absolute; top:${Math.random() * 100}%; left:${Math.random() * 100}%; width:${1 + Math.random() * 2}px; height:${1 + Math.random() * 2}px; background:white; border-radius:50%; animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite; animation-delay:${Math.random() * 3}s;"></div>`).join('')}
      </div>
      <style>@keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }</style>
    `;
  } else if (bio.bgType === 'rain') {
    // Falling rain effect
    bgStyle = `background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%);`;
    extraHtml += `
      <div style="position:fixed; inset:0; overflow:hidden; z-index:0; pointer-events:none;">
        ${[...Array(40)].map((_, i) => `<div style="position:absolute; top:-20px; left:${Math.random() * 100}%; width:1px; height:${15 + Math.random() * 20}px; background: linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.5)); animation: rainFall ${0.5 + Math.random() * 0.5}s linear infinite; animation-delay:${Math.random() * 2}s;"></div>`).join('')}
      </div>
      <style>@keyframes rainFall { 0% { transform: translateY(0); } 100% { transform: translateY(120vh); } }</style>
    `;
  } else if (bio.bgType === 'particles-float') {
    // Floating particles animation
    bgStyle = `background-color: ${bgColor};`;
    extraHtml += `
      <div style="position:fixed; inset:0; overflow:hidden; z-index:0; pointer-events:none;">
        ${[...Array(20)].map((_, i) => `<div style="position:absolute; top:${Math.random() * 100}%; left:${Math.random() * 100}%; width:${4 + Math.random() * 8}px; height:${4 + Math.random() * 8}px; background: ${bgSecondary}60; border-radius:50%; animation: floatParticle ${8 + Math.random() * 8}s ease-in-out infinite; animation-delay:${Math.random() * 5}s;"></div>`).join('')}
      </div>
      <style>@keyframes floatParticle { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; } 25% { transform: translate(20px, -30px) scale(1.1); opacity: 0.8; } 50% { transform: translate(-20px, -60px) scale(0.9); opacity: 0.6; } 75% { transform: translate(10px, -30px) scale(1.05); opacity: 0.7; } }</style>
    `;
  }

  if (bio.enableParallax && Array.isArray(bio.parallaxLayers) && bio.parallaxLayers.length > 0) {
    const layersHtml = bio.parallaxLayers.map((layer: any, index: number) => {
      const id = layer.id || `layer-${index}`;
      const image = layer.image || '';
      const speed = typeof layer.speed === 'number' ? layer.speed : 0.2;
      const axis = layer.axis || 'y';
      const opacity = typeof layer.opacity === 'number' ? layer.opacity : 0.6;
      const size = typeof layer.size === 'number' ? layer.size : 600;
      const repeat = layer.repeat !== false;
      const rotate = typeof layer.rotate === 'number' ? layer.rotate : 0;
      const blur = typeof layer.blur === 'number' ? layer.blur : 0;
      const zIndex = typeof layer.zIndex === 'number' ? layer.zIndex : 1;
      const posX = typeof layer.positionX === 'number' ? layer.positionX : 0;
      const posY = typeof layer.positionY === 'number' ? layer.positionY : 0;

      if (!image) return '';

      return `
        <div id="parallax-${id}" data-parallax-layer data-parallax-speed="${speed}" data-parallax-axis="${axis}" style="
          position: fixed;
          top: ${posY}px;
          left: ${posX}px;
          width: ${repeat ? '200%' : size + 'px'};
          height: ${repeat ? '200%' : size + 'px'};
          background-image: url('${image}');
          background-size: ${repeat ? size + 'px ' + size + 'px' : 'contain'};
          background-repeat: ${repeat ? 'repeat' : 'no-repeat'};
          background-position: center;
          transform: rotate(${rotate}deg) translateZ(0);
          opacity: ${opacity};
          z-index: ${zIndex};
          pointer-events: none;
          filter: blur(${blur}px);
          will-change: transform;
        "></div>
      `;
    }).join('');

    if (layersHtml.trim()) {
      extraHtml += `
        <div id="parallax-layers" style="position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden;">
          ${layersHtml}
        </div>
      `;
    }
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

  const backgroundHtml = `${videoBgHtml}${extraHtml}`;

  const effectsScript = (bio.enableParallax || bio.floatingElements) ? `
    <script>
      (function() {
        try {
          const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (prefersReducedMotion) return;

          const enableParallax = ${bio.enableParallax ? 'true' : 'false'};
          const intensity = ${typeof bio.parallaxIntensity === 'number' ? bio.parallaxIntensity : 50} / 100;
          const depth = ${typeof bio.parallaxDepth === 'number' ? bio.parallaxDepth : 50} / 100;
          const defaultAxis = '${bio.parallaxAxis || 'y'}';

          const bgEl = document.getElementById('portyo-bg');
          let bgBaseX = '50%';
          let bgBaseY = '0px';
          if (bgEl) {
            const style = window.getComputedStyle(bgEl);
            const pos = (style.backgroundPosition || '50% 0px').split(' ');
            bgBaseX = pos[0] || '50%';
            bgBaseY = pos[1] || '0px';
          }

          const layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax-layer]'));
          layers.forEach(function(layer) {
            if (!layer.dataset.parallaxBase) {
              layer.dataset.parallaxBase = layer.style.transform || '';
            }
          });

          function applyParallax() {
            const scrolled = window.scrollY || 0;
            if (enableParallax && bgEl) {
              const delta = scrolled * 0.25 * intensity * (0.4 + depth);
              const x = (defaultAxis === 'x' || defaultAxis === 'xy') ? delta : 0;
              const y = (defaultAxis === 'y' || defaultAxis === 'xy') ? delta : 0;
              bgEl.style.backgroundPosition = 'calc(' + bgBaseX + ' + ' + x.toFixed(2) + 'px) calc(' + bgBaseY + ' + ' + y.toFixed(2) + 'px)';
            }
            layers.forEach(function(layer) {
              const base = layer.dataset.parallaxBase || '';
              const speed = parseFloat(layer.dataset.parallaxSpeed || '0.2');
              const axis = layer.dataset.parallaxAxis || defaultAxis;
              const delta = scrolled * speed * intensity * (0.4 + depth);
              const x = (axis === 'x' || axis === 'xy') ? delta : 0;
              const y = (axis === 'y' || axis === 'xy') ? delta : 0;
              layer.style.transform = base + ' translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
            });
          }

          if (enableParallax && (layers.length || bgEl)) {
            applyParallax();
            window.addEventListener('scroll', applyParallax, { passive: true });
          }

          const floatingEnabled = ${bio.floatingElements ? 'true' : 'false'};
          if (floatingEnabled) {
            const density = Math.max(4, Math.min(40, ${typeof bio.floatingElementsDensity === 'number' ? bio.floatingElementsDensity : 12}));
            const size = Math.max(8, Math.min(80, ${typeof bio.floatingElementsSize === 'number' ? bio.floatingElementsSize : 24}));
            const speed = Math.max(4, Math.min(40, ${typeof bio.floatingElementsSpeed === 'number' ? bio.floatingElementsSpeed : 12}));
            const opacity = Math.max(0.05, Math.min(0.9, ${typeof bio.floatingElementsOpacity === 'number' ? bio.floatingElementsOpacity : 0.35}));
            const blur = Math.max(0, Math.min(20, ${typeof bio.floatingElementsBlur === 'number' ? bio.floatingElementsBlur : 0}));
            const particleType = '${bio.floatingElementsType || 'circles'}';
            const particleColor = '${bio.floatingElementsColor || '#ffffff'}';

            // SVG/Emoji definitions for each particle type
            const particleShapes = {
              hearts: function(color, size) {
                return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + color + '"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
              },
              fire: function(color, size) {
                return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + color + '"><path d="M12 23c-4.97 0-9-3.58-9-8 0-3.04 1.54-5.43 3.5-6.5C6.5 5.5 8 2 12 2c0 4 3 6 4.5 7.5.71.71 1.5 1.79 1.5 3 0 1.38-.88 2.63-2.22 3.33C17.68 16.8 18.5 17.57 18.5 19c0 2.21-2.69 4-6.5 4z"/></svg>';
              },
              stars: function(color, size) {
                return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + color + '"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
              },
              sparkles: function(color, size) {
                return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + color + '"><path d="M9.5 2l1.5 4.5L15.5 8l-4.5 1.5L9.5 14l-1.5-4.5L3.5 8l4.5-1.5L9.5 2zM19 11l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/></svg>';
              },
              music: function(color, size) {
                return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + color + '"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
              },
              leaves: function(color, size) {
                return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + color + '"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>';
              },
              snow: function(color, size) {
                return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + color + '"><circle cx="12" cy="12" r="4"/></svg>';
              },
              bubbles: function(color, size) {
                return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ' + color + ' 70%);"></div>';
              },
              confetti: function(color, size) {
                var colors = [color, '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#a78bfa'];
                var c = colors[Math.floor(Math.random() * colors.length)];
                var shapes = ['50%', '4px', '0'];
                var r = shapes[Math.floor(Math.random() * shapes.length)];
                return '<div style="width:' + size + 'px;height:' + (size * 0.4) + 'px;background:' + c + ';border-radius:' + r + ';transform:rotate(' + (Math.random() * 360) + 'deg);"></div>';
              },
              diamonds: function(color, size) {
                return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + color + '"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>';
              },
              petals: function(color, size) {
                return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + color + '"><ellipse cx="12" cy="8" rx="4" ry="8" transform="rotate(45 12 12)"/></svg>';
              },
              circles: function(color, size) {
                return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';"></div>';
              }
            };

            if (!document.getElementById('portyo-floating-style')) {
              const style = document.createElement('style');
              style.id = 'portyo-floating-style';
              style.textContent = '\
                @keyframes portyoFloatUp {\n\
                  0% { transform: translate3d(0,0,0) scale(1) rotate(0deg); opacity: 0; }\n\
                  10% { opacity: var(--float-opacity, 0.35); }\n\
                  90% { opacity: var(--float-opacity, 0.35); }\n\
                  100% { transform: translate3d(var(--float-drift, 20px),-140vh,0) scale(0.6) rotate(var(--float-rotate, 180deg)); opacity: 0; }\n\
                }\n\
                .portyo-floating-item {\n\
                  position: absolute;\n\
                  filter: blur(var(--float-blur, 0px));\n\
                  animation: portyoFloatUp var(--float-speed, 12s) linear infinite;\n\
                  will-change: transform, opacity;\n\
                  display: flex;\n\
                  align-items: center;\n\
                  justify-content: center;\n\
                }\n\
              ';
              document.head.appendChild(style);
            }

            if (!document.getElementById('portyo-floating-elements')) {
              const container = document.createElement('div');
              container.id = 'portyo-floating-elements';
              container.style.position = 'fixed';
              container.style.inset = '0';
              container.style.overflow = 'hidden';
              container.style.pointerEvents = 'none';
              container.style.zIndex = '2';

              const getShape = particleShapes[particleType] || particleShapes.circles;

              for (let i = 0; i < density; i += 1) {
                const item = document.createElement('div');
                const itemSize = size * (0.6 + Math.random() * 0.9);
                const left = Math.random() * 100;
                const delay = -(Math.random() * speed);
                const itemSpeed = speed * (0.8 + Math.random() * 0.8);
                const drift = (Math.random() - 0.5) * 100;
                const rotate = Math.random() * 360;

                item.className = 'portyo-floating-item';
                item.style.left = left + '%';
                item.style.bottom = (-itemSize - Math.random() * 200) + 'px';
                item.style.animationDelay = delay + 's';
                item.style.setProperty('--float-speed', itemSpeed + 's');
                item.style.setProperty('--float-opacity', String(opacity));
                item.style.setProperty('--float-blur', blur + 'px');
                item.style.setProperty('--float-drift', drift + 'px');
                item.style.setProperty('--float-rotate', rotate + 'deg');
                item.innerHTML = getShape(particleColor, itemSize);
                container.appendChild(item);
              }

              document.body.appendChild(container);
            }
          }
        } catch (e) {
          console.warn('Effects failed', e);
        }
      })();
    </script>
  ` : '';


  const containerStyle = `max-width:${maxWidth}px; margin:0 auto; padding:16px; position:relative; z-index:1; font-family:${fontFamily};`;




  // Tab Bar Logic
  const experienceBlocks = blocks.filter(b => b.type === 'experience');
  const otherBlocks = blocks.filter(b => b.type !== 'experience');
  
  const hasExperience = experienceBlocks.length > 0;
  const showTabs = hasProducts || hasBlog || hasExperience;
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
        ${hasExperience ? `
        <button id="tab-experience" onclick="window.switchTab('experience')" style="background:none; border:none; padding:8px 12px; font-size:15px; font-weight:700; color:${navInactive}; opacity:0.85; cursor:pointer; position:relative; transition:opacity 0.2s;">
            CV
            <span style="position:absolute; bottom:-17px; left:0; right:0; height:3px; background:transparent; border-radius:3px 3px 0 0; transition:background 0.2s;"></span>
        </button>` : ''}
    </div>
  ` : '';

  const footerHtml = `
    <div style="margin-top:28px; padding:16px 0 8px; text-align:center; font-size:12px; color:rgba(15,23,42,0.45);">
      <div style="display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap;">
        <a href="${joinBaseUrl(baseUrl, '/')}" style="text-decoration:none; color:inherit;">Home</a>
        <span style="opacity:0.4;">•</span>
        <a href="${joinBaseUrl(baseUrl, '/privacy-policy')}" style="text-decoration:none; color:inherit;">Privacy Policy</a>
        <span style="opacity:0.4;">•</span>
        <a href="${joinBaseUrl(baseUrl, '/terms-of-service')}" style="text-decoration:none; color:inherit;">Terms of Service</a>
      </div>
      <button type="button" onclick="window.location.href='mailto:support@portyo.me?subject=Denunciar%20bio&body=${encodeURIComponent(`Link da bio: ${shareUrl}`)}'" style="margin-top:12px; border:1px solid rgba(15,23,42,0.15); background:transparent; color:rgba(15,23,42,0.55); font-size:12px; padding:6px 12px; border-radius:999px; cursor:pointer;">Denunciar bio</button>
    </div>
  `;

  return `${fontLink}<div id="portyo-bg" data-bg-type="${bio.bgType || 'color'}" style="${bgStyle} min-height:100vh; font-family: ${fontFamily}; position:relative;">
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
        background: rgba(255,255,255,0.95);
        border: 1px solid rgba(0,0,0,0.08);
        box-shadow: 0 8px 32px -8px rgba(0,0,0,0.2), 0 4px 16px -4px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08);
        transform: translateZ(0);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      .portyo-card::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.15);
      }
      .portyo-card:hover {
        box-shadow: 0 16px 48px -12px rgba(0,0,0,0.25), 0 8px 24px -6px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1);
        transform: translateY(-4px);
        border-color: rgba(0,0,0,0.12);
      }

      /* Smooth zoom on hover */
      .portyo-card-media {
        transition: transform 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        will-change: transform;
      }
      .portyo-card:hover .portyo-card-media {
        transform: scale(1.08);
      }

      /* Softer text rendering over images */
      .portyo-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0) 80%);
      }

      /* Icon pill */
      .portyo-icon-pill {
        width: 40px;
        height: 40px;
        border-radius: 9999px;
        background: #ffffff;
        border: 1px solid rgba(0,0,0,0.06);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px -6px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
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
    ${backgroundHtml}
    ${effectsScript}

    <main id="profile-container" style="${containerStyle} ${cardCss} position:relative; z-index:10;">
      ${headerHtml}
      ${tabsHtml}
      
      <div id="links-feed" style="position:relative; z-index:20; display:block; animation:fadeIn 0.3s ease-out;">
        ${otherBlocks.map(b => blockToHtml(b, bio, extraData)).join("")}
      </div>

      <div id="experience-feed" style="display:none; animation:fadeIn 0.3s ease-out;">
        ${experienceBlocks.map(b => blockToHtml(b, bio, extraData)).join("")}
      </div>

      <div id="shop-feed" style="display:none; animation:fadeIn 0.3s ease-out;">
        <div id="shop-products-container" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:16px;">
          <div style="grid-column: 1/-1; text-align:center; padding:40px; color:#6b7280;">Carregando produtos...</div>
        </div>
      </div>

      <div id="blog-feed" style="display:none; animation:fadeIn 0.3s ease-out;">
        <div id="blog-posts-container" style="display:flex; flex-direction:column; gap:16px;">
          <div style="text-align:center; padding:40px; color:#6b7280;">Carregando posts...</div>
        </div>
      </div>

      ${footerHtml}


    </main>
    <div id="nsfw-modal" style="display:none; position:fixed; inset:0; z-index:60; align-items:center; justify-content:center; background:rgba(15, 23, 42, 0.75); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);">
      <div style="width:100%; max-width:420px; margin:16px; background:#ffffff; border-radius:20px; border:1px solid rgba(0,0,0,0.1); box-shadow:0 32px 64px -24px rgba(15,23,42,0.55), 0 16px 32px -16px rgba(15,23,42,0.35), 0 0 0 1px rgba(255,255,255,0.1); overflow:hidden;">
        <div style="padding:22px 22px 10px 22px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:9999px; display:flex; align-items:center; justify-content:center; background:rgba(15, 23, 42, 0.08); color:#111827; font-weight:800; font-size:12px;">18+</div>
            <div style="font-weight:700; font-size:16px; color:#0f172a;">Conteúdo sensível</div>
          </div>
          <button onclick="window.closeNsfw()" aria-label="Fechar" style="border:none; background:rgba(15,23,42,0.06); color:#111827; width:32px; height:32px; border-radius:9999px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="padding:0 22px 18px 22px; color:#475569; font-size:14px; line-height:1.55;">
          Este link pode conter conteúdo para maiores de 18 anos. Deseja continuar?
        </div>
        <div style="display:flex; gap:10px; padding:0 22px 22px 22px;">
          <button onclick="window.closeNsfw()" style="flex:1; height:44px; border-radius:12px; border:1px solid rgba(15,23,42,0.12); background:#ffffff; color:#111827; font-weight:600; cursor:pointer; transition:all 0.2s;">Voltar</button>
          <button onclick="window.confirmNsfw()" style="flex:1; height:44px; border-radius:12px; border:none; background:linear-gradient(135deg, #111827, #1f2937); color:#ffffff; font-weight:700; cursor:pointer; box-shadow:0 12px 22px -12px rgba(15,23,42,0.5); transition:all 0.2s;">Continuar</button>
        </div>
      </div>
    </div>
    <div id="share-modal" style="display:none; position:fixed; inset:0; z-index:50; align-items:center; justify-content:center; background:rgba(15, 23, 42, 0.75); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);">
      <div style="background:#ffffff; border-radius:24px; box-shadow:0 32px 64px -24px rgba(0,0,0,0.4), 0 16px 32px -16px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1); border:1px solid rgba(0,0,0,0.08); width:100%; max-width:448px; overflow:hidden; margin:16px; animation:zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
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
                <div style="width:48px; height:48px; border-radius:9999px; background:#ffffff; border:1px solid rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; color:#374151; box-shadow:0 4px 12px -2px rgba(0,0,0,0.08);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">Copy link</span>
              </button>

              <a id="share-twitter" href="https://twitter.com/intent/tweet?url=${encodedShareUrl}" target="_blank" aria-label="Share on X (Twitter)" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#000000; border:1px solid rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 4px 12px -2px rgba(0,0,0,0.2);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">X</span>
              </a>

              <a id="share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}" target="_blank" aria-label="Share on Facebook" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#2563eb; border:1px solid rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 4px 12px -2px rgba(37, 99, 235, 0.3);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">Facebook</span>
              </a>

              <a id="share-whatsapp" href="https://api.whatsapp.com/send?text=${encodedShareUrl}" target="_blank" aria-label="Share on WhatsApp" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#22c55e; border:1px solid rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 4px 12px -2px rgba(34, 197, 94, 0.3);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                </div>
                <span style="font-size:12px; font-weight:500; color:#4b5563;">WhatsApp</span>
              </a>

              <a id="share-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}" target="_blank" aria-label="Share on LinkedIn" style="display:flex; flex-direction:column; align-items:center; gap:8px; min-width:64px; text-decoration:none;">
                <div style="width:48px; height:48px; border-radius:9999px; background:#1d4ed8; border:1px solid rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 4px 12px -2px rgba(29, 78, 216, 0.3);">
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

    <div id="subscribe-modal" style="display:none; position:fixed; inset:0; z-index:50; align-items:center; justify-content:center; background:rgba(15, 23, 42, 0.75); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);">
      <div style="background:#ffffff; border-radius:24px; padding:28px; width:100%; max-width:400px; margin:16px; box-shadow:0 32px 64px -24px rgba(0,0,0,0.4), 0 16px 32px -16px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1); border:1px solid rgba(0,0,0,0.08); position:relative; animation:zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
        <button onclick="window.closeSubscribe()" aria-label="Close subscribe modal" style="position:absolute; top:16px; right:16px; background:rgba(0,0,0,0.05); border:none; cursor:pointer; color:#6b7280; padding:8px; border-radius:9999px; display:flex; transition:all 200ms ease;" onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.05)'">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        
        <h3 style="font-size:22px; font-weight:900; color:#111827; margin:0 0 8px 0; letter-spacing:-0.5px;">Join the list</h3>
        <p style="font-size:14px; color:#6b7280; margin:0 0 24px 0; font-weight:500;">Get the latest updates delivered to your inbox.</p>
        
        <form id="subscribe-form" onsubmit="window.submitSubscribe(event)" style="width:100%; display:flex; align-items:stretch; gap:0;">
          <div style="display:flex; align-items:center; gap:8px; padding:6px; width:100%; background:#ffffff; border:1px solid rgba(0,0,0,0.1); border-radius:16px; box-shadow:0 4px 12px -2px rgba(0,0,0,0.08), inset 0 2px 4px rgba(0,0,0,0.02);">
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

      window._nsfwUrl = '';
      window._nsfwTarget = '_blank';
      window.openNsfw = function(url, target) {
        window._nsfwUrl = url || '';
        window._nsfwTarget = target || '_blank';
        const modal = document.getElementById('nsfw-modal');
        if (modal) modal.style.display = 'flex';
      };
      window.closeNsfw = function() {
        const modal = document.getElementById('nsfw-modal');
        if (modal) modal.style.display = 'none';
        window._nsfwUrl = '';
        window._nsfwTarget = '_blank';
      };
      window.confirmNsfw = function() {
        const url = window._nsfwUrl;
        const target = window._nsfwTarget || '_blank';
        window.closeNsfw();
        if (!url) return;
        if (target === '_self') {
          window.location.href = url;
        } else {
          window.open(url, '_blank');
        }
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

      // NSFW link interception
      document.addEventListener('click', function(e) {
        const target = e.target;
        if (!target || !(target.closest)) return;
        const el = target.closest('[data-nsfw="true"]');
        if (!el) return;
        e.preventDefault();
        e.stopPropagation();
        const url = el.getAttribute('data-nsfw-url');
        const t = el.getAttribute('data-nsfw-target') || '_blank';
        if (url) {
          window.openNsfw(url, t);
        }
      }, true);
      
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
        const experienceTab = document.getElementById('tab-experience');
        
        const linksFeed = document.getElementById('links-feed');
        const shopFeed = document.getElementById('shop-feed');
        const blogFeed = document.getElementById('blog-feed');
        const experienceFeed = document.getElementById('experience-feed');
        
        // Reset all
        [linksTab, shopTab, blogTab, experienceTab].forEach(t => {
          if(t) {
            t.style.color = '${navInactive}';
            t.style.opacity = '0.9';
            const indicator = t.querySelector('span');
            if (indicator) indicator.style.background = 'transparent';
          }
        });
        [linksFeed, shopFeed, blogFeed, experienceFeed].forEach(f => {
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
        } else if (tabName === 'experience') {
            if (experienceTab) {
            experienceTab.style.color = '${navTextColor}';
            experienceTab.style.opacity = '1';
            const indicator = experienceTab.querySelector('span');
            if (indicator) indicator.style.background = '${navIndicator}';
            }
            if (experienceFeed) experienceFeed.style.display = 'block';
            
            if (window.location.pathname !== '/experience') {
                window.history.pushState({ tab: 'experience' }, '', '/experience');
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
                    <div class="blog-card-item" data-index="\${index}" onclick="(function(){ window.location.href='/blog/post/\${post.slug || post.id}'; })()" style="
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
      } else if (window.location.pathname === '/experience') {
        window.switchTab('experience');
      }

      // Load Forms
      if (window.loadForms) window.loadForms();

    </script>

  </div>`;
};
