export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME!,
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const;
