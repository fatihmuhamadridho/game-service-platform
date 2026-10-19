import 'dotenv/config';
import { ObjectId } from 'mongodb';
import { db } from '../src/prisma/db';

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
};

type ServiceSeed = {
  categorySlug: string;
  name: string;
  priceAmount: number | null;
  isCustomPrice: boolean;
  estimateText: string;
};

type GameSeed = {
  name: string;
  slug: string;
  serviceSummary: string;
  artworkKey: string;
  sortOrder: number;
  services: ServiceSeed[];
};

const categories: CategorySeed[] = [
  { name: 'Joki Game', slug: 'joki-game', description: 'Layanan bantuan rank, level, dan progress game.' },
  { name: 'Top Up Game', slug: 'top-up-game', description: 'Isi ulang mata uang dan item game.' },
  { name: 'Voucher Game', slug: 'voucher-game', description: 'Voucher dan membership untuk game.' },
];

const simulationEstimate = (value: string) => `Simulasi · ${value}`;

const games: GameSeed[] = [
  {
    name: 'Roblox',
    slug: 'roblox',
    serviceSummary: 'Top up Robux dan bantuan progress experience.',
    artworkKey: 'roblox',
    sortOrder: 1,
    services: [
      {
        categorySlug: 'top-up-game',
        name: 'Robux 400',
        priceAmount: 75000,
        isCustomPrice: false,
        estimateText: simulationEstimate('10–30 menit'),
      },
      {
        categorySlug: 'joki-game',
        name: 'Bantuan Level dan Quest',
        priceAmount: null,
        isCustomPrice: true,
        estimateText: simulationEstimate('1–3 hari'),
      },
    ],
  },
  {
    name: 'Mobile Legends',
    slug: 'mobile-legends',
    serviceSummary: 'Top up Diamonds dan layanan push rank.',
    artworkKey: 'ml',
    sortOrder: 2,
    services: [
      {
        categorySlug: 'top-up-game',
        name: '86 Diamonds',
        priceAmount: 25000,
        isCustomPrice: false,
        estimateText: simulationEstimate('10–30 menit'),
      },
      {
        categorySlug: 'joki-game',
        name: 'Rank Warrior ke Elite',
        priceAmount: 35000,
        isCustomPrice: false,
        estimateText: simulationEstimate('1–2 hari'),
      },
    ],
  },
  {
    name: 'Free Fire',
    slug: 'free-fire',
    serviceSummary: 'Top up Diamonds dan layanan push rank.',
    artworkKey: 'ff',
    sortOrder: 3,
    services: [
      {
        categorySlug: 'top-up-game',
        name: '70 Diamonds',
        priceAmount: 12000,
        isCustomPrice: false,
        estimateText: simulationEstimate('10–30 menit'),
      },
      {
        categorySlug: 'joki-game',
        name: 'Rank Bronze ke Gold',
        priceAmount: 45000,
        isCustomPrice: false,
        estimateText: simulationEstimate('1–2 hari'),
      },
    ],
  },
  {
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    serviceSummary: 'Top up UC dan layanan push rank.',
    artworkKey: 'pubg',
    sortOrder: 4,
    services: [
      {
        categorySlug: 'top-up-game',
        name: '60 UC',
        priceAmount: 15000,
        isCustomPrice: false,
        estimateText: simulationEstimate('10–30 menit'),
      },
      {
        categorySlug: 'joki-game',
        name: 'Rank Bronze ke Silver',
        priceAmount: 100000,
        isCustomPrice: false,
        estimateText: simulationEstimate('2–3 hari'),
      },
    ],
  },
  {
    name: 'Valorant',
    slug: 'valorant',
    serviceSummary: 'Top up VP dan layanan push rank.',
    artworkKey: 'valo',
    sortOrder: 5,
    services: [
      {
        categorySlug: 'top-up-game',
        name: '475 VP',
        priceAmount: 75000,
        isCustomPrice: false,
        estimateText: simulationEstimate('10–30 menit'),
      },
      {
        categorySlug: 'joki-game',
        name: 'Rank Iron ke Bronze',
        priceAmount: 150000,
        isCustomPrice: false,
        estimateText: simulationEstimate('2–3 hari'),
      },
    ],
  },
  {
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    serviceSummary: 'Top up Genesis Crystals dan voucher Blessing of the Welkin Moon.',
    artworkKey: 'genshin',
    sortOrder: 6,
    services: [
      {
        categorySlug: 'top-up-game',
        name: '60 Genesis Crystals',
        priceAmount: 18000,
        isCustomPrice: false,
        estimateText: simulationEstimate('10–30 menit'),
      },
      {
        categorySlug: 'voucher-game',
        name: 'Blessing of the Welkin Moon',
        priceAmount: 80000,
        isCustomPrice: false,
        estimateText: simulationEstimate('10–30 menit'),
      },
    ],
  },
];

