import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Existing rewrites
      {
        source: '/dashboard/mensajes',
        destination: '/dashboard/mis-contactos',
      },
      {
        source: '/dashboard/clientes',
        destination: '/dashboard/mis-contactos',
      },
      {
        source: '/dashboard/mis-propiedades',
        destination: '/mis-propiedades',
      },
      {
        source: '/dashboard/planes',
        destination: '/planes',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wasyn-properties-images.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
};

export default nextConfig;
