export const CATEGORY_FILTERS = ['all', 'hot', 'cold', 'food', 'dessert'] as const

export type CategoryFilter = (typeof CATEGORY_FILTERS)[number]

export const MENU_CATEGORIES = ['drinks', 'food', 'dessert'] as const

export type MenuCategory = (typeof MENU_CATEGORIES)[number]

export const ITEM_TEMPERATURE = ['hot', 'cold', 'neutral'] as const

export type ItemTemperature = (typeof ITEM_TEMPERATURE)[number]
