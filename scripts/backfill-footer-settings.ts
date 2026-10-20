import 'dotenv/config';
import { db } from '../src/prisma/db';

async function main() {
  const rows = await db.orm.platform_settings.all();
  let updated = 0;

  for (const row of rows) {
    const socialLinks = Array.isArray(row.social_links) ? row.social_links : [];
    if (socialLinks.length || !row.instagram_url) continue;

    await db.orm.platform_settings.where({ _id: row._id }).update({
      social_links: [{ label: 'Instagram', url: row.instagram_url }],
    });
    updated += 1;
  }

  console.info(`Footer settings backfill complete: ${updated} legacy Instagram link(s) copied.`);
}

main()
  .catch((error: unknown) => {
    console.error('Footer settings backfill failed.', error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
