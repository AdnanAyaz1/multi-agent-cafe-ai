export const MENU_CATEGORIES = [
  'hot-drink',
  'cold-drink',
  'food',
  'dessert',
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const COMMON_TAGS = [
  'vegetarian',
  'vegan',
  'spicy',
  'contains-dairy',
  'contains-nuts',
  'gluten-free',
  'signature',
] as const;

export type CommonTag = (typeof COMMON_TAGS)[number];
