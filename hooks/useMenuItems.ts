'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MenuItem } from '@/lib/menu/types';

interface ControlledItems {
  [itemId: string]: boolean;
}

const STORAGE_KEY = 'cafepromo-ai-controlled-items';

function loadControlledItems(businessId: string): ControlledItems {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${businessId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveControlledItems(businessId: string, items: ControlledItems) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${businessId}`, JSON.stringify(items));
  } catch {
    // localStorage unavailable
  }
}

export function useMenuItems(businessId: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controlled, setControlled] = useState<ControlledItems>({});
  const [unavailable, setUnavailable] = useState<ControlledItems>({});

  useEffect(() => {
    setControlled(loadControlledItems(businessId));
  }, [businessId]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/menu/${businessId}`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      const menuItems: MenuItem[] = data.items ?? data ?? [];
      setItems(menuItems);

      // Initialize controlled state for new items (default: true)
      const stored = loadControlledItems(businessId);
      const updated: ControlledItems = {};
      for (const item of menuItems) {
        updated[item.id] = stored[item.id] !== undefined ? stored[item.id] : true;
      }
      setControlled(updated);
      saveControlledItems(businessId, updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleControlled = useCallback((itemId: string) => {
    setControlled((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      saveControlledItems(businessId, next);
      return next;
    });
  }, [businessId]);

  const toggleUnavailable = useCallback((itemId: string) => {
    setUnavailable((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const setAllControlled = useCallback((value: boolean) => {
    const next: ControlledItems = {};
    for (const item of items) {
      next[item.id] = value;
    }
    setControlled(next);
    saveControlledItems(businessId, next);
  }, [items, businessId]);

  return {
    items,
    loading,
    error,
    controlled,
    unavailable,
    toggleControlled,
    toggleUnavailable,
    setAllControlled,
    refresh: fetchItems,
  };
}
