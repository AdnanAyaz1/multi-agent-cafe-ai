import { prisma } from '@/lib/db';
import { JsonMenuSource } from './json-source';
import { pickMenuSourceType, type MenuSource, type MenuSourceType } from './source';
import type { Menu } from './types';
import { getCachedMenu, setCachedMenu } from './cache';
import { NotFoundError } from '@/lib/errors';

export * from './types';
export { MENU_CATEGORIES, COMMON_TAGS } from '@/constants/menu';
export type { MenuCategory, CommonTag } from '@/constants/menu';

const sources: Record<MenuSourceType, MenuSource> = {
  json: new JsonMenuSource(),
  postgres: new JsonMenuSource(),
  sqlite: new JsonMenuSource(),
};

function getSource(config: unknown): MenuSource {
  const type = pickMenuSourceType(config);
  return sources[type];
}

export async function getMenuForBusiness(businessId: string): Promise<Menu> {
  const cached = getCachedMenu(businessId);
  if (cached) return cached;

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new NotFoundError('Business');

  const source = getSource(business.config);
  const menu = await source.getMenu(businessId);
  setCachedMenu(menu);
  return menu;
}
