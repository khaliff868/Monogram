'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Package, Flag, Ban } from 'lucide-react';
import { toast } from 'sonner';
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
  blockState?: { blockedByMe: boolean; blockedByThem: boolean };
}

interface ReportTarget {
  type: 'user' | 'message';
  id: string;
  name: string;
  preview?: string;
}

const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate or unsafe content' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Something else' },
];

export default function ConversationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [data, setData] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportReason, setReportReason] = useState('harassment');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
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

  const submitReport = async () => {
    if (!reportTarget || reporting) return;
    setReporting(true);
    try {
      const details = [
        `conversation:${conversationId}`,
        reportTarget.preview ? `message: "${reportTarget.preview.slice(0, 300)}"` : '',
        reportDetails.trim(),
      ].filter(Boolean).join(' | ');
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportTarget.type,
          targetId: reportTarget.id,
          targetName: reportTarget.name,
          reason: reportReason,
          details,
        }),
      });
      if (res.ok) {
        toast.success('Report sent. Our team will review it.');
        setReportTarget(null);
        setReportDetails('');
        setReportReason('harassment');
      } else if (res.status === 409) {
        toast.info('You have already reported this.');
        setReportTarget(null);
      } else {
        toast.error('Could not send report');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setReporting(false);
    }
  };

  const toggleBlock = async (otherId: string, otherName: string, currentlyBlocked: boolean) => {
    if (blockBusy) return;
    if (!currentlyBlocked && !confirm(`Block ${otherName}? Neither of you will be able to send messages to the other.`)) return;
    setBlockBusy(true);
    try {
      const res = currentlyBlocked
        ? await fetch(`/api/blocks?userId=${otherId}`, { method: 'DELETE' })
        : await fetch('/api/blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blockedId: otherId }),
          });
      if (res.ok) {
        toast.success(currentlyBlocked ? `${otherName} unblocked` : `${otherName} blocked`);
        await fetchMessages();
      } else {
        toast.error('Something went wrong');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setBlockBusy(false);
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
  const blockedByMe = !!data.blockState?.blockedByMe;
  const cannotReply = blockedByMe || !!data.blockState?.blockedByThem;
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
          <button
            type="button"
            onClick={() => setReportTarget({ type: 'user', id: otherParticipant.id, name: otherParticipant.username })}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors"
            title="Report this user"
          >
            <Flag className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Report</span>
          </button>
          <button
            type="button"
            onClick={() => toggleBlock(otherParticipant.id, otherParticipant.username, blockedByMe)}
            disabled={blockBusy}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            title={blockedByMe ? 'Unblock this user' : 'Block this user'}
          >
            <Ban className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{blockedByMe ? 'Unblock' : 'Block'}</span>
          </button>
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
                  <p className={`text-[10px] mt-1 flex items-center gap-2 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    {!isOwn && (
                      <button
                        type="button"
                        onClick={() => setReportTarget({ type: 'message', id: message.id, name: `Message from ${message.sender.username}`, preview: message.content })}
                        className="underline hover:text-foreground"
                      >
                        Report
                      </button>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-card border-t border-border p-4">
        {cannotReply ? (
          <p className="max-w-3xl mx-auto text-sm text-center text-muted-foreground">
            {blockedByMe
              ? `You have blocked ${otherParticipant.username}. Unblock them to send messages.`
              : 'You can no longer send messages in this conversation.'}
          </p>
        ) : (
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
        )}
      </div>

      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReportTarget(null)}>
          <div className="bg-card rounded-2xl p-5 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-base mb-1" style={{ color: '#663f30' }}>
              {reportTarget.type === 'user' ? `Report ${reportTarget.name}` : 'Report this message'}
            </h3>
            {reportTarget.preview && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 mb-3 break-words">&ldquo;{reportTarget.preview.slice(0, 200)}&rdquo;</p>
            )}
            <label className="block text-xs font-medium mb-1">Reason</label>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className="w-full px-3 py-2 mb-3 bg-muted/40 border border-border rounded-lg text-sm"
            >
              {REPORT_REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <label className="block text-xs font-medium mb-1">Details (optional)</label>
            <textarea
              value={reportDetails}
              onChange={e => setReportDetails(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 mb-4 bg-muted/40 border border-border rounded-lg text-sm"
              placeholder="Tell us what happened"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReportTarget(null)} className="px-4 py-2 text-sm rounded-lg bg-muted">Cancel</button>
              <button
                type="button"
                onClick={submitReport}
                disabled={reporting}
                className="px-4 py-2 text-sm rounded-lg text-white font-semibold disabled:opacity-50"
                style={{ background: '#663f30' }}
              >
                {reporting ? 'Sending...' : 'Send report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
