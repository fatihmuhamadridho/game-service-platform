import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  serverExternalPackages: ['@prisma/orm-mongo'],
  env: {
    APP_VERSION: process.env.npm_package_version,
    BASE_API_URL: process.env.BASE_API_URL,
    FEATURE_SPRINT_2: process.env.FEATURE_SPRINT_2,
  },
};

export default nextConfig;
