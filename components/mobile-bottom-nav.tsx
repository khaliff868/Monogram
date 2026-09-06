'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, GraduationCap, Search, LayoutDashboard, LogIn, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname() || '/';
  const { data: session } = useSession();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!session) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages');
        if (res.ok) {
          const conversations = await res.json();
          const total = (conversations || []).reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
          setUnreadMessages(total);
        }
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Hide on admin pages (admin has its own layout)
  if (pathname.startsWith('/admin')) return null;

  const items = [
    { href: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
    { href: '/schools', label: 'Schools', icon: GraduationCap, match: (p: string) => p.startsWith('/schools') },
    { href: '/search', label: 'Search', icon: Search, match: (p: string) => p.startsWith('/search') },
    ...(session ? [{ href: '/dashboard/messages', label: 'Messages', icon: MessageCircle, match: (p: string) => p.startsWith('/dashboard/messages'), badge: unreadMessages }] : []),
    session
      ? { href: '/dashboard', label: 'Account', icon: LayoutDashboard, match: (p: string) => p.startsWith('/dashboard') && !p.startsWith('/dashboard/messages') }
      : { href: '/login', label: 'Login', icon: LogIn, match: (p: string) => p.startsWith('/login') },
  ];

  return (
    <>
      <div className="md:hidden h-16" aria-hidden="true" />
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border" style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <div className="flex items-stretch justify-around">
          {items.map((item: any) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors',
                  active ? 'text-[#663f30]' : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <item.icon className={cn('w-5 h-5', active && 'text-[#FFA800]')} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold text-white rounded-full" style={{ backgroundColor: '#FFA800' }}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
