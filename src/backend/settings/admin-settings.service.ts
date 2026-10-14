import { ObjectId } from 'mongodb';
import { db } from '@prisma/db';
import { getAdminToken, verifyAdminAccessToken } from '@backend/auth/admin-token';

export type SettingsInput = {
  siteName: string;
  siteDescription: string | null;
  contactEmail: string;
  contactWhatsapp: string;
  instagramUrl: string | null;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultCurrency: 'IDR';
  timezone: 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura';
};
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
  instagramUrl: null,
  maintenanceMode: false,
  allowRegistration: true,
  defaultCurrency: 'IDR',
  timezone: 'Asia/Jakarta',
};
type SettingsRow = Awaited<ReturnType<typeof db.orm.platform_settings.all>>[number];
const serialize = (row: SettingsRow): SettingsInput => ({
  siteName: row.site_name,
  siteDescription: row.site_description ?? '',
  contactEmail: row.contact_email,
  contactWhatsapp: row.contact_whatsapp,
  instagramUrl: row.instagram_url,
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

export async function updateAdminSettings(input: SettingsInput, request: Request) {
  const now = new Date();
  const current = await db.orm.platform_settings.where({ singleton_key: 'current' }).first();
  const token = getAdminToken(request);
  const claims = token ? verifyAdminAccessToken(token) : null;
  const patch = {
    site_name: input.siteName.trim(),
    site_description: input.siteDescription?.trim() || null,
    contact_email: input.contactEmail.trim().toLowerCase(),
    contact_whatsapp: input.contactWhatsapp.trim(),
    instagram_url: input.instagramUrl?.trim() || null,
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
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail) ||
    typeof body.contactWhatsapp !== 'string' ||
    !/^\+?[1-9]\d{7,14}$/.test(body.contactWhatsapp.replace(/[\s()-]/g, '')) ||
    (body.instagramUrl !== null && typeof body.instagramUrl !== 'string') ||
    (typeof body.instagramUrl === 'string' &&
      (!/^https:\/\//i.test(body.instagramUrl) || body.instagramUrl.length > 255)) ||
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
  return new AdminSettingsError('SETT03001', 'Pengaturan platform sementara tidak tersedia.', 500);
}
