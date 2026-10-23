import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
  devIndicators: false,
  experimental: { authInterrupts: true },
  serverExternalPackages: ['@prisma/orm-mongo'],
  env: {
    APP_VERSION: process.env.npm_package_version,
    BASE_API_URL: process.env.BASE_API_URL ?? 'http://localhost:8080',
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.BASE_API_URL ?? 'http://localhost:8080',
    FEATURE_SPRINT_2: process.env.FEATURE_SPRINT_2,
    FEATURE_GOOGLE_AUTH: process.env.FEATURE_GOOGLE_AUTH,
    FEATURE_REGISTER: process.env.FEATURE_REGISTER,
    FEATURE_PASSWORD_RECOVERY: process.env.FEATURE_PASSWORD_RECOVERY,
  },
};

export default nextConfig;
