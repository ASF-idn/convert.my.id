import type { MetadataRoute } from 'next';

/**
 * Automated robots.txt Generator (`out/robots.txt`) for Search Engine Crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://convert.my.id/sitemap.xml',
    host: 'https://convert.my.id',
  };
}
