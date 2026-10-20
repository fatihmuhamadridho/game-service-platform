import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';

export type SettingsInput = {
  siteName: string;
  siteDescription: string | null;
  contactEmail: string;
  contactWhatsapp: string;
  socialLinks: SocialLink[];
  businessHours: string | null;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultCurrency: 'IDR';
  timezone: 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura';
};
export type SocialLink = { label: string; url: string };
export class AdminSettingsError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const defaults: SettingsInput = {
  siteName: 'JokiHub',
  siteDescription: '',
  contactEmail: '',
  contactWhatsapp: '',
  socialLinks: [],
  businessHours: null,
  maintenanceMode: false,
  allowRegistration: true,
  defaultCurrency: 'IDR',
  timezone: 'Asia/Jakarta',
};
type SettingsRow = Awaited<ReturnType<typeof db.orm.platform_settings.all>>[number];
function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const link = item as Record<string, unknown>;
    if (typeof link.label !== 'string' || typeof link.url !== 'string') return [];
    return [{ label: link.label, url: link.url }];
  });
}
function isSocialLink(value: unknown): value is SocialLink {
  if (!value || typeof value !== 'object') return false;
  const link = value as Record<string, unknown>;
  if (typeof link.label !== 'string' || !link.label.trim() || link.label.trim().length > 40) return false;
  if (typeof link.url !== 'string' || link.url.length > 255) return false;
  try {
    return new URL(link.url).protocol === 'https:';
  } catch {
    return false;
  }
}
const serialize = (row: SettingsRow): SettingsInput => ({
  siteName: row.site_name,
  siteDescription: row.site_description ?? '',
  contactEmail: row.contact_email,
  contactWhatsapp: row.contact_whatsapp,
  socialLinks: parseSocialLinks(row.social_links).length
    ? parseSocialLinks(row.social_links)
    : row.instagram_url
      ? [{ label: 'Instagram', url: row.instagram_url }]
      : [],
  businessHours: row.business_hours ?? null,
  maintenanceMode: row.maintenance_mode,
  allowRegistration: row.allow_registration,
  defaultCurrency: row.default_currency as SettingsInput['defaultCurrency'],
  timezone: row.timezone as SettingsInput['timezone'],
});

export async function getAdminSettings() {
  const row = await db.orm.platform_settings.where({ singleton_key: 'current' }).first();
  return {
    settings: row ? serialize(row) : defaults,
    version: row?.version ?? 0,
    updatedAt: row?.updated_at.toISOString() ?? null,
  };
}

export async function getPublicSiteSettings() {
  const { settings } = await getAdminSettings();
  return {
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    contactEmail: settings.contactEmail,
    contactWhatsapp: settings.contactWhatsapp,
    socialLinks: settings.socialLinks,
    businessHours: settings.businessHours,
  };
}

export async function updateAdminSettings(input: SettingsInput, request: Request) {
  const now = new Date();
  const current = await db.orm.platform_settings.where({ singleton_key: 'current' }).first();
  const token = getAdminToken(request);
  const claims = token ? await verifyAdminAccessToken(token) : null;
  const patch = {
    site_name: input.siteName.trim(),
    site_description: input.siteDescription?.trim() || null,
    contact_email: input.contactEmail.trim().toLowerCase(),
    contact_whatsapp: input.contactWhatsapp.trim(),
    instagram_url: input.socialLinks.find((link) => link.label.toLowerCase() === 'instagram')?.url ?? null,
    social_links: input.socialLinks.map((link) => ({ label: link.label.trim(), url: link.url.trim() })),
    business_hours: input.businessHours?.trim() || null,
    maintenance_mode: input.maintenanceMode,
    allow_registration: input.allowRegistration,
    default_currency: input.defaultCurrency,
    timezone: input.timezone,
    version: (current?.version ?? 0) + 1,
    updated_by: claims?.sub ?? null,
    updated_at: now,
  };
  if (current) await db.orm.platform_settings.where({ _id: current._id }).update(patch);
  else
    await db.orm.platform_settings.create({
      _id: new ObjectId().toHexString(),
      singleton_key: 'current',
      ...patch,
      created_at: now,
    });
  try {
    const actor = claims ? await db.orm.admin_account.where({ _id: claims.sub }).first() : null;
    await db.orm.activity_log.create({
      _id: new ObjectId().toHexString(),
      actor_admin_id: actor ? String(actor._id) : null,
      actor_name_snapshot: actor?.name ?? null,
      actor_email_snapshot: actor?.email ?? null,
      action_code: 'SETTINGS_UPDATED',
      action_label: 'Memperbarui pengaturan platform',
      category: 'SETTINGS',
      target_type: 'PLATFORM_SETTINGS',
      target_id: current ? String(current._id) : null,
      target_reference: 'current',
      result: 'SUCCESS',
      failure_code: null,
      reason: null,
      changed_fields: input,
      request_id: request.headers.get('x-request-id'),
      source_ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      user_agent: request.headers.get('user-agent'),
      occurred_at: now,
    });
  } catch {
    /* Audit failures do not undo saved configuration. */
  }
  return getAdminSettings();
}

export function parseSettingsInput(value: unknown): SettingsInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const keys = Object.keys(defaults);
  if (Object.keys(body).some((key) => !keys.includes(key)) || keys.some((key) => !(key in body))) return null;
  if (
    typeof body.siteName !== 'string' ||
    !body.siteName.trim() ||
    body.siteName.trim().length > 100 ||
    (body.siteDescription !== null && typeof body.siteDescription !== 'string') ||
    (typeof body.siteDescription === 'string' && body.siteDescription.length > 500) ||
    typeof body.contactEmail !== 'string' ||
    (body.contactEmail !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)) ||
    typeof body.contactWhatsapp !== 'string' ||
    (body.contactWhatsapp !== '' && !/^\+?[1-9]\d{7,14}$/.test(body.contactWhatsapp.replace(/[\s()-]/g, ''))) ||
    (body.businessHours !== null && typeof body.businessHours !== 'string') ||
    (typeof body.businessHours === 'string' && body.businessHours.length > 160) ||
    !Array.isArray(body.socialLinks) ||
    body.socialLinks.length > 12 ||
    body.socialLinks.some((link) => !isSocialLink(link)) ||
    typeof body.maintenanceMode !== 'boolean' ||
    typeof body.allowRegistration !== 'boolean' ||
    body.defaultCurrency !== 'IDR' ||
    !['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'].includes(String(body.timezone))
  )
    return null;
  return body as SettingsInput;
}

export function toAdminSettingsError(error: unknown) {
  if (error instanceof AdminSettingsError) return error;
  console.error('[AdminSettings] Unexpected settings storage failure.', error);
  return new AdminSettingsError('SETT03001', 'Pengaturan platform sementara tidak tersedia.', 500);
}
