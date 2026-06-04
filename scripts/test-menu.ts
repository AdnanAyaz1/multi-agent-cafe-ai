import 'dotenv/config';
import { getMenuForBusiness } from '@/lib/menu';

async function main(): Promise<void> {
  const businessId = process.argv[2] ?? 'test-biz-1';
  const menu = await getMenuForBusiness(businessId);

  console.log(`\nMenu for "${menu.businessId}" — ${menu.items.length} items`);
  console.log(`Fetched at: ${menu.fetchedAt.toISOString()}\n`);

  const byCategory = menu.items.reduce<Record<string, typeof menu.items>>(
    (acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    },
    {}
  );

  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(`── ${cat} (${items.length}) ──`);
    for (const item of items) {
      const tags = item.tags?.length ? ` [${item.tags.join(', ')}]` : '';
      console.log(`  ${item.name.padEnd(24)} Rs.${item.price}${tags}`);
    }
    console.log();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
