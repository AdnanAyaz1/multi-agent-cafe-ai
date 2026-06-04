import type { Menu } from './types';

const TTL_MS = 5 * 60 * 1000;

interface CachedMenu {
  menu: Menu;
  expiresAt: number;
}

const globalForCache = globalThis as unknown as {
  menuCache: Map<string, CachedMenu> | undefined;
};

const cache: Map<string, CachedMenu> =
  globalForCache.menuCache ?? new Map();
if (process.env.NODE_ENV !== 'production') {
  globalForCache.menuCache = cache;
}

export function getCachedMenu(businessId: string): Menu | null {
  const entry = cache.get(businessId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(businessId);
    return null;
  }
  return entry.menu;
}

export function setCachedMenu(menu: Menu): void {
  cache.set(menu.businessId, {
    menu,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function clearMenuCache(): void {
  cache.clear();
}
