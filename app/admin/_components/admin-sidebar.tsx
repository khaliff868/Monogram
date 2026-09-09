'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, GraduationCap, Megaphone, ImageIcon, Users, Settings, ArrowLeft, BookOpen, FileText, Store, Flag, BarChart3, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/schools', label: 'Schools', icon: GraduationCap },
  { href: '/admin/listings', label: 'Listings', icon: BookOpen },
  { href: '/admin/past-papers', label: 'Past Papers', icon: FileText },
  { href: '/admin/ebooks', label: 'E-Books', icon: Library },
  { href: '/admin/suppliers', label: 'Suppliers', icon: Store },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/advertisements', label: 'Advertisements', icon: ImageIcon },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      <div className="bg-card rounded-xl p-3" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="mb-3 px-2">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Site
          </Link>
        </div>
        <nav className="space-y-0.5">
          {links.map(link => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-pattern-brown text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
