'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function SignupClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password || !confirmPassword) { toast.error('Please fill in all fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (username.length < 3) { toast.error('Username must be at least 3 characters'); return; }
    if (!agreed) { toast.error('Please accept the terms'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Signup failed');
        setLoading(false);
        return;
      }
      // Auto sign in
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.error) {
        toast.error('Account created but login failed. Please sign in manually.');
        router.push('/login');
      } else {
        toast.success('Welcome to MONOGRAM!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#663f30] to-[#0f1d3d] px-4">
      <div className="w-full max-w-md bg-card rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-xl" style={{ color: '#663f30' }}>
            <GraduationCap className="w-7 h-7" style={{ color: '#FFA800' }} />
            MONOGRAM
          </Link>
          <p className="text-sm text-muted-foreground mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="username" className="text-sm">Username</Label>
            <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm">Password</Label>
            <div className="relative mt-1">
              <Input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirm" className="text-sm">Confirm Password</Label>
            <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="mt-1" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="rounded" />
            <label htmlFor="terms" className="text-xs text-muted-foreground">I agree to the terms and conditions</label>
          </div>

          <Button type="submit" loading={loading} className="w-full bg-[#663f30] hover:bg-[#533226] text-white">
            <UserPlus className="w-4 h-4 mr-1" /> Sign Up
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account? <Link href="/login" className="font-medium hover:underline" style={{ color: '#663f30' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
