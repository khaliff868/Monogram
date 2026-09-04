'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  recipientId: string;
  listingId?: string;
  label?: string;
  className?: string;
}

export function MessageUserButton({ recipientId, listingId, label = 'Message', className }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const currentUserId = (session?.user as any)?.id;

  if (currentUserId && currentUserId === recipientId) return null;

  const handleClick = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, listingId }),
      });
      if (res.ok) {
        const conv = await res.json();
        router.push(`/dashboard/messages/${conv.id}`);
      } else {
        toast.error('Could not start conversation');
      }
    } catch {
      toast.error('Could not start conversation');
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className ?? 'inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-[#663f30] text-white hover:bg-[#533226] transition-colors font-medium disabled:opacity-50'}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3" />}
      {label}
    </button>
  );
}
