'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';

interface WeatherSearchFormProps {
  city: string;
  onCityChange: (city: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSearch: () => void;
  loading: boolean;
  error: string | null;
}

export function WeatherSearchForm({ city, onCityChange, onFocus, onBlur, onSearch, loading, error }: WeatherSearchFormProps) {
  return (
    <div className="glass-card rounded-2xl p-1.5 max-w-2xl">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Search city..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#e07850]/30 focus:ring-1 focus:ring-[#e07850]/20 transition-all duration-150"
          />
        </div>
        <button
          onClick={onSearch}
          disabled={loading || !city.trim()}
          className="px-6 py-3 rounded-xl bg-[#e07850] text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all duration-150 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
