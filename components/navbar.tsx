'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, GraduationCap, LogIn, UserPlus, LayoutDashboard, LogOut, Shield, MessageCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notification-bell';

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';
  const pathname = usePathname();
  const onDashboard = pathname === '/dashboard';
  const onSettings = pathname?.startsWith('/dashboard/settings') ?? false;
  const activeCls = 'bg-[#FFA800] text-[#663f30] hover:bg-[#FFA800] hover:text-[#663f30]';

  return (
    <header className="sticky top-0 z-50 bg-[#f0e6df]/95 backdrop-blur-md border-b border-[#663f30]/10">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-freezone text-2xl tracking-tight" style={{ color: '#663f30' }}>
          <GraduationCap className="w-7 h-7" style={{ color: '#FFA800' }} />
          MONOGRAM
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 md:ml-8 lg:ml-12">
          <Link href="/" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">Home</Link>
          <Link href="/schools" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">Schools</Link>
          <Link href="/about" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">About</Link>
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <>
              <NotificationBell />
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/messages"><MessageCircle className="w-4 h-4 mr-1" />Messages</Link>
              </Button>
              {isAdmin && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin"><Shield className="w-4 h-4 mr-1" />Admin</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm" className={onDashboard ? activeCls : ''}>
                <Link href="/dashboard"><LayoutDashboard className="w-4 h-4 mr-1" />Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className={onSettings ? activeCls : ''}>
                <Link href="/dashboard/settings"><Settings className="w-4 h-4 mr-1" />Settings</Link>
              </Button>
              <span className="text-sm font-medium max-w-[100px] truncate" style={{ color: '#663f30' }} title={user?.username}>
                {user?.username}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut({ redirectTo: '/' })}>
                <LogOut className="w-4 h-4 mr-1" />Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login"><LogIn className="w-4 h-4 mr-1" />Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#663f30] hover:bg-[#533226] text-white">
                <Link href="/signup"><UserPlus className="w-4 h-4 mr-1" />Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#663f30]/10 bg-[#f0e6df] pb-4 px-4">
          <nav className="flex flex-col gap-1 py-2">
            <Link href="/" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/schools" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>Schools</Link>
            <Link href="/about" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>About</Link>
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {session ? (
              <>
                {isAdmin && (
                  <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                    <Link href="/admin"><Shield className="w-4 h-4 mr-1" />Admin</Link>
                  </Button>
                )}
                <Button asChild variant="ghost" size="sm" className={onDashboard ? activeCls : ''} onClick={() => setOpen(false)}>
                  <Link href="/dashboard"><LayoutDashboard className="w-4 h-4 mr-1" />Dashboard</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className={onSettings ? activeCls : ''} onClick={() => setOpen(false)}>
                  <Link href="/dashboard/settings"><Settings className="w-4 h-4 mr-1" />Settings</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => { signOut({ redirectTo: '/' }); setOpen(false); }}>
                  <LogOut className="w-4 h-4 mr-1" />Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  <Link href="/login"><LogIn className="w-4 h-4 mr-1" />Login</Link>
                </Button>
                <Button asChild size="sm" className="bg-[#663f30] hover:bg-[#533226] text-white" onClick={() => setOpen(false)}>
                  <Link href="/signup"><UserPlus className="w-4 h-4 mr-1" />Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
