'use client';

import { useState, useMemo } from 'react';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useBusinessId } from '@/hooks/useBusinessId';
import type { MenuCategory } from '@/constants/menu';

export function useMenuPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');
  const { business, loading: businessLoading } = useBusinessId();
  const {
    items,
    loading,
    controlled,
    unavailable,
    toggleControlled,
    toggleUnavailable,
    setAllControlled,
    refresh,
  } = useMenuItems(business?.id ?? '');

  const filtered = useMemo(() => items.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }), [items, search, activeCategory]);

  const controlledCount = items.filter((i) => controlled[i.id] !== false).length;
  const unavailableCount = items.filter((i) => unavailable[i.id]).length;

  return {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    business,
    businessLoading,
    items,
    loading,
    controlled,
    unavailable,
    filtered,
    controlledCount,
    unavailableCount,
    toggleControlled,
    toggleUnavailable,
    setAllControlled,
    refresh,
  };
}
