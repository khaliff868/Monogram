'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Package } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Navbar } from '@/components/navbar';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; username: string };
  read: boolean;
  createdAt: string;
}

interface ConversationData {
  conversation: {
    id: string;
    participant1: { id: string; username: string };
    participant2: { id: string; username: string };
    listing: { id: string; title: string; photos: string[]; category: string; price: number | null } | null;
  };
  messages: Message[];
}

export default function ConversationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [data, setData] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (currentUserId && conversationId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUserId, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        setData(await res.json());
      } else if (res.status === 404) {
        router.push('/dashboard/messages');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) {
        const message = await res.json();
        setData(prev => (prev ? { ...prev, messages: [...prev.messages, message] } : prev));
        setNewMessage('');
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#663f30] border-t-transparent" />
        </div>
      </div>
    );
  }

  const { conversation, messages } = data;
  const otherParticipant = conversation.participant1.id === currentUserId ? conversation.participant2 : conversation.participant1;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard/messages" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: '#663f30' }}>
            {otherParticipant.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{otherParticipant.username}</h2>
            {conversation.listing && (
              <p className="text-xs truncate" style={{ color: '#FFA800' }}>Re: {conversation.listing.title}</p>
            )}
          </div>
        </div>
      </div>

      {conversation.listing && (
        <div className="max-w-3xl mx-auto w-full p-4 pb-0">
          <div className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {conversation.listing.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={conversation.listing.photos[0]} alt={conversation.listing.title} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{conversation.listing.title}</h3>
              {conversation.listing.price && (
                <p className="text-sm font-semibold" style={{ color: '#FFA800' }}>TT${conversation.listing.price.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map(message => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isOwn ? '' : 'bg-card border border-border'}`}
                  style={isOwn ? { background: '#663f30', color: 'white' } : undefined}
                >
                  <p className="break-words">{message.content}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-card border-t border-border p-4">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: '#663f30' }}
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
