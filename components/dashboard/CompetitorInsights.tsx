'use client';

import { useState } from 'react';
import {
  Database,
  History,
  ChevronRight,
  Download,
  Brain,
  Sparkles,
  SearchCode,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { COMPETITOR_HISTORY_ITEMS, COMPETITOR_TABLE_DATA } from '@/constants/competitor-insights';

export function CompetitorInsights() {
  const [scraping, setScraping] = useState(false);
  const [url, setUrl] = useState('');

  const handleScrape = () => {
    setScraping(true);
    setTimeout(() => setScraping(false), 3000);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#111c2d] tracking-tight font-heading">
            Competitor Scraping
          </h2>
          <p className="text-base text-[#424754] mt-1">
            Deploying agents to monitor local market price fluctuations.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[#dee8ff] rounded-full border border-[#c2c6d6]/30">
          <span className="relative flex h-3 w-3">
            <span className="ping-emerald absolute inline-flex h-full w-full rounded-full bg-[#006c49] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#006c49]" />
          </span>
          <span className="text-xs font-semibold text-[#006c49] uppercase tracking-wider">
            Agent Polling...
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column - URL Input + History */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          {/* URL Input Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d6]/30">
            <h3 className="text-lg font-semibold text-[#111c2d] mb-4 font-heading">
              New Intelligence Mission
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#424754] mb-2 uppercase tracking-wider">
                  Competitor URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://roastery-competitor.com/menu"
                  className="w-full bg-[#f0f3ff] border border-[#c2c6d6]/50 rounded-lg px-4 py-3 focus:border-[#0058be] outline-none transition-all text-sm"
                />
              </div>
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="w-full bg-[#0058be] text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c2c6d6]/30 flex-grow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111c2d] font-heading">
                History
              </h3>
              <button className="text-[#0058be] text-sm font-bold hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {COMPETITOR_HISTORY_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="p-3 rounded-lg bg-[#f0f3ff] border border-[#c2c6d6]/20 hover:bg-[#e7eeff] flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <History className="size-5 text-[#424754]" />
                    <div>
                      <p className="font-bold text-sm text-[#111c2d]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#424754]">{item.time}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-[#727785] group-hover:text-[#0058be] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - LLM Insights + Data Table */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
          {/* LLM Insights Banner */}
          <div className="bg-[#2170e4] p-6 rounded-xl shadow-md text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="size-5" />
                <span className="text-xs font-semibold uppercase tracking-widest">
                  LLM Parsed Insights
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
                  <p className="font-bold text-sm">Pricing Strategy</p>
                  <p className="text-sm opacity-90 mt-1 italic">
                    &quot;Highly aggressive pricing on cold brew detected. $0.50
                    lower than your current margin.&quot;
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
                  <p className="font-bold text-sm">Seasonal Trends</p>
                  <p className="text-sm opacity-90 mt-1 italic">
                    &quot;Focusing on seasonal pumpkin spice with premium
                    upcharge for oat milk alternatives.&quot;
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Sparkles className="size-[200px]" />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-[#c2c6d6]/30 flex-grow overflow-hidden">
            <div className="px-6 py-4 border-b border-[#c2c6d6]/30 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111c2d] font-heading">
                Extracted Data
              </h3>
              <button className="flex items-center gap-2 px-3 py-1 bg-[#e7eeff] text-[#0058be] rounded-md font-bold text-sm hover:bg-[#dee8ff] transition-all">
                <Download className="size-3.5" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f3ff]">
                    <th className="px-6 py-4 text-xs font-semibold text-[#424754] uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#424754] uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#424754] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#424754] uppercase tracking-wider">
                      Promo Found
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#424754] uppercase tracking-wider">
                      Match Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c2c6d6]/20">
                  {COMPETITOR_TABLE_DATA.map((row) => (
                    <tr
                      key={row.name}
                      className="hover:bg-[#f0f3ff] transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-[#111c2d]">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">{row.price}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#dee8ff] text-[#424754] rounded text-xs font-bold uppercase">
                          {row.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {row.promo ? (
                          <span className="px-2 py-1 bg-[#6cf8bb] text-[#00714d] rounded text-xs font-bold uppercase">
                            {row.promo}
                          </span>
                        ) : (
                          <span className="text-[#727785] text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-16 bg-[#e7eeff] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#0058be] h-full rounded-full"
                            style={{ width: `${row.score}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/70 backdrop-blur p-6 rounded-xl border border-[#c2c6d6]/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#0058be]/10 flex items-center justify-center text-[#0058be]">
            <SearchCode className="size-6" />
          </div>
          <div>
            <p className="text-[#727785] text-xs uppercase font-bold tracking-tighter">
              Items Tracked
            </p>
            <p className="text-2xl font-bold text-[#111c2d]">142</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur p-6 rounded-xl border border-[#c2c6d6]/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <p className="text-[#727785] text-xs uppercase font-bold tracking-tighter">
              Price Deviations
            </p>
            <p className="text-2xl font-bold text-[#111c2d]">12</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur p-6 rounded-xl border border-[#c2c6d6]/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#825100]/10 flex items-center justify-center text-[#825100]">
            <Zap className="size-6" />
          </div>
          <div>
            <p className="text-[#727785] text-xs uppercase font-bold tracking-tighter">
              Agent Speed
            </p>
            <p className="text-2xl font-bold text-[#111c2d]">1.2s</p>
          </div>
        </div>
      </div>
    </div>
  );
}
