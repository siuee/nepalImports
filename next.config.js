/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/sitemap_index.xml',
        destination: '/sitemap.xml',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Content-Type', value: 'application/xml' }],
      },
      {
        source: '/sitemap_index.xml',
        headers: [{ key: 'Content-Type', value: 'application/xml' }],
      },
    ];
  },
};

export default nextConfig;