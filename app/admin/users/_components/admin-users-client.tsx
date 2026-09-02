'use client';

import { useState } from 'react';
import { AdminSidebar } from '../../_components/admin-sidebar';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FadeIn } from '@/components/ui/animate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Shield, Ban, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SafeDate } from '@/components/safe-format';

interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  suspended: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export function AdminUsersClient({ users }: { users: UserData[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = (users ?? []).filter((u: UserData) =>
    u?.username?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? '') ||
    u?.email?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? '')
  );

  const handleAction = async (userId: string, action: string) => {
    if (action === 'delete' && !confirm('Delete this user?')) return;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: action === 'delete' ? 'DELETE' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: action !== 'delete' ? JSON.stringify({ action }) : undefined,
    });
    if (res.ok) {
      toast.success('Updated');
      router.refresh();
    } else {
      toast.error('Failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar />
          <main className="flex-1">
            <FadeIn>
              <h1 className="font-display text-2xl font-bold tracking-tight mb-6" style={{ color: '#663f30' }}>Manage Users</h1>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>

              <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Role</TableHead>
                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((u: UserData) => (
                        <TableRow key={u.id} className={u.suspended ? 'opacity-50' : ''}>
                          <TableCell className="text-sm font-medium">{u.username}</TableCell>
                          <TableCell className="text-sm hidden md:table-cell"><span suppressHydrationWarning>{u.email}</span></TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-muted text-muted-foreground'}`}>
                              {u.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell"><SafeDate date={u.createdAt} options={{ dateStyle: 'medium' }} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon-sm" title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'} onClick={() => handleAction(u.id, u.role === 'admin' ? 'demote' : 'promote')}>
                                {u.role === 'admin' ? <ShieldCheck className="w-4 h-4 text-purple-600" /> : <Shield className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon-sm" title={u.suspended ? 'Unsuspend' : 'Suspend'} onClick={() => handleAction(u.id, u.suspended ? 'unsuspend' : 'suspend')}>
                                <Ban className={`w-4 h-4 ${u.suspended ? 'text-orange-600' : ''}`} />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleAction(u.id, 'delete')} className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </FadeIn>
          </main>
        </div>
      </div>
    </div>
  );
}
