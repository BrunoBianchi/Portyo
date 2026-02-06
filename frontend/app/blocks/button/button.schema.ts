
export const buttonSchema = {
  text: {
    type: 'text',
    label: 'Button Text',
    default: 'Click Me',
  },
  url: {
    type: 'text',
    label: 'Link URL',
    default: 'https://example.com',
  },
  variant: {
    type: 'select',
    label: 'Style Variant',
    options: ['primary', 'secondary', 'outline', 'ghost'],
    default: 'primary',
  },
  size: {
    type: 'select',
    label: 'Size',
    options: ['sm', 'md', 'lg'],
    default: 'md',
  },
  isFullWidth: {
    type: 'boolean',
    label: 'Full Width',
    default: false,
  }
};
