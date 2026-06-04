import type { Menu } from './types';

export interface MenuSource {
  getMenu(businessId: string): Promise<Menu>;
}

export type MenuSourceType = 'json' | 'postgres' | 'sqlite';

interface BusinessMenuConfig {
  menuSource?: MenuSourceType;
  [key: string]: unknown;
}

export function pickMenuSourceType(config: unknown): MenuSourceType {
  if (!config || typeof config !== 'object') return 'json';
  const c = config as BusinessMenuConfig;
  return c.menuSource ?? 'json';
}
