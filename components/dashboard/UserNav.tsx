'use client';

import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
        className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d2ff] to-[#a78bfa] flex items-center justify-center text-xs font-bold text-white shadow-md shadow-[#00d2ff]/10">
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
        <span className="text-xs font-semibold text-white hidden sm:block" style={{ fontFamily: 'var(--font-montserrat)' }}>
          {session.user.name}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-2 w-64 py-2 glass-card rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden"
          >
            {/* User info */}
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#a78bfa] flex items-center justify-center text-sm font-bold text-white">
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
                  <p className="text-white text-sm font-bold truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {session.user.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[#859399]" />
                    <p className="text-[#859399] text-[11px] truncate">{session.user.email}</p>
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
                  window.location.href = '/auth/login';
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#859399] hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
              >
                <LogOut className="w-4 h-4 group-hover:text-red-400" />
                <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-montserrat)' }}>Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
