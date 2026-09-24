'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sun, Moon, Monitor, User, Bell, Shield, MessageSquare, Sparkles, Link2, HelpCircle,
  Lock, Trash2, ChevronDown, ChevronUp, Save, Loader2, Palette, Facebook, Instagram,
  Zap, Globe, Mail, Flag, FileText, BookOpen, Download,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Switch } from '@/components/ui/switch';
import { defaultPreferences, TT_LOCATIONS, type UserPreferences } from '@/lib/user-preferences';

type Profile = { username: string; email: string; name: string; phone: string; whatsapp: string; location: string; bio: string };
const emptyProfile: Profile = { username: '', email: '', name: '', phone: '', whatsapp: '', location: '', bio: '' };

// ============================================================
// REUSABLE PIECES
// ============================================================

function SectionCard({ icon: Icon, iconColor, title, description, children, defaultOpen = false }: {
  icon: React.ElementType; iconColor: string; title: string; description: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor}`}><Icon className="w-5 h-5" /></div>
          <div className="text-left">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 sm:px-6 pb-6 border-t border-border pt-4 space-y-4">{children}</div>}
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return <SettingRow label={label} description={description}><Switch checked={checked} onCheckedChange={onChange} disabled={disabled} /></SettingRow>;
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#FFA800]/50 focus:border-[#FFA800] outline-none transition';

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />;
}

function TextAreaInput({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${inputCls} resize-none`} />;
}

function SelectInput({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)} className={inputCls}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-foreground mb-1">{children}</label>;
}

