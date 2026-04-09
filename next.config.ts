import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.laroma.akbar.works';
const API_URL = process.env.NEXT_PUBLIC_API_URL || `${BACKEND_URL}/api`;

const backendUrl = new URL(BACKEND_URL);
const backendProtocol = backendUrl.protocol.replace(':', '') as 'http' | 'https';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.ngrok-free.app'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: backendProtocol,
        hostname: backendUrl.hostname,
        port: backendUrl.port || undefined,
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
