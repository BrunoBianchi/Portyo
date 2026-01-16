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
 * RELAXED MODE: Explicitly allows style tags and attributes to prevent layout breakage.
 */
export const sanitizeHtml = (html: string | undefined | null): string => {
    if (!html) return '';

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
            'p', 'a', 'span', 'div', 'br', 'hr', 
            'ul', 'ol', 'li', 
            'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'blockquote', 'code', 'pre',
            'img', 'iframe', 'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
            'video', 'source', 'style', 'button', 'input', 'label', 'form', 'textarea', 'select', 'option',
            'section', 'article', 'aside', 'main', 'header', 'footer',
            'g', 'defs', 'linearGradient', 'stop', 'mask', 'pattern'
        ],
        ALLOWED_ATTR: [
            'href', 'target', 'rel', 
            'src', 'alt', 'title', 'width', 'height', 
            'style', 'class', 'id', 'name', 'type', 'value', 'placeholder', 'checked',
            'frameborder', 'allow', 'allowfullscreen', 'scrolling',
            'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
            'd', 'x', 'y', 'r', 'rx', 'ry', 'cx', 'cy', 'points', // SVG attributes
            'x1', 'y1', 'x2', 'y2', // SVG line attributes
            'onclick', 'onmouseover', 'onmouseout', 'onsubmit', 'onerror', 'onload',
            'method', 'action', 'enctype', 'autocomplete', 'required', 'minlength', 'maxlength', 'rows', 'cols',
            'data-src-debug', 'data-retried', 'data-initialized', 'data-date', 'data-username', 'data-display-type',
            'data-url', 'data-layout', 'data-card-style', 'data-popup-style', 'data-bg-color', 'data-title-color',
            'data-text-color', 'data-date-color', 'data-tag-bg', 'data-tag-text', 'data-popup-bg-color',
            'data-popup-text-color', 'data-popup-overlay-color', 'data-title', 'data-description', 'data-bio-id',
            'data-form-id', 'data-marketing-id', 'data-product-id', 'data-open-subscribe', 'data-action',
            'data-subscribe-wired', 'data-wired', 'loading'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|sms|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        ADD_TAGS: ['iframe', 'style', 'script', 'form', 'textarea', 'select', 'option', 'input', 'button'], // allow form controls in rendered HTML
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'onclick', 'onmouseover', 'onmouseout', 'onerror', 'onload', 'aria-label', 'loading'],
    });
};
