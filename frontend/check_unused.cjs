
const fs = require('fs');
const path = require('path');

const filePath = path.join('app', 'routes', 'dashboard-editor.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const icons = [
  'ArrowLeftIcon',
  'ArrowRightIcon',
  'InstagramIcon',
  'YouTubeIcon',
  'EyeIcon',
  'ShareIcon',
  'ExternalLinkIcon',
  'SearchIcon',
  'ChevronDownIcon',
  'KeyIcon',
  'DotsIcon',
  'TwitterIcon',
  'LinkedInIcon',
  'GitHubIcon',
  'XIcon',
  'ImageIcon',
  'HomeIcon',
  'BellIcon',
  'ChevronLeftIcon',
  'ChevronRightIcon',
  'CopyIcon',
  'LinkIcon',
  'FacebookIcon',
  'WhatsAppIcon',
  'FlagIcon',
  'ArrowRightLongIcon'
];

const unused = icons.filter(icon => {
  // Check if icon is used in the content (excluding the import statement)
  // We can split by import statement or just check if count > 1
  const regex = new RegExp(icon, 'g');
  const matches = content.match(regex);
  return !matches || matches.length <= 1;
});

console.log('Unused icons:', unused);
