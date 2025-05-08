import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // rewrites: async () => {
  //   return [
  //     {
  //       source: `/api/v1/:path*`, //frontend api url
  //       destination: `${process.env.CHZZK_API_URL}/:path*`,
  //     },
  //     {
  //       source: `/api/streamer/:path*`, //frontend api url
  //       destination: `${process.env.FRONT_API_URL}/:path*`, // 예: https://chit-seven.vercel.app
  //     },
  //   ];
  // },
  webpack: (config) => {
    const fileLoaderRule = config.module.rules.find((rule: any) => rule.test?.test?.('.svg'));

    if (fileLoaderRule) {
      // .svg 파일을 기존 로더에서 제외
      fileLoaderRule.exclude = /\.svg$/i;
    }
    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    );
    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nng-phinf.pstatic.net',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
