import { db } from '../../../prisma/db';

export type PublicGame = {
  id: string;
  name: string;
  slug: string;
  serviceSummary: string | null;
  artworkKey: string | null;
  serviceCount: number;
  categories: Array<{ name: string; slug: string }>;
  isPopular: boolean;
  sortOrder: number;
};

export async function listPublicGames(
  search = '',
  limit = 20,
  offset = 0,
  categorySlug = '',
  sort: 'POPULAR' | 'NAME_ASC' = 'POPULAR'
) {
  const [rows, categories] = await Promise.all([
    db.orm.game_catalog.where({ is_active: true }).include('services').orderBy({ sort_order: 1 }).all(),
    db.orm.service_category.all(),
  ]);
  const activeCategories = new Map(
    categories
      .filter((category) => category.is_active && !category.deleted_at)
      .map((category) => [String(category._id), category])
  );
  const query = search.trim().toLocaleLowerCase('id-ID');
  const searchGames = rows
    .filter((game) => !game.deleted_at)
    .map((game): PublicGame => ({
      id: String(game._id),
      name: game.name,
      slug: game.slug,
      serviceSummary: game.service_summary,
      artworkKey: game.artwork_key,
      serviceCount: game.services.filter(
        (service) => service.is_active && !service.deleted_at && activeCategories.has(String(service.category_id))
      ).length,
      categories: Array.from(
        new Set(
          game.services
            .filter((service) => service.is_active && !service.deleted_at)
            .map((service) => activeCategories.get(String(service.category_id)))
            .filter((category): category is NonNullable<typeof category> => Boolean(category))
            .map((category) => category.slug)
        )
      ).flatMap((slug) => {
        const category = categories.find((entry) => entry.slug === slug);
        return category ? [{ name: category.name, slug }] : [];
      }),
      isPopular: game.is_popular,
      sortOrder: game.sort_order,
    }))
    .filter((game) => !query || game.name.toLocaleLowerCase('id-ID').includes(query))
    .sort((a, b) =>
      sort === 'NAME_ASC'
        ? a.name.localeCompare(b.name, 'id-ID')
        : Number(b.isPopular) - Number(a.isPopular) ||
          a.sortOrder - b.sortOrder ||
          a.name.localeCompare(b.name, 'id-ID')
    );

  const serviceCategories = new Map<string, { slug: string; name: string; count: number }>();
  for (const game of searchGames) {
    for (const category of game.categories) {
      const current = serviceCategories.get(category.slug) ?? { ...category, count: 0 };
      current.count += 1;
      serviceCategories.set(category.slug, current);
    }
  }
  const games = categorySlug
    ? searchGames.filter((game) => game.categories.some((category) => category.slug === categorySlug))
    : searchGames;
  return {
    games: games.slice(offset, offset + limit),
    total: games.length,
    limit,
    offset,
    filters: {
      serviceCategories: Array.from(serviceCategories.values()).sort((a, b) => a.name.localeCompare(b.name, 'id-ID')),
    },
  };
}

export async function getPublicGameBySlug(slug: string) {
  const game = await db.orm.game_catalog.where({ slug, is_active: true }).first();
  if (!game || game.deleted_at) return null;
  return {
    id: String(game._id),
    name: game.name,
    slug: game.slug,
    serviceSummary: game.service_summary,
    artworkKey: game.artwork_key,
    isPopular: game.is_popular,
    sortOrder: game.sort_order,
  };
}

export async function listPublicServicesByGame(slug: string) {
  const game = await db.orm.game_catalog.where({ slug, is_active: true }).first();
  if (!game || game.deleted_at) return null;
  const services = await db.orm.game_service
    .where({ game_id: game._id, is_active: true })
    .include('category')
    .orderBy({ name: 1 })
    .all();

  return {
    game: { id: String(game._id), name: game.name, slug: game.slug },
    categories: Array.from(
      services
        .filter((service) => service.category.is_active && !service.category.deleted_at && !service.deleted_at)
        .reduce((groups, service) => {
          const key = String(service.category._id);
          const existing = groups.get(key) ?? {
            id: key,
            name: service.category.name,
            slug: service.category.slug,
            services: [] as Array<{
              id: string;
              name: string;
              price: number | null;
              customPrice: boolean;
              estimate: string;
            }>,
          };
          existing.services.push({
            id: String(service._id),
            name: service.name,
            price: service.price_amount === null ? null : Number(service.price_amount.toString()),
            customPrice: service.is_custom_price || service.price_amount === null,
            estimate: service.estimate_text,
          });
          groups.set(key, existing);
          return groups;
        }, new Map<string, { id: string; name: string; slug: string; services: Array<{ id: string; name: string; price: number | null; customPrice: boolean; estimate: string }> }>())
        .values()
    ),
    services: services
      .filter((service) => service.category.is_active && !service.category.deleted_at && !service.deleted_at)
      .map((service) => ({
        id: String(service._id),
        name: service.name,
        category: { id: String(service.category._id), name: service.category.name, slug: service.category.slug },
        price: service.price_amount === null ? null : Number(service.price_amount.toString()),
        customPrice: service.is_custom_price || service.price_amount === null,
        estimate: service.estimate_text,
      })),
  };
}

export async function listPublicServiceCategories() {
  const [categories, services, games] = await Promise.all([
    db.orm.service_category.all(),
    db.orm.game_service.all(),
    db.orm.game_catalog.all(),
  ]);
  const activeGameIds = new Set(
    games.filter((game) => game.is_active && !game.deleted_at).map((game) => String(game._id))
  );
  return {
    categories: categories
      .filter((category) => category.is_active && !category.deleted_at)
      .map((category) => ({
        id: String(category._id),
        name: category.name,
        slug: category.slug,
        description: category.description,
        serviceCount: services.filter(
          (service) =>
            String(service.category_id) === String(category._id) &&
            service.is_active &&
            !service.deleted_at &&
            activeGameIds.has(String(service.game_id))
        ).length,
      }))
      .filter((category) => category.serviceCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'id-ID')),
  };
}
