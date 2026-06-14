'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';
import type { CompetitorHistoryItem, CompetitorTableRow } from '@/types/dashboard';

export function useCompetitorInsights() {
  const [scraping, setScraping] = useState(false);
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState<CompetitorHistoryItem[]>([]);
  const [tableData, setTableData] = useState<CompetitorTableRow[]>([]);
  const [stats, setStats] = useState({ itemsTracked: 0, priceDeviations: 0, agentSpeed: '—' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/competitor/${DEFAULT_BUSINESS_ID}?limit=10`);
        if (res.ok) {
          const data = await res.json();
          const snapshots = data.snapshots ?? [];

          const historyItems: CompetitorHistoryItem[] = snapshots.map((s: { collectedAt: string }) => ({
            name: data.businessName ?? DEFAULT_BUSINESS_ID,
            time: new Date(s.collectedAt).toLocaleString(),
          }));
          setHistory(historyItems.slice(0, 5));

          if (snapshots.length > 0) {
            const latest = snapshots[0];
            const parsed = latest.data as { items?: Array<{ name: string; price: string; category: string; promo?: string }> };
            if (parsed?.items) {
              const rows: CompetitorTableRow[] = parsed.items.map((item) => ({
                name: item.name,
                price: item.price,
                category: item.category,
                promo: item.promo ?? null,
                score: Math.floor(Math.random() * 40) + 60,
              }));
              setTableData(rows);
              setStats({
                itemsTracked: rows.length,
                priceDeviations: rows.filter((r) => r.promo).length,
                agentSpeed: '—',
              });
            }
          }
        }
      } catch {
        // Fetch failed
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleScrape = async () => {
    setScraping(true);
    try {
      await fetch('/api/competitor/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: DEFAULT_BUSINESS_ID, url: url || undefined }),
      });
      setTimeout(async () => {
        const res = await fetch(`/api/competitor/${DEFAULT_BUSINESS_ID}?limit=10`);
        if (res.ok) {
          const data = await res.json();
          const snapshots = data.snapshots ?? [];
          const historyItems: CompetitorHistoryItem[] = snapshots.map((s: { collectedAt: string }) => ({
            name: data.businessName ?? DEFAULT_BUSINESS_ID,
            time: new Date(s.collectedAt).toLocaleString(),
          }));
          setHistory(historyItems.slice(0, 5));
        }
        setScraping(false);
      }, 5000);
    } catch {
      setScraping(false);
    }
  };

  return {
    scraping,
    url,
    setUrl,
    history,
    tableData,
    stats,
    loading,
    handleScrape,
  };
}
