import { normalizeSocialProfileUrl } from "~/utils/social-links";

export interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'spacer' | 'divider' | 'heading' | 'social' | 'footer' | 'columns';
  content?: string;
  style?: Record<string, string | number>;
  url?: string;
  align?: 'left' | 'center' | 'right';
  alt?: string;
  // For heading
  level?: 'h1' | 'h2' | 'h3';
  // For social
  socials?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  // For columns
  columns?: EmailBlock[][];
  columnCount?: 2 | 3;
}

export interface EmailTemplateConfig {
  backgroundColor: string;
  contentBackgroundColor?: string;
  width: number;
  fontFamily?: string;
  borderRadius?: number;
  contentPadding?: number;
}

const socialIcons: Record<string, { icon: string; color: string }> = {
  instagram: { icon: '📷', color: '#E4405F' },
  twitter: { icon: '𝕏', color: '#000000' },
  linkedin: { icon: '💼', color: '#0A66C2' },
  facebook: { icon: 'f', color: '#1877F2' },
  youtube: { icon: '▶', color: '#FF0000' },
  tiktok: { icon: '♪', color: '#000000' },
};

export const generateEmailHtml = (blocks: EmailBlock[], config: EmailTemplateConfig): string => {
  const { 
    backgroundColor, 
    width, 
    contentBackgroundColor = '#ffffff', 
    fontFamily = 'Arial, sans-serif',
    borderRadius = 0,
    contentPadding = 0
  } = config;

  const getBlockHtml = (block: EmailBlock): string => {
    const style = block.style || {};
    const align = block.align || 'left';

    switch (block.type) {
      case 'heading':
        const headingSize = block.level === 'h1' ? '32px' : block.level === 'h2' ? '24px' : '20px';
        return `
          <div style="font-family: ${fontFamily}; padding: ${style.padding || '16px 20px'}; text-align: ${align};">
            <${block.level || 'h1'} style="margin: 0; color: ${style.color || '#000000'}; font-size: ${style.fontSize || headingSize}; font-weight: bold; line-height: 1.3;">
              ${block.content || 'Heading'}
            </${block.level || 'h1'}>
          </div>
        `;

      case 'text':
        return `
          <div style="font-family: ${fontFamily}; padding: ${style.padding || '12px 20px'}; text-align: ${align}; color: ${style.color || '#374151'}; font-size: ${style.fontSize || '16px'}; line-height: ${style.lineHeight || '1.6'};">
            ${block.content || 'Add your text here'}
          </div>
        `;

      case 'image':
        const imgContent = block.url ? 
          `<a href="${block.url}" style="text-decoration: none;"><img src="${block.content || 'https://via.placeholder.com/600x300'}" alt="${block.alt || 'Image'}" style="max-width: 100%; width: ${style.width || '100%'}; height: auto; border-radius: ${style.borderRadius || '0px'}; display: block;" /></a>` :
          `<img src="${block.content || 'https://via.placeholder.com/600x300'}" alt="${block.alt || 'Image'}" style="max-width: 100%; width: ${style.width || '100%'}; height: auto; border-radius: ${style.borderRadius || '0px'}; display: block;" />`;
        return `
          <div style="padding: ${style.padding || '16px 20px'}; text-align: ${align};">
            ${imgContent}
          </div>
        `;

      case 'button':
        const isFullWidth = style.width === '100%';
        return `
          <div style="padding: ${style.padding || '20px'}; text-align: ${align};">
             <table border="0" cellpadding="0" cellspacing="0" width="${isFullWidth ? '100%' : 'auto'}" style="margin: ${align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0'};">
               <tr>
                 <td align="center" bgcolor="${style.backgroundColor || '#000000'}" style="border-radius: ${style.borderRadius || '8px'};">
                   <a href="${block.url || '#'}" style="display: block; padding: ${style.vPadding || '14px'} ${style.hPadding || '28px'}; font-family: ${fontFamily}; font-size: ${style.fontSize || '16px'}; font-weight: 600; color: ${style.color || '#ffffff'}; text-decoration: none; text-align: center;">
                     ${block.content || 'Click Me'}
                   </a>
                 </td>
               </tr>
             </table>
          </div>
        `;

      case 'spacer':
        return `
          <div style="height: ${style.height || '32px'}; line-height: ${style.height || '32px'}; font-size: 0;">&nbsp;</div>
        `;

      case 'divider':
        return `
          <div style="padding: ${style.padding || '20px'};">
            <div style="height: 0; border: none; border-top: ${style.borderWidth || '1px'} ${style.borderStyle || 'solid'} ${style.borderColor || '#e5e7eb'}; margin: 0;"></div>
          </div>
        `;

      case 'social':
        const socialLinks = Object.entries(block.socials || {})
          .filter(([_, url]) => url)
          .map(([platform, url]) => {
            const { color } = socialIcons[platform] || { color: '#000' };
            const normalizedUrl = normalizeSocialProfileUrl(platform, String(url));
            return `
              <a href="${normalizedUrl}" style="display: inline-block; width: 40px; height: 40px; line-height: 40px; text-align: center; background-color: ${style.iconBackground || color}; color: ${style.iconColor || '#ffffff'}; border-radius: ${style.iconRadius || '50%'}; text-decoration: none; margin: 0 6px; font-size: 16px; font-family: ${fontFamily};">
                ${platform.charAt(0).toUpperCase()}
              </a>
            `;
          })
          .join('');
        
        return `
          <div style="padding: ${style.padding || '24px 20px'}; text-align: ${align};">
            ${socialLinks || '<span style="color: #9ca3af; font-size: 14px; font-family: ' + fontFamily + ';">Add social links</span>'}
          </div>
        `;

      case 'footer':
        return `
          <div style="padding: ${style.padding || '32px 20px'}; text-align: center; background-color: ${style.backgroundColor || 'transparent'};">
            <p style="margin: 0 0 8px 0; font-family: ${fontFamily}; font-size: ${style.fontSize || '13px'}; color: ${style.color || '#6b7280'}; line-height: 1.5;">
              ${block.content || 'You received this email because you subscribed to our newsletter.'}
            </p>
            <p style="margin: 0; font-family: ${fontFamily}; font-size: 12px; color: #9ca3af;">
              <a href="{{unsubscribe_link}}" style="color: ${style.linkColor || '#6b7280'}; text-decoration: underline;">Unsubscribe</a>
            </p>
          </div>
        `;

      case 'columns':
        const colCount = block.columnCount || 2;
        const colWidth = Math.floor(100 / colCount);
        const columnsCells = (block.columns || []).map((colBlocks, i) => {
          const colContent = colBlocks.map(b => getBlockHtml(b)).join('');
          return `
            <td style="width: ${colWidth}%; vertical-align: top; padding: 0 8px;">
              ${colContent || '<div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 14px;">Column ${i + 1}</div>'}
            </td>
          `;
        }).join('');

        return `
          <div style="padding: ${style.padding || '16px 12px'};">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                ${columnsCells}
              </tr>
            </table>
          </div>
        `;

      default:
        return '';
    }
  };

  const rowsHtml = blocks.map(block => `
    <tr>
      <td align="center" style="padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${width}px;">
          <tr>
            <td align="left" bgcolor="${contentBackgroundColor}" style="background-color: ${contentBackgroundColor};">
              ${getBlockHtml(block)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; min-width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; border-spacing: 0; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: inherit; }
    @media only screen and (max-width: 600px) {
      .wrapper { width: 100% !important; }
      .mobile-padding { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; word-spacing: normal;">
  <div style="background-color: ${backgroundColor};">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: ${contentPadding ? contentPadding + 'px' : '24px 16px'};">
          <!--[if mso]>
          <table align="center" border="0" cellspacing="0" cellpadding="0" width="${width}">
          <tr>
          <td align="center" valign="top" width="${width}">
          <![endif]-->
          <table class="wrapper" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${width}px; margin: 0 auto; background-color: ${contentBackgroundColor}; border-radius: ${borderRadius}px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
             ${rowsHtml}
          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
          
          <!-- Footer / Branding -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${width}px; margin: 0 auto;">
            <tr>
               <td align="center" style="padding: 24px 20px; font-family: ${fontFamily}; color: #9ca3af; font-size: 12px;">
                 <p style="margin: 0;">Sent with ❤️ via Portyo</p>
               </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
};