async function findOrCreateCategory(seed: CategorySeed, now: Date) {
  const existing = await db.orm.service_category.where({ slug: seed.slug }).first();
  if (existing) return { id: String(existing._id), created: false, active: existing.is_active && !existing.deleted_at };

  const category = await db.orm.service_category.create({
    _id: new ObjectId().toHexString(),
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    is_active: true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
  return { id: String(category._id), created: true, active: true };
}

async function findOrCreateGame(seed: GameSeed, now: Date) {
  const existing =
    (await db.orm.game_catalog.where({ slug: seed.slug }).first()) ??
    (await db.orm.game_catalog.where({ name: seed.name }).first());
  if (existing) return { id: String(existing._id), created: false, active: existing.is_active && !existing.deleted_at };

  const game = await db.orm.game_catalog.create({
    _id: new ObjectId().toHexString(),
    name: seed.name,
    slug: seed.slug,
    service_summary: seed.serviceSummary,
    artwork_key: seed.artworkKey,
    is_active: true,
    is_popular: true,
    sort_order: seed.sortOrder,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
  return { id: String(game._id), created: true, active: true };
}

async function findOrCreateService(seed: ServiceSeed, gameId: string, categoryId: string, now: Date) {
  const existing = await db.orm.game_service
    .where({ game_id: gameId, category_id: categoryId, name: seed.name })
    .first();
  if (existing) return false;

  await db.orm.game_service.create({
    _id: new ObjectId().toHexString(),
    game_id: gameId,
    category_id: categoryId,
    name: seed.name,
    price_amount: seed.isCustomPrice ? null : String(seed.priceAmount),
    is_custom_price: seed.isCustomPrice,
    estimate_text: seed.estimateText,
    is_active: true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
  return true;
}

async function main() {
  const now = new Date();
  const categoryRows = await Promise.all(categories.map((category) => findOrCreateCategory(category, now)));
  const categoryIds = new Map(
    categories.map((category, index) => [category.slug, { slug: category.slug, ...categoryRows[index]! }])
  );
  let createdGames = 0;
  let createdServices = 0;
  const inactiveRelations: string[] = [];

  for (const seed of games) {
    const game = await findOrCreateGame(seed, now);
    if (game.created) createdGames += 1;
    if (!game.active) inactiveRelations.push(`${seed.name} (game nonaktif; layanan tetap disiapkan)`);

    for (const service of seed.services) {
      const category = categoryIds.get(service.categorySlug);
      if (!category) continue;
      if (
        !category.active &&
        !inactiveRelations.includes(`${category.slug} (kategori nonaktif; layanan tetap disiapkan)`)
      )
        inactiveRelations.push(`${category.slug} (kategori nonaktif; layanan tetap disiapkan)`);
      if (await findOrCreateService(service, game.id, category.id, now)) createdServices += 1;
    }
  }

  const createdCategories = categoryRows.filter((category) => category.created).length;
  console.info(
    `Demo catalog seed complete: ${createdGames} games, ${createdCategories} categories, ${createdServices} services created.`
  );
  if (inactiveRelations.length) {
    console.info(`Existing inactive records preserved: ${inactiveRelations.join('; ')}.`);
  }
}

main()
  .catch((error: unknown) => {
    console.error('Demo catalog seed failed.', error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
