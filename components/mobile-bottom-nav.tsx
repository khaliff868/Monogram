'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, GraduationCap, Search, LayoutDashboard, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname() || '/';
  const { data: session } = useSession();

  // Hide on admin pages (admin has its own layout)
  if (pathname.startsWith('/admin')) return null;

  const items = [
    { href: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
    { href: '/schools', label: 'Schools', icon: GraduationCap, match: (p: string) => p.startsWith('/schools') },
    { href: '/search', label: 'Search', icon: Search, match: (p: string) => p.startsWith('/search') },
    session
      ? { href: '/dashboard', label: 'Account', icon: LayoutDashboard, match: (p: string) => p.startsWith('/dashboard') }
      : { href: '/login', label: 'Login', icon: LogIn, match: (p: string) => p.startsWith('/login') },
  ];

  return (
    <>
      <div className="md:hidden h-16" aria-hidden="true" />
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border" style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <div className="flex items-stretch justify-around">
          {items.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors',
                  active ? 'text-[#663f30]' : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5', active && 'text-[#FFA800]')} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
