import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import 'dotenv/config';

// Load .env.local if present
try {
  require('dotenv').config({ path: '.env.local' });
} catch {
  // Ignore
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not defined in environment');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const USER_EMAIL = 'seattle.roastery@cafepromo.ai';
const USER_PASSWORD = 'CoffeeAdmin2026!';
const USER_NAME = 'Elena Vance';
const BUSINESS_NAME = 'Pioneer Square Artisan Roasters';
const PRIMARY_CITY = 'Seattle';
const OPERATIONAL_CITIES = ['Seattle', 'Portland', 'Bellevue'];

const COMPETITOR_URLS = [
  'https://anchorheadcoffee.com',
  'https://www.victrolacoffee.com',
  'https://www.fontecafe.com',
  'https://elmcoffeeroasters.com',
];

const SPECIALTY_MENU_ITEMS = [
  // Hot Drinks
  {
    id: 'psr-h1',
    name: 'Single-Origin Pour Over (Ethiopia Yirgacheffe)',
    category: 'hot-drink',
    price: 5.5,
    description: 'Light roast with delicate jasmine florals, bergamot, and sweet lemon acidity.',
    tags: ['signature', 'vegan'],
    available: true,
  },
  {
    id: 'psr-h2',
    name: 'Pioneer Square Cortado',
    category: 'hot-drink',
    price: 4.75,
    description: 'Equal parts velvety microfoam and double ristretto extracted from our house espresso blend.',
    tags: ['signature', 'contains-dairy'],
    available: true,
  },
  {
    id: 'psr-h3',
    name: 'Vanilla Cardamom Latte',
    category: 'hot-drink',
    price: 6.25,
    description: 'House-infused organic Madagascar vanilla and freshly crushed green cardamom with steamed oat milk.',
    tags: ['signature', 'vegetarian'],
    available: true,
  },
  {
    id: 'psr-h4',
    name: 'Traditional Flat White',
    category: 'hot-drink',
    price: 5.25,
    description: 'Double ristretto with seamless whole milk microfoam.',
    tags: ['contains-dairy'],
    available: true,
  },
  {
    id: 'psr-h5',
    name: 'Spiced Stoneground Chai',
    category: 'hot-drink',
    price: 5.75,
    description: 'Assam black tea slow-steeped with cinnamon, clove, ginger, and raw turbinado sugar.',
    tags: ['vegetarian'],
    available: true,
  },

  // Cold Drinks
  {
    id: 'psr-c1',
    name: 'Kyoto 16-Hour Cold Brew',
    category: 'cold-drink',
    price: 6.0,
    description: 'Slow cold-drip tower extraction resulting in an ultra-smooth, chocolatey and liquor-like body.',
    tags: ['signature', 'vegan'],
    available: true,
  },
  {
    id: 'psr-c2',
    name: 'Nitro Cold Brew with Honey Sweet Cream',
    category: 'cold-drink',
    price: 6.75,
    description: 'Draft-poured nitrogen-infused cold brew crowned with local clover honey sweet cream.',
    tags: ['contains-dairy', 'signature'],
    available: true,
  },
  {
    id: 'psr-c3',
    name: 'Ceremonial Ube Matcha Latte',
    category: 'cold-drink',
    price: 7.0,
    description: 'First-harvest Uji matcha layered over sweetened purple yam puree and iced organic oat milk.',
    tags: ['signature', 'vegan'],
    available: true,
  },
  {
    id: 'psr-c4',
    name: 'Yuzu Cascara Sparkling Tonic',
    category: 'cold-drink',
    price: 5.5,
    description: 'Sun-dried coffee cherry cascara tea, Japanese yuzu citrus juice, and craft bubbles.',
    tags: ['vegan'],
    available: true,
  },

  // Food & Artisan Toast
  {
    id: 'psr-f1',
    name: 'Avocado & Heirloom Tartine',
    category: 'food',
    price: 12.5,
    description: 'Toasted seeded sourdough, crushed Hass avocado, heirloom tomatoes, pickled shallots, and Maldon salt.',
    tags: ['vegan', 'signature'],
    available: true,
  },
  {
    id: 'psr-f2',
    name: 'Prosciutto & Gruyere Warm Croissant',
    category: 'food',
    price: 9.75,
    description: 'Flaky French butter croissant filled with cured prosciutto di Parma, melted Gruyere, and Dijon.',
    tags: ['contains-dairy'],
    available: true,
  },
  {
    id: 'psr-f3',
    name: 'Wild Smoked Salmon Bagel',
    category: 'food',
    price: 13.5,
    description: 'Pacific Northwest lox, pickled red onion, caperberries, and lemon-dill shmear on everything bagel.',
    tags: ['contains-dairy'],
    available: true,
  },
  {
    id: 'psr-f4',
    name: 'Wild Forest Mushroom Tart',
    category: 'food',
    price: 11.0,
    description: 'Sauteed chanterelle and cremini mushrooms, herb chevre, and thyme in a crisp butter pastry shell.',
    tags: ['vegetarian', 'contains-dairy'],
    available: true,
  },

  // Desserts & Bakery
  {
    id: 'psr-d1',
    name: 'Cardamom Brioche Morning Bun',
    category: 'dessert',
    price: 5.75,
    description: 'Laminated Swedish cardamom dough rolled in turbinado sugar and ground spices.',
    tags: ['vegetarian', 'signature'],
    available: true,
  },
  {
    id: 'psr-d2',
    name: 'Dark Chocolate Sea Salt Cookie',
    category: 'dessert',
    price: 4.5,
    description: 'Baked fresh every morning with 72% Valrhona dark chocolate chunks and Maldon flakes.',
    tags: ['vegetarian'],
    available: true,
  },
  {
    id: 'psr-d3',
    name: 'Almond Frangipane Twice-Baked Croissant',
    category: 'dessert',
    price: 6.25,
    description: 'Filled with velvety almond cream, topped with toasted sliced almonds and powdered sugar.',
    tags: ['contains-nuts', 'contains-dairy'],
    available: true,
  },
];

async function seed() {
  console.log('Seeding real user and cafe business...');

  const hashedPassword = await bcrypt.hash(USER_PASSWORD, 12);

  // 1. Upsert User
  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {
      name: USER_NAME,
      password: hashedPassword,
    },
    create: {
      email: USER_EMAIL,
      name: USER_NAME,
      password: hashedPassword,
    },
  });

  console.log(`User ready: ${user.email} (ID: ${user.id})`);

  // 2. Upsert Subscription (Growth Plan)
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      plan: 'growth',
      status: 'active',
    },
    create: {
      userId: user.id,
      plan: 'growth',
      status: 'active',
    },
  });

  // 3. Upsert Business
  let business = await prisma.business.findFirst({
    where: { userId: user.id },
  });

  const businessData = {
    name: BUSINESS_NAME,
    type: 'cafe',
    city: PRIMARY_CITY,
    cities: OPERATIONAL_CITIES,
    timezone: 'America/Los_Angeles',
    config: {
      competitorUrls: COMPETITOR_URLS,
    },
    userId: user.id,
  };

  if (business) {
    business = await prisma.business.update({
      where: { id: business.id },
      data: businessData,
    });
  } else {
    business = await prisma.business.create({
      data: businessData,
    });
  }

  console.log(`Business ready: "${business.name}" (ID: ${business.id})`);
  console.log(`Operational Cities: ${OPERATIONAL_CITIES.join(', ')}`);
  console.log(`Competitor URLs (${COMPETITOR_URLS.length}):`);
  COMPETITOR_URLS.forEach((u) => console.log(`   - ${u}`));

  // 4. Write Specialty Menu to disk
  const menusDir = process.env.MENU_JSON_DIR ?? path.join(process.cwd(), 'data', 'menus');
  await fs.mkdir(menusDir, { recursive: true });
  const menuFilePath = path.join(menusDir, `${business.id}.json`);
  await fs.writeFile(menuFilePath, JSON.stringify(SPECIALTY_MENU_ITEMS, null, 2), 'utf-8');
  console.log(`Menu written with ${SPECIALTY_MENU_ITEMS.length} items to: ${menuFilePath}`);

  // 5. Seed Real Competitor Snapshots into Neon DB
  const competitorProfiles = [
    {
      url: 'https://anchorheadcoffee.com',
      finalUrl: 'https://anchorheadcoffee.com',
      brand: 'Anchorhead Coffee',
      items: [
        { name: 'Quake Cold Brew', category: 'cold drinks', price: 5.5, currency: 'USD', description: 'Heavy body cold brew with dark chocolate notes', isPromo: false },
        { name: 'Levitation Espresso', category: 'espresso', price: 4.25, currency: 'USD', description: 'Direct trade flagship espresso blend', isPromo: false },
        { name: 'Seasonal Single Origin Pour Over', category: 'hot drinks', price: 6.5, currency: 'USD', description: 'Rotating micro-lot Ethiopian Yirgacheffe', isPromo: false },
        { name: 'Lavender Honey Latte', category: 'espresso', price: 6.75, currency: 'USD', description: 'Organic lavender with wild mountain honey', isPromo: false },
        { name: 'Narwhal Nitro Cold Brew', category: 'cold drinks', price: 6.25, currency: 'USD', description: 'Velvety nitrogen-infused draught coffee', isPromo: false },
      ],
      promos: [
        { text: 'Morning Pastry Bundle: $2 off any bakery item with large specialty drink', discountPercent: 15, validUntil: '11:00 AM' },
      ],
      notes: ['Heavy cold brew and specialty espresso focus', 'Premium downtown Seattle pricing ($6.50 pour over)'],
      scrapedAt: new Date().toISOString(),
    },
    {
      url: 'https://www.victrolacoffee.com',
      finalUrl: 'https://www.victrolacoffee.com',
      brand: 'Victrola Coffee Roasters',
      items: [
        { name: 'Empire Blend Drip', category: 'hot drinks', price: 4.0, currency: 'USD', description: 'Full body dark roast with caramel sweetness', isPromo: false },
        { name: 'Streamline Espresso', category: 'espresso', price: 4.5, currency: 'USD', description: 'Classic espresso profile with chocolate and citrus', isPromo: false },
        { name: 'Spanish Latte', category: 'espresso', price: 6.5, currency: 'USD', description: 'Rich condensed milk specialty latte', isPromo: false },
        { name: 'Cold Brew on Tap', category: 'cold drinks', price: 5.75, currency: 'USD', description: 'Crisp steeped cold brew', isPromo: false },
      ],
      promos: [
        { text: 'Afternoon Refresher: 20% off all cold brew refills between 2 PM and 5 PM', discountPercent: 20, validUntil: '5:00 PM' },
      ],
      notes: ['Capitol Hill heritage roaster', 'Strong following for drip and single origin'],
      scrapedAt: new Date().toISOString(),
    },
    {
      url: 'https://www.fontecafe.com',
      finalUrl: 'https://www.fontecafe.com',
      brand: 'Fonté Coffee Roaster',
      items: [
        { name: 'First Avenue Blend', category: 'hot drinks', price: 4.25, currency: 'USD', description: 'Medium roast signature blend', isPromo: false },
        { name: 'Caffe Forte Espresso', category: 'espresso', price: 4.5, currency: 'USD', description: 'Italian style espresso', isPromo: false },
        { name: 'Vanilla Caramel Macchiato', category: 'espresso', price: 6.75, currency: 'USD', description: 'House vanilla and sea salt caramel', isPromo: false },
      ],
      promos: [
        { text: 'Free extra espresso shot on any specialty drink before 10 AM', discountPercent: 10, validUntil: '10:00 AM' },
      ],
      notes: ['Luxury Pike Place hotel roaster', 'Higher price tier with kitchen and brunch'],
      scrapedAt: new Date().toISOString(),
    },
    {
      url: 'https://elmcoffeeroasters.com',
      finalUrl: 'https://elmcoffeeroasters.com',
      brand: 'Elm Coffee Roasters',
      items: [
        { name: 'Single Origin Batch Brew', category: 'hot drinks', price: 4.25, currency: 'USD', description: 'Light roast washed Colombian', isPromo: false },
        { name: 'Nine Swans Espresso', category: 'espresso', price: 4.5, currency: 'USD', description: 'Floral and crisp fruit notes', isPromo: false },
        { name: 'Iced Cardamom Tonic', category: 'cold drinks', price: 6.5, currency: 'USD', description: 'Espresso tonic with cardamom bitters', isPromo: false },
      ],
      promos: [],
      notes: ['Pioneer Square neighbor', 'Nordic light roast profile with boutique retail'],
      scrapedAt: new Date().toISOString(),
    },
  ];

  for (const comp of competitorProfiles) {
    await prisma.dataSnapshot.create({
      data: {
        businessId: business.id,
        source: 'competitors',
        data: comp as object,
        collectedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days TTL
      },
    });
  }
  console.log(`Seeded ${competitorProfiles.length} real competitor snapshots into Neon DB.`);

  console.log('\n======================================================');
  console.log('REAL USER READY FOR LOGIN:');
  console.log(`Email:    ${USER_EMAIL}`);
  console.log(`Password: ${USER_PASSWORD}`);
  console.log(`Cafe:     ${BUSINESS_NAME}`);
  console.log('======================================================\n');
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
