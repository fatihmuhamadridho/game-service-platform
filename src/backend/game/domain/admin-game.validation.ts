import type { AdminGameInput } from './admin-game.service';

const keys = new Set(['name', 'slug', 'serviceSummary', 'artworkKey', 'isActive', 'isPopular', 'sortOrder']);

export function parseAdminGameInput(value: unknown, partial?: false): AdminGameInput | null;
export function parseAdminGameInput(value: unknown, partial: true): Partial<AdminGameInput> | null;
export function parseAdminGameInput(value: unknown, partial = false): Partial<AdminGameInput> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (
    Object.keys(body).some((key) => !keys.has(key)) ||
    (!partial && (typeof body.name !== 'string' || typeof body.slug !== 'string')) ||
    (partial && !Object.keys(body).length)
  )
    return null;
  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 100))
    return null;
  if (
    body.slug !== undefined &&
    (typeof body.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug) || body.slug.length > 100)
  )
    return null;
  if (
    body.serviceSummary !== undefined &&
    body.serviceSummary !== null &&
    (typeof body.serviceSummary !== 'string' || body.serviceSummary.trim().length > 160)
  )
    return null;
  if (
    body.artworkKey !== undefined &&
    body.artworkKey !== null &&
    (typeof body.artworkKey !== 'string' ||
      body.artworkKey.trim().length > 160 ||
      /^https?:\/\//i.test(body.artworkKey))
  )
    return null;
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') return null;
  if (body.isPopular !== undefined && typeof body.isPopular !== 'boolean') return null;
  if (body.sortOrder !== undefined && (!Number.isSafeInteger(body.sortOrder) || (body.sortOrder as number) < 0))
    return null;
  const result: Partial<AdminGameInput> = {
    ...(typeof body.name === 'string' ? { name: body.name.trim() } : {}),
    ...(typeof body.slug === 'string' ? { slug: body.slug } : {}),
    ...(typeof body.serviceSummary === 'string' || body.serviceSummary === null
      ? { serviceSummary: body.serviceSummary }
      : {}),
    ...(typeof body.artworkKey === 'string' || body.artworkKey === null ? { artworkKey: body.artworkKey } : {}),
    ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
    ...(typeof body.isPopular === 'boolean' ? { isPopular: body.isPopular } : {}),
    ...(typeof body.sortOrder === 'number' ? { sortOrder: body.sortOrder } : {}),
  };
  return partial ? result : (result as AdminGameInput);
}
