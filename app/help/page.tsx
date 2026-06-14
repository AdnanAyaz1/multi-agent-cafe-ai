'use client';

import Link from 'next/link';
import { ArrowLeft, HelpCircle, Mail, MessageSquare, BookOpen } from 'lucide-react';
import { HELP_FAQS } from '@/constants/faqs';

export default function HelpPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0e0c0a' }}>
      <nav
        className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-white/[0.06]"
        style={{ background: 'rgba(14, 12, 10, 0.85)', backdropFilter: 'blur(20px)' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e07850] to-[#c8a070] flex items-center justify-center">
            <span className="text-[#1a1208] font-bold text-xs">C</span>
          </div>
          <span className="text-white text-sm font-bold">CafePromo AI</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-zinc-400" />
          <p className="text-[11px] text-zinc-400 uppercase tracking-[0.2em] font-semibold">Support</p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">Help Center</h1>
        <p className="text-zinc-400 text-sm lg:text-base max-w-lg mb-10">
          Everything you need to know about CafePromo AI.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: BookOpen, label: 'Docs', href: '#' },
            { icon: MessageSquare, label: 'Feedback', href: '#' },
            { icon: Mail, label: 'Contact', href: 'mailto:support@cafepromo.ai' },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="dash-glass rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-[#e07850]/20 transition-colors"
            >
              <div className="icon-glow w-10 h-10 rounded-xl bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#e07850]" />
              </div>
              <span className="text-white text-sm font-semibold">{label}</span>
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-[#e07850]" />
            Frequently Asked Questions
          </h2>
          {HELP_FAQS.map((faq) => (
            <details
              key={faq.q}
              className="dash-glass rounded-2xl overflow-hidden group"
            >
              <summary className="px-6 py-4 cursor-pointer text-white text-sm font-semibold list-none flex items-center justify-between hover:text-[#e07850] transition-colors">
                {faq.q}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform text-xs">&#9660;</span>
              </summary>
              <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
