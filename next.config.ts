import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();
const backendUrl = new URL(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://api.laroma.akbar.works');
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
        destination: 'http://api.laroma.akbar.works/api/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
