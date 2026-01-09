export interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'spacer' | 'socials';
  content?: string;
  style?: Record<string, string | number>;
  url?: string;
  align?: 'left' | 'center' | 'right';
  alt?: string;
}

export interface EmailTemplateConfig {
  backgroundColor: string;
  contentBackgroundColor?: string;
  width: number;
  fontFamily?: string;
}

export const generateEmailHtml = (blocks: EmailBlock[], config: EmailTemplateConfig): string => {
  const { backgroundColor, width, contentBackgroundColor = '#ffffff', fontFamily = 'sans-serif' } = config;

  const getBlockHtml = (block: EmailBlock) => {
    const style = block.style || {};
    const align = block.align || 'left';

    switch (block.type) {
      case 'text':
        return `
          <div style="font-family: ${fontFamily}; padding: ${style.padding || '10px'}; text-align: ${align}; color: ${style.color || '#000000'}; font-size: ${style.fontSize || '16px'}; line-height: ${style.lineHeight || '1.5'};">
            ${block.content || 'Add your text here'}
          </div>
        `;
      case 'image':
        return `
          <div style="padding: ${style.padding || '10px'}; text-align: ${align};">
            <a href="${block.url || '#'}" style="text-decoration: none; pointer-events: ${block.url ? 'auto' : 'none'};">
              <img src="${block.content || 'https://via.placeholder.com/600x200'}" alt="${block.alt || 'Image'}" style="max-width: 100%; width: ${style.width || '100%'}; height: auto; border-radius: ${style.borderRadius || '0px'}; display: inline-block;" />
            </a>
          </div>
        `;
      case 'button':
        const isFullWidth = style.width === '100%';
        return `
          <div style="padding: ${style.padding || '20px'}; text-align: ${align};">
             <table border="0" cellpadding="0" cellspacing="0" width="${isFullWidth ? '100%' : 'auto'}" style="margin: ${align === 'center' ? '0 auto' : '0'};">
               <tr>
                 <td align="center" bgcolor="${style.backgroundColor || '#000000'}" style="border-radius: ${style.borderRadius || '4px'}; border: ${style.borderWidth || '0px'} solid ${style.borderColor || 'transparent'};">
                   <a href="${block.url || '#'}" style="display: block; padding: ${style.vPadding || '12px'} ${style.hPadding || '24px'}; font-family: ${fontFamily}; font-size: ${style.fontSize || '16px'}; font-weight: bold; color: ${style.color || '#ffffff'}; text-decoration: none; width: 100%;">
                     ${block.content || 'Click Me'}
                   </a>
                 </td>
               </tr>
             </table>
          </div>
        `;
      case 'spacer':
        return `
          <div style="height: ${style.height || '20px'}; line-height: ${style.height || '20px'}; font-size: 0;">&nbsp;</div>
        `;
      case 'socials':
        return `
          <div style="padding: ${style.padding || '20px'}; text-align: ${align};">
            <!-- Social icons placeholder -->
            <span style="font-family: ${fontFamily}; color: #888; font-size: 12px;">[Social Links]</span>
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
  <title>Email Template</title>
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
    body { margin: 0; padding: 0; min-width: 100%; }
    table { border-collapse: collapse; border-spacing: 0; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; word-spacing: normal; text-size-adjust: 100%;">
  <div style="background-color: ${backgroundColor};">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <!--[if mso]>
          <table align="center" border="0" cellspacing="0" cellpadding="0" width="${width}">
          <tr>
          <td align="center" valign="top" width="${width}">
          <![endif]-->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${width}px; margin: 0 auto;">
             <!-- Content -->
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
               <td align="center" style="padding: 20px; font-family: ${fontFamily}; color: #888; font-size: 12px;">
                 <p style="margin: 0;">Sent with Portyo</p>
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
