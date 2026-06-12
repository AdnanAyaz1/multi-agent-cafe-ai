"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-800 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-semibold text-white">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <span className="text-sm font-medium hidden sm:block">{session.user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 py-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50">
          <div className="px-4 py-2 border-b border-slate-800">
            <p className="text-sm font-medium text-white">{session.user.name}</p>
            <p className="text-xs text-slate-400">{session.user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
