import type { MenuCategory } from '@/constants/menu';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description?: string;
  tags?: string[];
  available?: boolean;
}

export interface Menu {
  businessId: string;
  items: MenuItem[];
  fetchedAt: Date;
}
