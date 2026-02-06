/**
 * Text Block Schema
 */

import type { BlockSchema } from '../types';

export const textSchema: BlockSchema = {
  type: 'object',
  title: 'Text',
  description: 'Paragraph text content',
  category: 'basic',
  icon: 'AlignLeft',
  
  properties: {
    content: {
      type: 'string',
      title: 'Text Content',
      default: 'Enter your text here...',
    },
    format: {
      type: 'string',
      title: 'Text Format',
      enum: ['plain', 'markdown', 'html'],
      default: 'plain',
      'ui:widget': 'select',
    },
    // Token overrides
    tokens: {
      type: 'object',
      title: 'Custom Colors',
      properties: {
        '--text-secondary': {
          type: 'string',
          title: 'Text Color',
          format: 'color',
        },
      },
    },
  },
  required: ['content'],
  defaultData: {
    content: 'Enter your text here...',
    format: 'plain',
  },
  uiSchema: {
    content: {
      'ui:widget': 'textarea',
      'ui:rows': 4,
      'ui:autofocus': true,
    },
  },
};
