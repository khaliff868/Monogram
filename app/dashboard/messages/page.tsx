'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Search, Clock, ChevronRight, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface Conversation {
  id: string;
  participant1: { id: string; username: string };
  participant2: { id: string; username: string };
  listing: { id: string; title: string; photos: string[]; category: string } | null;
  messages: { content: string; createdAt: string }[];
  unreadCount: number;
  updatedAt: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMsgQuery, setNewMsgQuery] = useState('');
  const [userResults, setUserResults] = useState<{ id: string; username: string }[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [startingConvo, setStartingConvo] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if ((session?.user as any)?.id) fetchConversations();
  }, [session]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) setConversations(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = newMsgQuery.trim();
    if (q.length < 2) {
      setUserResults([]);
      setShowUserDropdown(false);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setUserResults(data.users || []);
        setShowUserDropdown(true);
      } catch {
        setUserResults([]);
      }
      setSearchingUsers(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [newMsgQuery]);

  const handleStartConversation = async (recipientId: string) => {
    setStartingConvo(recipientId);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
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
    setStartingConvo(null);
  };

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    setDeleting(conversationId);
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        toast.success('Conversation deleted');
      } else {
        toast.error('Failed to delete conversation');
      }
    } catch {
      toast.error('Failed to delete conversation');
    } finally {
      setDeleting(null);
    }
  };

  const currentUserId = (session?.user as any)?.id;
  const getOtherParticipant = (conv: Conversation) =>
    conv.participant1.id === currentUserId ? conv.participant2 : conv.participant1;

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    return (
      other.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.listing?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl" style={{ background: '#663f30' }}>
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: '#663f30' }}>Messages</h1>
              <p className="text-sm text-muted-foreground">Chat with other Monogram users</p>
            </div>
          </div>

          <div className="relative mb-4">
            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Find a user to message..."
              value={newMsgQuery}
              onChange={e => setNewMsgQuery(e.target.value)}
              onFocus={() => { if (userResults.length > 0) setShowUserDropdown(true); }}
              className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
            />
            {searchingUsers && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
            {showUserDropdown && userResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-card rounded-xl border border-border shadow-lg z-20 overflow-hidden">
                {userResults.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    disabled={startingConvo === u.id}
                    onClick={() => handleStartConversation(u.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#663f30' }}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{u.username}</span>
                    {startingConvo === u.id && <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto text-muted-foreground" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA800]"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#663f30] border-t-transparent" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 text-center border border-border">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mb-5">Start a conversation from a listing or supplier page</p>
              <Link href="/schools" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#663f30' }}>
                Browse Schools <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map(conv => {
                const other = getOtherParticipant(conv);
                const lastMessage = conv.messages[0];
                return (
                  <div key={conv.id} className="relative group">
                    <Link
                      href={`/dashboard/messages/${conv.id}`}
                      className="block bg-card hover:bg-muted/50 rounded-xl p-4 transition-colors border border-border pr-14"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: '#663f30' }}>
                            {other.username.charAt(0).toUpperCase()}
                          </div>
                          {conv.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="font-semibold text-sm truncate">{other.username}</h3>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                          {conv.listing && (
                            <p className="text-xs truncate mb-0.5" style={{ color: '#FFA800' }}>Re: {conv.listing.title}</p>
                          )}
                          {lastMessage && (
                            <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Link>
                    <button
                      onClick={e => handleDelete(e, conv.id)}
                      disabled={deleting === conv.id}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {deleting === conv.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
