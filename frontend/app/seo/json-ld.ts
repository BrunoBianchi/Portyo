export const generateProfileSchema = (bio: any, url: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": bio.seoTitle || bio.sufix,
      "alternateName": bio.sufix,
      "description": bio.seoDescription,
      "image": bio.ogImage,
      "url": url,
      "sameAs": extractSocialLinks(bio.html)
    }
  };
};

function extractSocialLinks(html: string): string[] {
  const links: string[] = [];
  // Regex to find hrefs for common social media platforms
  const regex = /href="(https:\/\/(www\.)?(instagram|twitter|linkedin|facebook|youtube|tiktok|pinterest)\.com\/[^"]+)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return links;
}
