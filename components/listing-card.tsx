'use client';

import { Tag, User, MessageCircle, Phone, Mail, Clock } from 'lucide-react';
import { ClientOnly } from '@/components/client-only';
import { MessageUserButton } from '@/components/message-user-button';

const conditionColors: Record<string, string> = {
  'New': 'bg-green-100 text-green-800',
  'Like New': 'bg-blue-100 text-blue-800',
  'Used': 'bg-amber-100 text-amber-800',
};

interface ListingProps {
  listing: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    condition: string | null;
    price: number | null;
    examType?: string;
    contactPhone: string | null;
    contactEmail: string | null;
    contactWhatsApp: string | null;
    createdAt: string;
    user?: { id: string; username: string };
    school?: { name: string; slug: string };
  };
}

export function ListingCard({ listing }: ListingProps) {
  const whatsAppLink = listing.contactWhatsApp
    ? `https://wa.me/${listing.contactWhatsApp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your listing "${listing.title}" on MONOGRAM`)}`
    : null;

  return (
    <div className="bg-background rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-foreground line-clamp-2">{listing.title}</h4>
        {listing.price != null && (
          <span className="text-sm font-bold whitespace-nowrap" style={{ color: '#FFA800' }}>
            TT${listing.price.toFixed(2)}
          </span>
        )}
      </div>

      {listing.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{listing.description}</p>
      )}

        {listing.examType && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800">
            {listing.examType}
          </span>
        )}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {listing.condition && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${conditionColors[listing.condition] || 'bg-gray-100 text-gray-800'}`}>
            {listing.condition}
          </span>
        )}
        {listing.user && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
            <User className="w-2.5 h-2.5" /> {listing.user.username}
          </span>
        )}
      </div>

      {/* Contact buttons */}
      <div className="flex flex-wrap gap-1.5">
        {whatsAppLink && (
          <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors font-medium">
            <MessageCircle className="w-3 h-3" /> WhatsApp
          </a>
        )}
        {listing.contactPhone && (
          <a href={`tel:${listing.contactPhone}`} className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-[#663f30] text-white hover:bg-[#533226] transition-colors font-medium">
            <Phone className="w-3 h-3" /> Call
          </a>
        )}
        {listing.contactEmail && (
          <a href={`mailto:${listing.contactEmail}`} className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors font-medium">
            <Mail className="w-3 h-3" /> Email
          </a>
        )}
        {listing.user?.id && (
          <MessageUserButton recipientId={listing.user.id} listingId={listing.id} label="Message" />
        )}
      </div>
    </div>
  );
}
