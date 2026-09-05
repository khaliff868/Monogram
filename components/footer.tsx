'use client';

import Link from 'next/link';
import { GraduationCap, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-pattern-brown-tile text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 font-freezone text-xl mb-3">
              <GraduationCap className="w-6 h-6" style={{ color: '#FFA800' }} />
              MONOGRAM
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Trinidad & Tobago&apos;s premier school directory. Connecting students, parents and communities with the resources they need.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#FFA800' }}>Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">Home</Link>
              <Link href="/schools" className="text-sm text-white/70 hover:text-white transition-colors">Schools</Link>
              <Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors">About</Link>
              <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
            </nav>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#FFA800' }}>Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">&copy; 2026 MONOGRAM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
