import { CONVERTER_TOOLS } from '@/lib/converters';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://convert.my.id';

/**
 * Automated XML Sitemap Generator (`out/sitemap.xml`).
 * Dynamically maps the root URL and all 100+ converter routes defined in `data/converters.json`
 * at build time for rapid Google Search Console indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  const converterRoutes: MetadataRoute.Sitemap = CONVERTER_TOOLS.map(
    (tool) => ({
      url: `${BASE_URL}/convert/${tool.slug}`,
      lastModified: buildDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  );

  return [
    {
      url: BASE_URL,
      lastModified: buildDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...converterRoutes,
  ];
}