function SubSectionLabel({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2 pb-1 border-b border-border">{children}</h4>;
}

function SupportItem({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition text-sm text-foreground">
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="flex-1 text-left font-medium">{label}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 pt-3 border-t border-border bg-muted/30 space-y-3 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h4 className="font-semibold text-foreground">{children}</h4>;
}

function Bullets({ items }: { items: string[] }) {
  return <ul className="list-disc pl-4 space-y-1">{items.map(i => <li key={i}>{i}</li>)}</ul>;
}

// ============================================================
// SETTINGS PAGE
// ============================================================

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [prefs, setPrefs] = useState<UserPreferences>(defaultPreferences);
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const res = await fetch('/api/user/preferences');
        if (res.ok) {
          const data = await res.json();
          const p = data.profile ?? {};
          setProfile({
            username: p.username ?? '', email: p.email ?? '', name: p.name ?? '', phone: p.phone ?? '',
            whatsapp: p.whatsapp ?? '', location: p.location ?? '', bio: p.bio ?? '',
          });
          if (data.preferences) setPrefs({ ...defaultPreferences, ...data.preferences });
        } else {
          toast.error('Could not load your settings');
        }
      } catch {
        toast.error('Could not load your settings');
      }
      setLoading(false);
    })();
  }, []);

  const updateProfile = (field: keyof Profile, value: string) => setProfile(p => ({ ...p, [field]: value }));
  const updatePref = <K extends keyof UserPreferences>(field: K, value: UserPreferences[K]) => setPrefs(p => ({ ...p, [field]: value }));

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, preferences: prefs }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) toast.success('Settings saved successfully');
      else toast.error(data.error || 'Failed to save settings');
    } catch {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pw.new !== pw.confirm) { toast.error('New passwords do not match'); return; }
    if (pw.new.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPw(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.new }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { toast.success('Password changed successfully'); setPw({ current: '', new: '', confirm: '' }); }
      else toast.error(data.error || 'Failed to change password');
    } catch {
      toast.error('Failed to change password');
    }
    setChangingPw(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (res.ok) { toast.success('Account deleted'); signOut({ redirectTo: '/' }); return; }
      toast.error('Failed to delete account');
    } catch {
      toast.error('An error occurred');
    }
    setDeleting(false);
  };

  const notificationsOff = !prefs.enableAllNotifications;

  const saveButton = (label: string) => (
    <button type="button" onClick={saveSettings} disabled={saving || loading} className="flex items-center gap-2 px-5 py-2.5 bg-[#FFA800] hover:bg-[#E08E00] text-[#663f30] rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-[#FFA800]/20">
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {saving ? 'Saving...' : label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gradient-to-br from-[#663f30] to-[#0f1d3d] py-10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-white/70 text-sm mt-1">Manage your account, notifications and privacy</p>
          </div>
          {saveButton('Save All')}
        </div>
      </section>

      <section className="py-8 bg-background flex-1">
        <div className="max-w-4xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#663f30]" /></div>
          ) : (
            <div className="space-y-4">

              {/* 1. APPEARANCE */}
              <SectionCard icon={Palette} iconColor="bg-[#FFA800]/15 text-[#E08E00]" title="Appearance" description="Customize how Monogram looks on your device" defaultOpen>
                <SettingRow label="Theme" description="Choose your preferred color mode">
                  {mounted && (
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                      {[{ val: 'light', icon: Sun, label: 'Light' }, { val: 'dark', icon: Moon, label: 'Dark' }, { val: 'system', icon: Monitor, label: 'System' }].map(({ val, icon: Ic, label }) => (
                        <button key={val} type="button" onClick={() => setTheme(val)} className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${theme === val ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                          <Ic className="w-4 h-4" /><span className="hidden sm:inline">{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </SettingRow>
                <ToggleRow label="Compact mode" description="Reduce spacing and use smaller elements" checked={prefs.compactMode} onChange={v => updatePref('compactMode', v)} />
                <ToggleRow label="Reduce motion" description="Minimize animations and transitions" checked={prefs.reduceMotion} onChange={v => updatePref('reduceMotion', v)} />
              </SectionCard>

              {/* 2. ACCOUNT */}
              <SectionCard icon={User} iconColor="bg-teal-500/10 text-teal-600" title="Account" description="Your profile and account information">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><FieldLabel>Full Name</FieldLabel><TextInput value={profile.name} onChange={v => updateProfile('name', v)} placeholder="Your full name" /></div>
                    <div><FieldLabel>Username</FieldLabel><TextInput value={profile.username} onChange={v => updateProfile('username', v)} placeholder="How you appear to others" /></div>
                  </div>
                  <div><FieldLabel>Email Address</FieldLabel><TextInput value={profile.email} onChange={v => updateProfile('email', v)} placeholder="you@email.com" type="email" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><FieldLabel>Phone Number</FieldLabel><TextInput value={profile.phone} onChange={v => updateProfile('phone', v)} placeholder="+1 (868) 000-0000" /></div>
                    <div><FieldLabel>WhatsApp Number</FieldLabel><TextInput value={profile.whatsapp} onChange={v => updateProfile('whatsapp', v)} placeholder="+1 (868) 000-0000" /></div>
                  </div>
                  <div><FieldLabel>Location / Region</FieldLabel><SelectInput value={profile.location} onChange={v => updateProfile('location', v)} options={TT_LOCATIONS.map(l => ({ value: l, label: l }))} placeholder="Select your location" /></div>
                  <div><FieldLabel>Bio</FieldLabel><TextAreaInput value={profile.bio} onChange={v => updateProfile('bio', v)} placeholder="Tell other parents and students a bit about yourself..." /></div>
                </div>
                <SubSectionLabel>Change Password</SubSectionLabel>
                <div className="grid gap-3">
                  <TextInput value={pw.current} onChange={v => setPw(p => ({ ...p, current: v }))} placeholder="Current password" type="password" />
                  <TextInput value={pw.new} onChange={v => setPw(p => ({ ...p, new: v }))} placeholder="New password (min 6 characters)" type="password" />
                  <TextInput value={pw.confirm} onChange={v => setPw(p => ({ ...p, confirm: v }))} placeholder="Confirm new password" type="password" />
                  <button type="button" onClick={handleChangePassword} disabled={changingPw || !pw.current || !pw.new} className="self-start flex items-center gap-2 px-4 py-2 bg-[#663f30] hover:bg-[#533226] text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                    {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}Update Password
                  </button>
                  <p className="text-xs text-muted-foreground">Forgot it? <Link href="/forgot-password" className="underline hover:text-foreground">Reset it by email</Link>.</p>
                </div>
              </SectionCard>

              {/* 3. NOTIFICATIONS */}
              <SectionCard icon={Bell} iconColor="bg-orange-500/10 text-orange-500" title="Notifications" description="Control how and when you receive alerts">
                <SubSectionLabel>General</SubSectionLabel>
                <ToggleRow label="Enable all notifications" description="Master toggle for all notifications" checked={prefs.enableAllNotifications} onChange={v => updatePref('enableAllNotifications', v)} />
                <ToggleRow label="In-app notifications" checked={prefs.inAppNotifications} onChange={v => updatePref('inAppNotifications', v)} disabled={notificationsOff} />
                <ToggleRow label="Email notifications" checked={prefs.emailNotifications} onChange={v => updatePref('emailNotifications', v)} disabled={notificationsOff} />
                <ToggleRow label="Push notifications" checked={prefs.pushNotifications} onChange={v => updatePref('pushNotifications', v)} disabled={notificationsOff} />
                <SubSectionLabel>Listings & Uploads</SubSectionLabel>
                <ToggleRow label="Listing approved" checked={prefs.notifyListingApproved} onChange={v => updatePref('notifyListingApproved', v)} disabled={notificationsOff} />
                <ToggleRow label="Listing rejected" checked={prefs.notifyListingRejected} onChange={v => updatePref('notifyListingRejected', v)} disabled={notificationsOff} />
                <ToggleRow label="Past paper approved" checked={prefs.notifyPastPaperApproved} onChange={v => updatePref('notifyPastPaperApproved', v)} disabled={notificationsOff} />
                <ToggleRow label="Past paper rejected" checked={prefs.notifyPastPaperRejected} onChange={v => updatePref('notifyPastPaperRejected', v)} disabled={notificationsOff} />
                <ToggleRow label="eBook approved" checked={prefs.notifyEbookApproved} onChange={v => updatePref('notifyEbookApproved', v)} disabled={notificationsOff} />
                <SubSectionLabel>Messages & Community</SubSectionLabel>
                <ToggleRow label="New message received" checked={prefs.notifyNewMessage} onChange={v => updatePref('notifyNewMessage', v)} disabled={notificationsOff} />
                <ToggleRow label="Updates on my reports" checked={prefs.notifyReportUpdates} onChange={v => updatePref('notifyReportUpdates', v)} disabled={notificationsOff} />
                <ToggleRow label="Updates from my favourite schools" checked={prefs.notifyFavoriteSchoolUpdates} onChange={v => updatePref('notifyFavoriteSchoolUpdates', v)} disabled={notificationsOff} />
                <SubSectionLabel>Account</SubSectionLabel>
                <ToggleRow label="Password changed" checked={prefs.notifyPasswordChanged} onChange={v => updatePref('notifyPasswordChanged', v)} disabled={notificationsOff} />
                <ToggleRow label="Security alerts" checked={prefs.notifySecurityAlert} onChange={v => updatePref('notifySecurityAlert', v)} disabled={notificationsOff} />
                <ToggleRow label="Monogram announcements" checked={prefs.notifyAnnouncements} onChange={v => updatePref('notifyAnnouncements', v)} disabled={notificationsOff} />
                <ToggleRow label="Promotional emails" checked={prefs.notifyPromotionalEmails} onChange={v => updatePref('notifyPromotionalEmails', v)} disabled={notificationsOff} />
              </SectionCard>

              {/* 4. PRIVACY & SECURITY */}
              <SectionCard icon={Shield} iconColor="bg-blue-500/10 text-blue-500" title="Privacy & Security" description="Control your visibility and protect your account">
                <SettingRow label="Profile visibility" description="Who can see your profile">
                  <SelectInput value={prefs.profileVisibility} onChange={v => updatePref('profileVisibility', v)} options={[{ value: 'public', label: 'Public' }, { value: 'members', label: 'Members only' }, { value: 'private', label: 'Private' }]} />
                </SettingRow>
                <ToggleRow label="Show phone number" description="Display your phone on your profile" checked={prefs.showPhone} onChange={v => updatePref('showPhone', v)} />
                <ToggleRow label="Show WhatsApp number" checked={prefs.showWhatsapp} onChange={v => updatePref('showWhatsapp', v)} />
                <ToggleRow label="Show email address" checked={prefs.showEmail} onChange={v => updatePref('showEmail', v)} />
                <ToggleRow label="Allow search engine indexing" description="Let Google and others find your profile" checked={prefs.allowSearchEngineIndex} onChange={v => updatePref('allowSearchEngineIndex', v)} />
                <SubSectionLabel>Account Actions</SubSectionLabel>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a href="/api/user/export" className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm font-medium text-foreground hover:bg-muted/70 transition"><Download className="w-4 h-4" />Download My Data</a>
                  <button type="button" onClick={() => setDeleteConfirm(!deleteConfirm)} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition"><Trash2 className="w-4 h-4" />Delete Account</button>
                </div>
                {deleteConfirm && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300 mb-3">⚠️ This is permanent and cannot be undone. Your account, listings, eBooks, favourites and messages will be deleted.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleDeleteAccount} disabled={deleting} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50">
                        {deleting && <Loader2 className="w-4 h-4 animate-spin" />}Permanently Delete
                      </button>
                      <button type="button" onClick={() => setDeleteConfirm(false)} className="px-4 py-2 bg-muted rounded-lg text-sm font-medium text-foreground hover:bg-muted/70 transition">Cancel</button>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* 5. MESSAGING */}
              <SectionCard icon={MessageSquare} iconColor="bg-indigo-500/10 text-indigo-500" title="Messaging & Chat" description="Control your messaging experience">
                <ToggleRow label="Allow other users to message me" description="When off, nobody can start a new conversation with you" checked={prefs.allowMessages} onChange={v => updatePref('allowMessages', v)} />
                <ToggleRow label="Mute message sounds" checked={prefs.muteMessageSounds} onChange={v => updatePref('muteMessageSounds', v)} />
                <ToggleRow label="Email me when I get a message" checked={prefs.emailOnMessage} onChange={v => updatePref('emailOnMessage', v)} />
                <ToggleRow label="Show read receipts" checked={prefs.showReadReceipts} onChange={v => updatePref('showReadReceipts', v)} />
                <ToggleRow label="Show online status" checked={prefs.showOnlineStatus} onChange={v => updatePref('showOnlineStatus', v)} />
                <div><FieldLabel>Auto-reply message when unavailable</FieldLabel><TextAreaInput value={prefs.autoReplyMessage} onChange={v => updatePref('autoReplyMessage', v)} placeholder="e.g., Thanks for your message! I'll get back to you soon." rows={2} /></div>
              </SectionCard>

              {/* 6. PERSONALIZATION */}
              <SectionCard icon={Sparkles} iconColor="bg-pink-500/10 text-pink-500" title="Saved Preferences & Personalization" description="Control how Monogram personalizes your experience">
                <ToggleRow label="Save recently viewed schools" description="When off, schools you visit aren't added to your Recent tab" checked={prefs.saveRecentlyViewed} onChange={v => updatePref('saveRecentlyViewed', v)} />
                <ToggleRow label="Personalized recommendations" description="Get suggestions based on your activity" checked={prefs.personalizedRecs} onChange={v => updatePref('personalizedRecs', v)} />
                <ToggleRow label="Show my favourite schools first" checked={prefs.showFavoriteSchoolsFirst} onChange={v => updatePref('showFavoriteSchoolsFirst', v)} />
                <ToggleRow label="Homepage personalization" checked={prefs.homepagePersonalization} onChange={v => updatePref('homepagePersonalization', v)} />
              </SectionCard>

              {/* 7. CONNECTED ACCOUNTS */}
              <SectionCard icon={Link2} iconColor="bg-violet-500/10 text-violet-500" title="Connected Accounts & Social Links" description="Link your social profiles">
                <div className="grid gap-4">
                  <div><FieldLabel><span className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> Facebook</span></FieldLabel><TextInput value={prefs.facebookUrl} onChange={v => updatePref('facebookUrl', v)} placeholder="https://facebook.com/yourpage" /></div>
                  <div><FieldLabel><span className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> Instagram</span></FieldLabel><TextInput value={prefs.instagramUrl} onChange={v => updatePref('instagramUrl', v)} placeholder="https://instagram.com/yourhandle" /></div>
                  <div><FieldLabel><span className="flex items-center gap-2"><Zap className="w-4 h-4" /> TikTok</span></FieldLabel><TextInput value={prefs.tiktokUrl} onChange={v => updatePref('tiktokUrl', v)} placeholder="https://tiktok.com/@yourhandle" /></div>
                  <div><FieldLabel><span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Website</span></FieldLabel><TextInput value={prefs.websiteUrl} onChange={v => updatePref('websiteUrl', v)} placeholder="https://yourwebsite.com" /></div>
                </div>
              </SectionCard>

              {/* 8. SUPPORT & LEGAL */}
              <SectionCard icon={HelpCircle} iconColor="bg-gray-500/10 text-gray-500" title="Support & Legal" description="Get help and review our policies">
                <div className="grid gap-2">
                  <SupportItem icon={HelpCircle} label="Help Center">
                    <p>Monogram is Trinidad &amp; Tobago&apos;s school directory. Find your school, then buy or sell books, uniforms and shoes, download past papers and eBooks, and message other parents and students.</p>
                    <H>Finding Your School</H>
                    <p>Use the search on the homepage or the Schools page. Tap the heart on a school to save it to your Favorites.</p>
                    <H>Creating a Listing</H>
                    <Bullets items={['Open your school page and choose Books, Uniforms, Shoes or Other', 'Add a clear title, the price and the condition', 'Upload up to 5 real photos', 'Add your contact details so buyers can reach you', 'Listings are reviewed by an admin before they go live']} />
                    <H>Past Papers & eBooks</H>
                    <Bullets items={['Upload past papers from your school page — you can submit up to 30 at a time', 'Uploads are checked by an admin before they appear', 'Downloads are free and unlimited']} />
                    <H>Safety Tips</H>
                    <Bullets items={['Meet in public places, ideally at or near the school', 'Bring someone with you, especially if you are a student', 'Inspect items before paying', 'Never share passwords or banking details', 'Report suspicious users or listings right away']} />
                  </SupportItem>

                  <SupportItem icon={Mail} label="Contact Support">
                    <p>Our team can help with account problems, listings that aren&apos;t showing, upload issues, and suspicious or abusive behaviour.</p>
                    <H>What to Include</H>
                    <Bullets items={['Your username and account email', 'A clear description of the problem', 'Screenshots, if you have them', 'Your device and browser for technical issues']} />
                    <p>Use the Report button on any listing, past paper or user to reach the admin team directly.</p>
                  </SupportItem>

                  <SupportItem icon={Flag} label="Report a Problem">
                    <p>If you find a bug, a broken page, a fake listing or inappropriate content, please report it so we can investigate.</p>
                    <H>What Can Be Reported</H>
                    <Bullets items={['Technical bugs or broken features', 'Fake or misleading listings', 'Incorrect or copyrighted past papers', 'Harassment or spam messages', 'Inappropriate content']} />
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg"><p className="text-xs text-red-700 dark:text-red-300"><strong>Urgent safety issues:</strong> if someone is in danger or a crime has happened, contact the police first. A platform report does not replace emergency services.</p></div>
                  </SupportItem>

                  <SupportItem icon={FileText} label="Terms of Service">
                    <div><H>1. Acceptance</H><p>By using Monogram you agree to these terms. If you do not agree, please do not use the platform.</p></div>
                    <div><H>2. What Monogram Is</H><p>Monogram is a directory and community for Trinidad &amp; Tobago schools. Users can list school items, share past papers and eBooks, and message each other. Monogram is not a party to sales between users.</p></div>
                    <div><H>3. Your Account</H><p>Keep your details accurate and your password private. You are responsible for activity on your account.</p></div>
                    <div><H>4. Listings & Uploads</H><p>Listings must be truthful and uploads must be material you have the right to share. We may remove content that breaks these rules.</p></div>
                    <div><H>5. Prohibited Conduct</H><Bullets items={['Posting illegal, stolen or counterfeit items', 'Harassing or threatening other users', 'Uploading copyrighted material you do not have rights to', 'Spam, scams or fake accounts']} /></div>
                    <div><H>6. Suspension</H><p>We may suspend or remove accounts or content that break these terms or put users at risk.</p></div>
                    <div><H>7. Disclaimer</H><p>Monogram is provided &quot;as is&quot;. We do not guarantee the accuracy of listings, past papers or school information.</p></div>
                    <div><H>8. Changes</H><p>We may update these terms. Continuing to use Monogram means you accept the updated version.</p></div>
                  </SupportItem>

                  <SupportItem icon={Shield} label="Privacy Policy">
                    <p>We collect only what we need to run Monogram: your account details, the content you post, messages sent through the platform, and basic usage data.</p>
                    <p>We never sell your personal information. You can download or delete your data at any time from Privacy &amp; Security above.</p>
                    <Link href="/privacy" className="inline-block font-medium text-[#663f30] dark:text-[#FFA800] underline">Read the full Privacy Policy</Link>
                  </SupportItem>

                  <SupportItem icon={BookOpen} label="Community Guidelines">
                    <p>Monogram is used by parents, students and teachers. Keep it respectful, honest and safe.</p>
                    {[
                      { title: '1. Be Respectful', dos: ['Communicate politely', 'Respect other people’s time'], donts: ['Harass, insult or threaten anyone', 'Send spam or repeated messages'] },
                      { title: '2. Be Honest', dos: ['Describe items accurately', 'Use real photos', 'Mention any damage'], donts: ['Misrepresent items', 'Post items you don’t have'] },
                    ].map(({ title, dos, donts }) => (
                      <div key={title}>
                        <H>{title}</H>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded-lg"><p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">✅ Do</p><ul className="text-xs space-y-0.5">{dos.map(d => <li key={d}>• {d}</li>)}</ul></div>
                          <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded-lg"><p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">❌ Do not</p><ul className="text-xs space-y-0.5">{donts.map(d => <li key={d}>• {d}</li>)}</ul></div>
                        </div>
                      </div>
                    ))}
                    <div><H>3. Keep Students Safe</H><Bullets items={['Meet in public places', 'Never ask students for personal information', 'Report anything that makes you uncomfortable']} /></div>
                    <div><H>4. Enforcement</H><p>Breaking these guidelines can lead to content removal, suspension or a permanent ban.</p></div>
                  </SupportItem>
                </div>
              </SectionCard>

            </div>
          )}

          {!loading && (
            <div className="sticky bottom-20 md:bottom-4 mt-8 z-10">
              <div className="bg-card rounded-2xl border border-border shadow-xl p-4 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Remember to save your changes</p>
                {saveButton('Save All Settings')}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
