import type { CategoryInput, ServiceInput } from './admin-catalog.service';

function object(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function parseCategoryInput(value: unknown, partial = false): CategoryInput | Partial<CategoryInput> | null {
  const body = object(value);
  const keys = ['name', 'slug', 'description', 'isActive'];
  if (
    !body ||
    Object.keys(body).some((key) => !keys.includes(key)) ||
    (!partial && (!('name' in body) || !('slug' in body))) ||
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
    body.description !== undefined &&
    body.description !== null &&
    (typeof body.description !== 'string' || body.description.trim().length > 500)
  )
    return null;
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') return null;
  return body as CategoryInput | Partial<CategoryInput>;
}

export function parseCreateCategoryInput(value: unknown): CategoryInput | null {
  const parsed = parseCategoryInput(value);
  return parsed && 'name' in parsed && 'slug' in parsed ? (parsed as CategoryInput) : null;
}

export function parseServiceInput(value: unknown, partial = false): ServiceInput | Partial<ServiceInput> | null {
  const body = object(value);
  const keys = ['gameId', 'categoryId', 'name', 'priceAmount', 'isCustomPrice', 'estimateText', 'isActive'];
  if (
    !body ||
    Object.keys(body).some((key) => !keys.includes(key)) ||
    (!partial && keys.slice(0, 6).some((key) => !(key in body))) ||
    (partial && !Object.keys(body).length)
  )
    return null;
  if (body.gameId !== undefined && (typeof body.gameId !== 'string' || !body.gameId.trim() || body.gameId.length > 64))
    return null;
  if (
    body.categoryId !== undefined &&
    (typeof body.categoryId !== 'string' || !body.categoryId.trim() || body.categoryId.length > 64)
  )
    return null;
  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 150))
    return null;
  if (
    body.estimateText !== undefined &&
    (typeof body.estimateText !== 'string' || !body.estimateText.trim() || body.estimateText.trim().length > 100)
  )
    return null;
  if (body.isCustomPrice !== undefined && typeof body.isCustomPrice !== 'boolean') return null;
  if (
    body.priceAmount !== undefined &&
    body.priceAmount !== null &&
    (typeof body.priceAmount !== 'number' ||
      !Number.isFinite(body.priceAmount) ||
      body.priceAmount < 0 ||
      !/^\d{1,16}(?:\.\d{1,2})?$/.test(String(body.priceAmount)))
  )
    return null;
  if (
    (body.isCustomPrice === true && (!('priceAmount' in body) || body.priceAmount !== null)) ||
    (body.isCustomPrice === false && (typeof body.priceAmount !== 'number' || body.priceAmount < 0))
  )
    return null;
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') return null;
  return body as ServiceInput | Partial<ServiceInput>;
}

export function parseCreateServiceInput(value: unknown): ServiceInput | null {
  const parsed = parseServiceInput(value);
  return parsed &&
    'gameId' in parsed &&
    'categoryId' in parsed &&
    'name' in parsed &&
    'isCustomPrice' in parsed &&
    'estimateText' in parsed
    ? (parsed as ServiceInput)
    : null;
}
