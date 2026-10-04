'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogIn, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GoogleSignInButton } from '@/components/google-sign-in-button';

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error');
    if (err) {
      toast.error(err === 'AccessDenied'
        ? 'This account cannot sign in. Contact support if you think this is a mistake.'
        : 'Sign in failed. Please try again.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        toast.error('Invalid email/username or password');
      } else {
        toast.success('Logged in successfully');
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
          <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <GoogleSignInButton />
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm">Email or Username</Label>
            <Input id="email" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com or username" className="mt-1" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: '#663f30' }}>Forgot Password?</Link>
            </div>
            <div className="relative mt-1">
              <Input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full bg-[#663f30] hover:bg-[#533226] text-white">
            <LogIn className="w-4 h-4 mr-1" /> Sign In
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Don&apos;t have an account? <Link href="/signup" className="font-medium hover:underline" style={{ color: '#663f30' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
