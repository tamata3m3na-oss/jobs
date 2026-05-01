import { MetadataRoute } from 'next';

const locales = ['en', 'ar'];
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartjob.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/jobs', '/login', '/register', '/about', '/contact'];

  const sitemapData: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapData.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  return sitemapData;
}
