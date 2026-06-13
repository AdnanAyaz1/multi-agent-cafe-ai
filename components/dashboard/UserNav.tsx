'use client';

import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LogOut, Mail } from 'lucide-react';

export function UserNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-colors duration-150 group"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32}
              height={32}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <span className="text-xs font-semibold text-white hidden sm:block">
          {session.user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 py-2 glass-card rounded-2xl shadow-xl shadow-black/30 z-50 overflow-hidden">
          {/* User info */}
          <div className="px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-sm font-bold text-white">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={40}
                    height={40}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">
                  {session.user.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-zinc-400" />
                  <p className="text-zinc-400 text-[11px] truncate">{session.user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={async () => {
                const csrfRes = await fetch('/api/auth/csrf');
                const { csrfToken } = await csrfRes.json();
                await fetch('/api/auth/signout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: new URLSearchParams({ csrfToken }),
                });
                window.location.href = '/';
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150 group"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-400" />
              <span className="text-xs font-semibold">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
