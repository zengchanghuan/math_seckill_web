/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // API代理配置
  async rewrites() {
    return [
      {
        source: '/api/question-bank/:path*',
        destination: 'http://localhost:8300/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
