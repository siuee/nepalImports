/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/sitemap_index.xml',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/xml',
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;