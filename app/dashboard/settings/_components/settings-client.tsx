'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/ui/animate';
import { Lock, Trash2, Sun, Moon, Monitor, UserCog } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

export function SettingsClient({ user }: { user: { username: string; email: string } | null }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileUsername, setProfileUsername] = useState(user?.username ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profileUsername, email: profileEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Something went wrong');
    }
    setUpdatingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) { toast.error('Please fill in both fields'); return; }
    if (newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setChangingPw(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully');
        setCurrentPw('');
        setNewPw('');
      } else {
        toast.error(data?.error ?? 'Failed to change password');
      }
    } catch {
      toast.error('An error occurred');
    }
    setChangingPw(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Account deleted');
        signOut({ redirectTo: '/' });
      } else {
        toast.error('Failed to delete account');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gradient-to-br from-[#663f30] to-[#0f1d3d] py-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-white/70 text-sm mt-1">Manage your account and preferences</p>
        </div>
      </section>

      <section className="py-8 bg-background flex-1">
        <div className="max-w-[1200px] mx-auto px-4">
          <FadeIn>
            <div className="space-y-6 max-w-md">
              {/* Appearance */}
              <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
                <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#663f30' }}>
                  <Sun className="w-4 h-4" /> Appearance
                </h2>
                {mounted && (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-colors ${theme === 'light' ? 'border-[#FFA800] bg-[#FFA800]/10' : 'border-border hover:bg-muted'}`}
                    >
                      <Sun className="w-4 h-4" /> Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-colors ${theme === 'dark' ? 'border-[#FFA800] bg-[#FFA800]/10' : 'border-border hover:bg-muted'}`}
                    >
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-colors ${theme === 'system' ? 'border-[#FFA800] bg-[#FFA800]/10' : 'border-border hover:bg-muted'}`}
                    >
                      <Monitor className="w-4 h-4" /> System
                    </button>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
                <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#663f30' }}>
                  <UserCog className="w-4 h-4" /> Profile
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <div>
                    <Label className="text-xs">Username</Label>
                    <Input value={profileUsername} onChange={e => setProfileUsername(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} className="mt-1" />
                  </div>
                  <Button type="submit" loading={updatingProfile} size="sm" className="bg-[#663f30] hover:bg-[#533226] text-white">
                    Save Profile
                  </Button>
                </form>
              </div>

              {/* Change password */}
              <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
                <h2 className="font-display font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#663f30' }}>
                  <Lock className="w-4 h-4" /> Change Password
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <Label className="text-xs">Current Password</Label>
                    <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">New Password</Label>
                    <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="mt-1" />
                  </div>
                  <Button type="submit" loading={changingPw} size="sm" className="bg-[#663f30] hover:bg-[#533226] text-white">
                    Update Password
                  </Button>
                </form>
              </div>

              {/* Delete account */}
              <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
                <h2 className="font-display font-semibold text-sm mb-2 flex items-center gap-2 text-destructive">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </h2>
                <p className="text-xs text-muted-foreground mb-3">This action cannot be undone. All your data will be permanently removed.</p>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                  Delete My Account
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
