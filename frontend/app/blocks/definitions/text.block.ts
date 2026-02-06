/**
 * Text Block Definition
 */

import type { BlockDefinition, TextBlockData } from '../types';
import { textSchema } from '../schemas/text.schema';

const escapeHtml = (str: string = '') => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Simple markdown parser
const parseMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
};

export const textDefinition: BlockDefinition<TextBlockData> = {
  type: 'text',
  version: 2,
  schema: textSchema,
  defaultData: {
    content: 'Enter your text here...',
    format: 'plain',
  },
  
  render(data, context) {
    const { tokens } = context;
    const color = tokens['--text-secondary'] || '#475569';
    
    let content = data.content || '';
    
    if (data.format === 'markdown') {
      content = parseMarkdown(content);
    } else if (data.format === 'plain') {
      content = escapeHtml(content).replace(/\n/g, '<br>');
    } else {
      // HTML - already escaped by React, but we need to be careful
      content = content; // Trust the user (in editor) or sanitize separately
    }
    
    const html = `<p style="margin:0;color:${color};line-height:1.7;font-size:16px;font-weight:500;">${content}</p>`;
    
    return {
      html: `<section style="padding:12px 0;">${html}</section>`,
    };
  },
};

export default textDefinition;
