'use client';

import { MapPin, Phone, Mail, MessageCircle, Globe, CheckCircle, Store } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  BOOKS: 'Books',
  UNIFORMS: 'Uniforms',
  SHOES: 'Shoes',
  SUPPLIES: 'Supplies',
  OTHER: 'Other',
};

interface SupplierProps {
  supplier: {
    id: string;
    businessName: string;
    description: string | null;
    categories: string[];
    location: string | null;
    phone: string | null;
    email: string | null;
    whatsApp: string | null;
    website: string | null;
    verified: boolean;
    supplierSchools?: { school: { name: string; slug: string } }[];
  };
}

export function SupplierCard({ supplier }: SupplierProps) {
  const whatsAppLink = supplier.whatsApp
    ? `https://wa.me/${supplier.whatsApp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi, I found your business on MONOGRAM`)}`
    : null;

  return (
    <div className="bg-background rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#663f30]/10 flex items-center justify-center">
            <Store className="w-4 h-4" style={{ color: '#663f30' }} />
          </div>
          <h4 className="font-semibold text-sm text-foreground">{supplier.businessName}</h4>
        </div>
        {supplier.verified && (
          <span className="flex items-center gap-0.5 text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        )}
      </div>

      {supplier.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{supplier.description}</p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {supplier.categories.map(c => (
          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFA800]/10 font-medium" style={{ color: '#FFA800' }}>
            {categoryLabels[c] || c}
          </span>
        ))}
      </div>

      {supplier.location && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" /> {supplier.location}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {whatsAppLink && (
          <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors font-medium">
            <MessageCircle className="w-3 h-3" /> WhatsApp
          </a>
        )}
        {supplier.phone && (
          <a href={`tel:${supplier.phone}`} className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-[#663f30] text-white hover:bg-[#533226] transition-colors font-medium">
            <Phone className="w-3 h-3" /> Call
          </a>
        )}
        {supplier.email && (
          <a href={`mailto:${supplier.email}`} className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors font-medium">
            <Mail className="w-3 h-3" /> Email
          </a>
        )}
        {supplier.website && (
          <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium">
            <Globe className="w-3 h-3" /> Website
          </a>
        )}
      </div>
    </div>
  );
}
