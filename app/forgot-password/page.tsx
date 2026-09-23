'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        toast.success('Check your email for the reset link');
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
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
        </div>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Check Your Email</h2>
            <p className="text-sm text-muted-foreground mb-4">
              If an account exists with this email, a password reset link has been sent.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>
            <button onClick={() => setSubmitted(false)} className="text-sm font-medium hover:underline" style={{ color: '#663f30' }}>
              Try another email
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Reset Your Password</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <Input id="email" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="mt-1" />
              </div>
              <Button type="submit" loading={loading} className="w-full bg-[#663f30] hover:bg-[#533226] text-white">
                <Send className="w-4 h-4 mr-1" /> Send Reset Link
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
