'use client';

import { useState, useEffect } from 'react';

interface Business {
  id: string;
  name: string;
}

export function useBusinessId() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Failed to fetch business');
        const data = await res.json();
        setBusiness(data.business);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load business');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, []);

  return { business, loading, error };
}
