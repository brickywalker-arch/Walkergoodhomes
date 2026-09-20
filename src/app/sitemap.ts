import type { MetadataRoute } from 'next';
import { PARTNER_LINKS } from '@/data/development';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://walkergoodhomes.co.uk';
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    // Read from the same list the footer renders, so a new partner page is
    // never live-but-unlisted.
    ...PARTNER_LINKS.map((l) => ({
      url: `${base}${l.href}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
