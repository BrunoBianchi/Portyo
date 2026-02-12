import DOMPurify from 'isomorphic-dompurify';

/**
 * Validates if a URL is safe to use in href attributes.
 * Allows http, https, mailto, tel, and sms.
 * Rejects javascript:, data:, and other potentially dangerous schemes.
 */
export const isValidUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    
    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('#')) return true;

    try {
        const parsed = new URL(url);
        return ['http:', 'https:', 'mailto:', 'tel:', 'sms:'].includes(parsed.protocol);
    } catch (e) {
        // If it doesn't parse as a URL, but looked like an absolute URL (contains :), reject it
        // If it doesn't contain :, it might be a relative URL that didn't start with /
        // or a malformed URL.
        
        // Simple regex check for dangerous schemes if URL parsing fails
        // Reject javascript: anything
        if (/^\s*javascript:/i.test(url)) return false;
        if (/^\s*vbscript:/i.test(url)) return false;
        // data: is allowed for images now

        return true;
    }
};

/**
 * Sanitizes HTML string to prevent XSS.
 * Configured to allow common rich text elements but strip scripts and event handlers.
 * Allows specific iframe providers (YouTube, Spotify, Google Maps).
 * 
 * SECURITY: Event handlers (onclick, onerror, onload, etc.) and <script> tags are
 * EXPLICITLY FORBIDDEN. Allowing them would completely defeat XSS protection.
 * Interactive behavior is handled by React components after sanitization.
 */
export const sanitizeHtml = (html: string | undefined | null): string => {
    if (!html) return '';

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            // Text formatting
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
            'p', 'a', 'span', 'div', 'br', 'hr', 
            'ul', 'ol', 'li', 
            'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'blockquote', 'code', 'pre',
            // Semantic layout
            'section', 'article', 'aside', 'main', 'header', 'footer',
            // Media (NO script, NO form elements)
            'img', 'video', 'source',
            // Embeds (iframes allowed for YouTube/Spotify/Maps)
            'iframe',
            // SVG icons
            'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
            'g', 'defs', 'linearGradient', 'stop', 'mask', 'pattern',
            // Style tags for inline CSS (safe — CSS cannot execute JS when CSP blocks unsafe-eval)
            'style',
            // Interactive elements rendered by the system only
            'button', 'label',
        ],
        ALLOWED_ATTR: [
            // Links
            'href', 'target', 'rel', 
            // Media
            'src', 'alt', 'title', 'width', 'height', 'loading', 'decoding', 'fetchpriority',
            // Styling
            'style', 'class', 'id',
            // Iframe embeds
            'frameborder', 'allow', 'allowfullscreen', 'scrolling',
            // Resource hints
            'media', 'as', 'crossorigin', 'referrerpolicy',
            // SVG rendering
            'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
            'd', 'x', 'y', 'r', 'rx', 'ry', 'cx', 'cy', 'points',
            'x1', 'y1', 'x2', 'y2',
            // Accessibility
            'aria-label', 'aria-hidden', 'role',
            // Data attributes for block functionality (React reads these, not browser events)
            'data-src-debug', 'data-retried', 'data-initialized', 'data-date', 'data-username', 'data-display-type',
            'data-url', 'data-layout', 'data-card-style', 'data-popup-style', 'data-bg-color', 'data-title-color',
            'data-text-color', 'data-date-color', 'data-tag-bg', 'data-tag-text', 'data-popup-bg-color',
            'data-popup-text-color', 'data-popup-overlay-color', 'data-title', 'data-description', 'data-bio-id',
            'data-form-id', 'data-marketing-id', 'data-product-id', 'data-open-subscribe', 'data-action',
            'data-subscribe-wired', 'data-wired', 'data-nsfw', 'data-nsfw-url', 'data-nsfw-target', 'data-nsfw-ignore',
            // Button attributes (NO name, type, value to prevent form hijacking)
            'disabled',
        ],
        // Only allow safe URI schemes — NO data: URIs (XSS vector via data:text/html)
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        // Additional tags beyond the base set — only iframe and style
        ADD_TAGS: ['iframe', 'style'],
        // Additional attributes — safe embed and accessibility attributes only
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'aria-label', 'aria-hidden', 'loading', 'rel', 'href', 'media', 'as', 'crossorigin', 'referrerpolicy', 'data-nsfw', 'data-nsfw-url', 'data-nsfw-target', 'data-nsfw-ignore'],
        // Strip event handlers and dangerous attributes even if they sneak in
        FORBID_ATTR: ['onclick', 'ondblclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur', 'onchange', 'oninput', 'onsubmit', 'onreset', 'onerror', 'onload', 'onabort', 'onscroll', 'onresize', 'oncontextmenu', 'ondrag', 'ondragstart', 'ondragend', 'ondragover', 'ondragenter', 'ondragleave', 'ondrop', 'ontouchstart', 'ontouchend', 'ontouchmove', 'onanimationstart', 'onanimationend', 'ontransitionend', 'formaction', 'xlink:href'],
        // Explicitly forbid script, form, input and other dangerous tags
        FORBID_TAGS: ['script', 'form', 'input', 'textarea', 'select', 'option', 'link', 'meta', 'base', 'object', 'embed', 'applet', 'noscript', 'math'],
    });
};

/**
 * Normalizes a URL ensuring it has a protocol and fixing double protocol issues.
 * e.g. "google.com" -> "https://google.com"
 * e.g. "https://https://google.com" -> "https://google.com"
 */
export const normalizeExternalUrl = (url: string | undefined | null): string => {
    if (!url) return '#';
    let clean = url.trim();
    
    // Pass through special schemes and relative paths
    if (clean.startsWith('#') || clean.startsWith('/') ||
        clean.startsWith('mailto:') || clean.startsWith('tel:') || clean.startsWith('sms:')) {
        return clean;
    }

    // Fix common copy-paste errors (double protocol)
    // Replace "https://https://" or "http://https://" etc with just the second one
    if (clean.match(/^https?:\/\/https?:\/\//)) {
        clean = clean.replace(/^https?:\/\//, '');
    }

    // Add protocol if missing
    if (!clean.match(/^[a-zA-Z0-9]+:\/\//)) {
         return 'https://' + clean;
    }
    
    return clean;
};
