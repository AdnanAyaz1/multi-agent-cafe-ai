'use client';

import { useState, useEffect } from 'react';
import {
  Database,
  History,
  ChevronRight,
  Download,
  SearchCode,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { CompetitorHistoryItem, CompetitorTableRow } from '@/types/dashboard';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';

export function CompetitorInsights() {
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

          // Derive history from snapshots
          const historyItems: CompetitorHistoryItem[] = snapshots.map((s: { collectedAt: string }) => ({
            name: data.businessName ?? DEFAULT_BUSINESS_ID,
            time: new Date(s.collectedAt).toLocaleString(),
          }));
          setHistory(historyItems.slice(0, 5));

          // Derive table data from latest snapshot
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
      // Wait a moment then refetch
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

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight font-heading">
            Competitor Scraping
          </h2>
          <p className="text-base text-muted-foreground mt-1">
            Deploying agents to monitor local market price fluctuations.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-info/10 rounded-full border border-info/30">
          <span className="relative flex h-3 w-3">
            <span className="ping-emerald absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
          </span>
          <span className="text-xs font-semibold text-success-foreground uppercase tracking-wider">
            Agent Polling...
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column - URL Input + History */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          {/* URL Input Card */}
          <div className="bg-card p-6 rounded-xl shadow-sm ring-1 ring-foreground/5">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 font-heading">
              New Intelligence Mission
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Competitor URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://roastery-competitor.com/menu"
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:border-ring outline-none transition-all text-sm"
                />
              </div>
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="w-full caramel-gradient text-primary-foreground font-bold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {scraping ? (
                  <>
                    <span className="animate-spin size-4 border-2 border-white/30 border-t-white rounded-full" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Database className="size-4" />
                    Start Scraping
                  </>
                )}
              </button>
            </div>
          </div>

          {/* History Card */}
          <div className="bg-card p-6 rounded-xl shadow-sm ring-1 ring-foreground/5 flex-grow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground font-heading">
                History
              </h3>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet</p>
              ) : (
                history.map((item, i) => (
                  <div
                    key={`${item.name}-${i}`}
                    className="p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <History className="size-5 text-muted-foreground" />
                      <div>
                        <p className="font-bold text-sm text-card-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Data Table */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
          {/* Data Table */}
          <div className="bg-card rounded-xl shadow-sm ring-1 ring-foreground/5 flex-grow overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground font-heading">
                Extracted Data
              </h3>
              <button className="flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground rounded-md font-bold text-sm hover:bg-accent/20 transition-all">
                <Download className="size-3.5" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Promo Found
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Match Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Loading data...
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No data yet. Start a scraping job to see results.
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row) => (
                      <tr
                        key={row.name}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-card-foreground">
                          {row.name}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">{row.price}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-bold uppercase">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {row.promo ? (
                            <span className="px-2 py-1 bg-success/20 text-success-foreground rounded text-xs font-bold uppercase">
                              {row.promo}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${row.score}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card/70 backdrop-blur p-6 rounded-xl ring-1 ring-foreground/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <SearchCode className="size-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">
              Items Tracked
            </p>
            <p className="text-2xl font-bold text-card-foreground">{stats.itemsTracked}</p>
          </div>
        </div>
        <div className="bg-card/70 backdrop-blur p-6 rounded-xl ring-1 ring-foreground/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-success">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">
              Price Deviations
            </p>
            <p className="text-2xl font-bold text-card-foreground">{stats.priceDeviations}</p>
          </div>
        </div>
        <div className="bg-card/70 backdrop-blur p-6 rounded-xl ring-1 ring-foreground/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <Zap className="size-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">
              Agent Speed
            </p>
            <p className="text-2xl font-bold text-card-foreground">{stats.agentSpeed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
