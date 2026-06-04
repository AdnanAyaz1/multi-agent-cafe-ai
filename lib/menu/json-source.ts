import { promises as fs } from 'fs';
import path from 'path';
import type { MenuSource } from './source';
import type { Menu, MenuItem } from './types';
import { NotFoundError } from '@/lib/errors';

const MENUS_DIR =
  process.env.MENU_JSON_DIR ?? path.join(process.cwd(), 'data', 'menus');

export class JsonMenuSource implements MenuSource {
  async getMenu(businessId: string): Promise<Menu> {
    const filePath = path.join(MENUS_DIR, `${businessId}.json`);

    let raw: string;
    try {
      raw = await fs.readFile(filePath, 'utf-8');
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        throw new NotFoundError(`Menu for business "${businessId}"`);
      }
      throw e;
    }

    const items: MenuItem[] = JSON.parse(raw);
    return {
      businessId,
      items,
      fetchedAt: new Date(),
    };
  }
}
