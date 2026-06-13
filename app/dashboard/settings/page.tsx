'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-zinc-400" />
          <p className="text-[11px] text-zinc-400 uppercase tracking-[0.2em] font-semibold">Settings</p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
          Settings
        </h1>
        <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
          Manage your account, branch configuration, and preferences.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-6">
          <Settings className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
        <p className="text-zinc-400 text-sm max-w-sm mx-auto">
          Settings page is under development. Branch config, notification preferences, and API keys will be available here.
        </p>
      </div>
    </div>
  );
}
