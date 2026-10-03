'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Pencil, Check, X, Tag, Phone, Mail, MessageSquare, Facebook, Instagram, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

type AdPricing = {
  id: string;
  title: string;
  price: number;
  durationDays: number;
  note: string | null;
};

type SiteSettings = {
  id: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  facebook: string;
  instagram: string;
  twitter: string;
};

export default function AdvertisingPricingPage() {
  const { data: session } = useSession() || {};
  const isAdmin = (session?.user as any)?.role === 'admin';

  // Contact Details State
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Pricing State
  const [pricing, setPricing] = useState<AdPricing[]>([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [editingPricing, setEditingPricing] = useState(false);
  const [pricingDraft, setPricingDraft] = useState<AdPricing[]>([]);
  const [savingPricing, setSavingPricing] = useState(false);

  useEffect(() => {
    // Fetch site settings
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          setSettings(data.settings);
          setSettingsDraft(data.settings);
        }
      })
      .catch(() => toast.error('Failed to load contact details'))
      .finally(() => setSettingsLoading(false));

    // Fetch pricing
    fetch('/api/ad-pricing')
      .then(r => r.json())
      .then(data => {
        setPricing(data.pricing || []);
        setPricingDraft(data.pricing || []);
      })
      .catch(() => toast.error('Failed to load pricing'))
      .finally(() => setPricingLoading(false));
  }, []);

  const handleSettingsSave = async () => {
    if (!settingsDraft) return;
    setSavingSettings(true);
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsDraft),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      setSettings(settingsDraft);
      setEditingSettings(false);
      toast.success('Contact details updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save contact details');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePricingSave = async () => {
    setSavingPricing(true);
    try {
      const results = await Promise.all(
        pricingDraft.map(item =>
          fetch('/api/ad-pricing', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        )
      );
      const failed = results.find(r => !r.ok);
      if (failed) {
        const err = await failed.json().catch(() => ({}));
        throw new Error(err.error || 'One or more items failed to save');
      }
      setPricing(pricingDraft);
      setEditingPricing(false);
      toast.success('Pricing updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save pricing');
    } finally {
      setSavingPricing(false);
    }
  };

  const handleSettingsFieldChange = (field: keyof SiteSettings, value: string) => {
    if (settingsDraft) {
      setSettingsDraft({ ...settingsDraft, [field]: value });
    }
  };

  const handlePricingFieldChange = (id: string, field: keyof AdPricing, value: any) => {
    setPricingDraft(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA800] to-[#ff9500] flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: '#663f30' }}>Contact / Advertise on Monogram</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Reach out to us for support, advertising, or marketplace inquiries.
            </p>
          </div>
        </div>

        {/* Contact Details Header with Admin Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Details</h2>
          </div>
          {isAdmin && !editingSettings && (
            <button
              onClick={() => setEditingSettings(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
          {isAdmin && editingSettings && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSettingsDraft(settings);
                  setEditingSettings(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSettingsSave}
                disabled={savingSettings}
                className="flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
                style={{ backgroundColor: '#FFA800' }}
              >
                {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          )}
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {settingsLoading ? (
            <div className="flex items-center justify-center py-12 md:col-span-2">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#FFA800' }} />
            </div>
          ) : editingSettings && settingsDraft ? (
            <>
              {/* Phone Edit */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phone</h3>
                </div>
                <input
                  type="text"
                  value={settingsDraft.contactPhone}
                  onChange={e => handleSettingsFieldChange('contactPhone', e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>

              {/* WhatsApp Edit */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">WhatsApp</h3>
                </div>
                <input
                  type="text"
                  value={settingsDraft.contactWhatsapp}
                  onChange={e => handleSettingsFieldChange('contactWhatsapp', e.target.value)}
                  placeholder="WhatsApp number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>

              {/* Email Edit */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h3>
                </div>
                <input
                  type="email"
                  value={settingsDraft.contactEmail}
                  onChange={e => handleSettingsFieldChange('contactEmail', e.target.value)}
                  placeholder="Email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFA800]"
                />
              </div>

              {/* Social Media Edit */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Facebook</label>
                    <input
                      type="text"
                      value={settingsDraft.facebook}
                      onChange={e => handleSettingsFieldChange('facebook', e.target.value)}
                      placeholder="Facebook URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFA800]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instagram</label>
                    <input
                      type="text"
                      value={settingsDraft.instagram}
                      onChange={e => handleSettingsFieldChange('instagram', e.target.value)}
                      placeholder="Instagram URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFA800]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Twitter</label>
                    <input
                      type="text"
                      value={settingsDraft.twitter}
                      onChange={e => handleSettingsFieldChange('twitter', e.target.value)}
                      placeholder="Twitter URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFA800]"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : settings ? (
            <>
              {/* Phone */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phone</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium select-all">{settings.contactPhone || '—'}</p>
              </div>

              {/* WhatsApp */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">WhatsApp</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium select-all">{settings.contactWhatsapp || '—'}</p>
              </div>

              {/* Email */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium select-all">{settings.contactEmail || '—'}</p>
              </div>

              {/* Message Admin */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm md:col-span-2 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#FFA800]/20 dark:bg-[#FFA800]/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" style={{ color: '#FFA800' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message Admin</h3>
                </div>
                <button className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 mt-auto" style={{ borderColor: '#FFA800', color: '#663f30' }}>
                  <MessageSquare className="w-5 h-5" />
                  Message Admin
                </button>
              </div>

              {/* Social Media */}
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <Facebook className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Facebook</p>
                      <p className="text-gray-900 dark:text-white font-medium select-all truncate">{settings.facebook || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Instagram</p>
                      <p className="text-gray-900 dark:text-white font-medium select-all truncate">{settings.instagram || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <Twitter className="w-5 h-5 text-blue-400 dark:text-blue-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Twitter</p>
                      <p className="text-gray-900 dark:text-white font-medium select-all truncate">{settings.twitter || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm md:col-span-2">No contact details available.</p>
          )}
        </div>

        {/* Advertising Pricing Header with Admin Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFA800]/20 dark:bg-[#FFA800]/10 flex items-center justify-center">
              <Tag className="w-5 h-5" style={{ color: '#FFA800' }} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Advertising Pricing</h2>
          </div>
          {isAdmin && !editingPricing && (
            <button
              onClick={() => {
                setPricingDraft(pricing);
                setEditingPricing(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Pricing
            </button>
          )}
          {isAdmin && editingPricing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPricingDraft(pricing);
                  setEditingPricing(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handlePricingSave}
                disabled={savingPricing}
                className="flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
                style={{ backgroundColor: '#FFA800' }}
              >
                {savingPricing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          )}
        </div>

        {/* Advertising Pricing Card */}
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm">

          {pricingLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#FFA800' }} />
            </div>
          ) : editingPricing ? (
            <div className="space-y-3">
              {pricingDraft.map(item => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg items-center">
                  <input
                    value={item.title}
                    onChange={e => handlePricingFieldChange(item.id, 'title', e.target.value)}
                    placeholder="Category"
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2"
                    style={{ focusRing: '#FFA800' }}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={e => handlePricingFieldChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="Price"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={item.durationDays}
                      onChange={e => handlePricingFieldChange(item.id, 'durationDays', parseInt(e.target.value) || 30)}
                      placeholder="Days"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2"
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">days</span>
                  </div>
                  <input
                    value={item.note || ''}
                    onChange={e => handlePricingFieldChange(item.id, 'note', e.target.value)}
                    placeholder="Note (optional)"
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2"
                  />
                </div>
              ))}
            </div>
          ) : pricing.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No pricing information available.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {pricing.map(item => (
                <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                    {item.note && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({item.note})</span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold" style={{ color: '#FFA800' }}>
                      {item.price === 0 ? 'Free' : '$' + item.price.toLocaleString('en-US') + ' TTD'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/ {item.durationDays} days</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
