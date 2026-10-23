export const APP_VERSION = process.env.APP_VERSION;
export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.BASE_API_URL ||
  'http://localhost:8080';
export const FEATURE_SPRINT_2 = process.env.FEATURE_SPRINT_2 === 'true';
export const FEATURE_GOOGLE_AUTH = process.env.FEATURE_GOOGLE_AUTH === 'true';
export const FEATURE_REGISTER = process.env.FEATURE_REGISTER === 'true';
export const FEATURE_PASSWORD_RECOVERY = process.env.FEATURE_PASSWORD_RECOVERY === 'true';
