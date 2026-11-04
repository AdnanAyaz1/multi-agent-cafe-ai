import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';

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

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  try {
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

    // 2. Upsert Subscription
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

    const businessPayload = {
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
        data: businessPayload,
      });
    } else {
      business = await prisma.business.create({
        data: businessPayload,
      });
    }

    // 4. Write menu file if filesystem is writable
    try {
      const menusDir = process.env.MENU_JSON_DIR ?? path.join(process.cwd(), 'data', 'menus');
      await fs.mkdir(menusDir, { recursive: true });
      await fs.writeFile(
        path.join(menusDir, `${business.id}.json`),
        JSON.stringify(SPECIALTY_MENU_ITEMS, null, 2),
        'utf-8'
      );
    } catch {
      // Ignore if on serverless read-only disk
    }

    return NextResponse.json({
      status: 'success',
      message: 'Real cafe owner and intelligence profile created successfully!',
      credentials: {
        email: USER_EMAIL,
        password: USER_PASSWORD,
        name: USER_NAME,
      },
      business: {
        id: business.id,
        name: business.name,
        operationalCities: OPERATIONAL_CITIES,
        competitorTargets: COMPETITOR_URLS,
        menuItemsCount: SPECIALTY_MENU_ITEMS.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Seeding failed',
      },
      { status: 500 }
    );
  }
}
