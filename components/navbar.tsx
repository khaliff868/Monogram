'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, GraduationCap, LogIn, UserPlus, LayoutDashboard, LogOut, Shield, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notification-bell';
import { SearchSuggestions } from '@/components/search-suggestions';

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const user = session?.user as any;
  const isAdmin = user?.role === 'admin';

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setOpen(false);
    }
  };

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

        {/* Desktop search */}
        <form onSubmit={submitSearch} className="hidden lg:flex items-center relative mx-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schools, listings..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#FFA800] transition"
          />
          <SearchSuggestions query={query} />
        </form>

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
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard"><LayoutDashboard className="w-4 h-4 mr-1" />Dashboard</Link>
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
          <form onSubmit={submitSearch} className="relative my-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search schools, listings..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#FFA800] transition"
            />
            <SearchSuggestions query={query} />
          </form>
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
                <Button asChild variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  <Link href="/dashboard"><LayoutDashboard className="w-4 h-4 mr-1" />Dashboard</Link>
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
