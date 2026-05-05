import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/login',
          '/register',
          '/recover-password',
          '/reset-password',
          '/onboarding/',
          '/profile-selector',
        ],
      },
    ],
    sitemap: 'https://tiyuy.com/sitemap.xml',
    host: 'https://tiyuy.com',
  };
}
