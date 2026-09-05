'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MonogramCrest } from '@/components/monogram-crest';
import { FadeIn, SlideIn } from '@/components/ui/animate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Globe, Phone, Mail, Calendar, Heart, Share2, Download, BookOpen, Shirt, ShoppingBag, FileText, Store, Plus, MessageCircle, Tag, Clock, CheckCircle, User, BadgeCheck, Flag, BookMarked } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { ListingCard } from '@/components/listing-card';
import { PastPaperList } from '@/components/past-paper-list';
import { EBookList } from '@/components/ebook-list';
import { CreateEbookDialog } from '@/components/create-ebook-dialog';
import { SupplierCard } from '@/components/supplier-card';
import { CreateListingDialog } from '@/components/create-listing-dialog';
import { CreatePastPaperDialog } from '@/components/create-past-paper-dialog';
import { CreateSupplierDialog } from '@/components/create-supplier-dialog';
import { ReportDialog } from '@/components/report-dialog';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => ({ default: m.QRCodeSVG })), { ssr: false, loading: () => <div className="w-32 h-32 bg-muted animate-pulse rounded" /> });

interface SchoolData {
  id: string;
  name: string;
  slug: string;
  location: string;
  region: string;
  type: string;
  gender: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  established: number | null;
  initials: string | null;
  verified?: boolean;
}

export function SchoolDetailClient({ school }: { school: SchoolData }) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState('books');
  const [listings, setListings] = useState<any[]>([]);
  const [pastPapers, setPastPapers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showCreatePaper, setShowCreatePaper] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [showCreateEbook, setShowCreateEbook] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [papersLoading, setPapersLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [ebooksLoading, setEbooksLoading] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const categoryMap: Record<string, string> = {
    books: 'BOOKS',
    uniforms: 'UNIFORMS',
    shoes: 'SHOES',
  };

  // Check favorite status on mount
  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/favorites/check?schoolId=${school.id}`)
      .then(r => r.json())
      .then(d => { if (d?.favorited) setIsFavorited(true); })
      .catch(() => {});
  }, [session, school.id]);

  const fetchListings = useCallback(async (category: string) => {
    const cat = categoryMap[category];
    if (!cat) return;
    setListingsLoading(true);
    try {
      const res = await fetch(`/api/listings?schoolId=${school.id}&category=${cat}&status=approved`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch { setListings([]); }
    setListingsLoading(false);
  }, [school.id]);

  const fetchPapers = useCallback(async () => {
    setPapersLoading(true);
    try {
      const res = await fetch(`/api/past-papers?schoolId=${school.id}&status=approved`);
      const data = await res.json();
      setPastPapers(data.papers || []);
    } catch { setPastPapers([]); }
    setPapersLoading(false);
  }, [school.id]);

  const fetchSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    try {
      const res = await fetch(`/api/suppliers?schoolId=${school.id}&status=approved`);
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch { setSuppliers([]); }
    setSuppliersLoading(false);
  }, [school.id]);

  const fetchEbooks = useCallback(async () => {
    setEbooksLoading(true);
    try {
      const res = await fetch(`/api/ebooks?schoolId=${school.id}&status=approved`);
      const data = await res.json();
      setEbooks(data.ebooks || []);
    } catch { setEbooks([]); }
    setEbooksLoading(false);
  }, [school.id]);

  useEffect(() => {
    if (['books', 'uniforms', 'shoes'].includes(activeTab)) {
      fetchListings(activeTab);
    } else if (activeTab === 'papers') {
      fetchPapers();
    } else if (activeTab === 'suppliers') {
      fetchSuppliers();
    } else if (activeTab === 'ebooks') {
      fetchEbooks();
    }
  }, [activeTab, fetchListings, fetchPapers, fetchSuppliers, fetchEbooks]);

  const toggleFavorite = async () => {
    if (!session) { toast.error('Please log in to favorite schools'); return; }
    try {
      const res = await fetch('/api/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId: school?.id }),
      });
      if (res.ok) {
        setIsFavorited(!isFavorited);
        toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
      }
    } catch { toast.error('Failed to update favorites'); }
  };

  const handleShare = async () => {
    if (navigator?.share) {
      try { await navigator.share({ title: school?.name, url: pageUrl }); } catch {}
    } else {
      await navigator?.clipboard?.writeText?.(pageUrl);
      toast.success('Link copied to clipboard');
    }
  };

  const typeColor = school?.type === 'Government' ? 'bg-blue-100 text-blue-800' : school?.type === 'Denominational' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';

  const handleListingCreated = () => {
    setShowCreateListing(false);
    toast.success('Listing submitted for review!');
    fetchListings(activeTab);
  };

  const handlePaperCreated = () => {
    setShowCreatePaper(false);
    toast.success('Past paper submitted for review!');
    fetchPapers();
  };

  const handleSupplierCreated = () => {
    setShowCreateSupplier(false);
    toast.success('Supplier submitted for review!');
    fetchSuppliers();
  };

  const handleEbookCreated = () => {
    setShowCreateEbook(false);
    toast.success('E-book submitted for review!');
    fetchEbooks();
  };

  function EmptyState({ label, icon }: { label: string; icon: React.ReactNode }) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center text-muted-foreground">{icon}</div>
        <p className="text-sm text-muted-foreground">No {label} listings yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Be the first to add one.</p>
      </div>
    );
  }

  function LoadingState() {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-6 h-6 border-2 border-[#FFA800] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderListingTab = (category: string, label: string, icon: React.ReactNode) => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm" style={{ color: '#663f30' }}>{label}</h3>
        {session && (
          <Button size="sm" onClick={() => setShowCreateListing(true)} className="bg-[#663f30] hover:bg-[#533226] text-white text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add {label.slice(0, -1)}
          </Button>
        )}
      </div>
      {listingsLoading ? <LoadingState /> : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : <EmptyState label={label.toLowerCase().slice(0, -1)} icon={icon} />}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-pattern-brown-tile py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <SlideIn from="bottom">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <MonogramCrest initials={school?.initials ?? school?.name?.charAt?.(0) ?? 'S'} size={120} />
              <div className="text-center md:text-left">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{school?.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColor}`}>{school?.type}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/10 text-white">{school?.gender}</span>
                  {school?.verified && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#FFA800]/20 text-[#FFA800] flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-white/70 text-sm justify-center md:justify-start">
                  <MapPin className="w-4 h-4" />
                  <span>{school?.location}, {school?.region}</span>
                </div>
              </div>
            </div>
          </SlideIn>
        </div>
      </section>

      <section className="py-8 bg-background flex-1">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <FadeIn>
                {school?.description && (
                  <div className="bg-card rounded-xl p-6 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}>
                    <p className="text-sm text-card-foreground leading-relaxed">{school.description}</p>
                  </div>
                )}

                {/* Tabs */}
                <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 p-0 h-auto flex-wrap">
                      <TabsTrigger value="books" className="rounded-none bg-blue-50 data-[state=active]:bg-blue-100 data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] px-4 py-3 text-xs">
                        <BookOpen className="w-3.5 h-3.5 mr-1" /> Text Books
                      </TabsTrigger>
                      <TabsTrigger value="ebooks" className="rounded-none bg-purple-50 data-[state=active]:bg-purple-100 data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] px-4 py-3 text-xs">
                        <BookMarked className="w-3.5 h-3.5 mr-1" /> E-Books
                      </TabsTrigger>
                      <TabsTrigger value="papers" className="rounded-none bg-amber-50 data-[state=active]:bg-amber-100 data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] px-4 py-3 text-xs">
                        <FileText className="w-3.5 h-3.5 mr-1" /> Past Papers
                      </TabsTrigger>
                      <TabsTrigger value="uniforms" className="rounded-none bg-pink-50 data-[state=active]:bg-pink-100 data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] px-4 py-3 text-xs">
                        <Shirt className="w-3.5 h-3.5 mr-1" /> Uniforms
                      </TabsTrigger>
                      <TabsTrigger value="shoes" className="rounded-none bg-green-50 data-[state=active]:bg-green-100 data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] px-4 py-3 text-xs">
                        <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Shoes
                      </TabsTrigger>
                      <TabsTrigger value="suppliers" className="rounded-none bg-teal-50 data-[state=active]:bg-teal-100 data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] px-4 py-3 text-xs">
                        <Store className="w-3.5 h-3.5 mr-1" /> Suppliers
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="books">{renderListingTab('BOOKS', 'Books', <BookOpen className="w-5 h-5" />)}</TabsContent>
                    <TabsContent value="uniforms">{renderListingTab('UNIFORMS', 'Uniforms', <Shirt className="w-5 h-5" />)}</TabsContent>
                    <TabsContent value="shoes">{renderListingTab('SHOES', 'Shoes', <ShoppingBag className="w-5 h-5" />)}</TabsContent>

                    <TabsContent value="papers">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display font-semibold text-sm" style={{ color: '#663f30' }}>Past Papers</h3>
                          {session && (
                            <Button size="sm" onClick={() => setShowCreatePaper(true)} className="bg-[#663f30] hover:bg-[#533226] text-white text-xs">
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add Paper
                            </Button>
                          )}
                        </div>
                        {papersLoading ? <LoadingState /> : pastPapers.length > 0 ? (
                          <PastPaperList papers={pastPapers} />
                        ) : <EmptyState label="past paper" icon={<FileText className="w-5 h-5" />} />}
                      </div>
                    </TabsContent>

                    <TabsContent value="suppliers">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display font-semibold text-sm" style={{ color: '#663f30' }}>School Suppliers</h3>
                          {session && (
                            <Button size="sm" onClick={() => setShowCreateSupplier(true)} className="bg-[#663f30] hover:bg-[#533226] text-white text-xs">
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add Supplier
                            </Button>
                          )}
                        </div>
                        {suppliersLoading ? <LoadingState /> : suppliers.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {suppliers.map(s => <SupplierCard key={s.id} supplier={s} />)}
                          </div>
                        ) : <EmptyState label="supplier" icon={<Store className="w-5 h-5" />} />}
                      </div>
                    </TabsContent>

                    <TabsContent value="ebooks">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display font-semibold text-sm" style={{ color: '#663f30' }}>E-Books</h3>
                          {session && (
                            <Button size="sm" onClick={() => setShowCreateEbook(true)} className="bg-[#663f30] hover:bg-[#533226] text-white text-xs">
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add E-Book
                            </Button>
                          )}
                        </div>
                        {ebooksLoading ? <LoadingState /> : ebooks.length > 0 ? (
                          <EBookList ebooks={ebooks} />
                        ) : <EmptyState label="e-book" icon={<BookMarked className="w-5 h-5" />} />}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </FadeIn>
            </div>

            {/* Sidebar */}
            <div>
              <FadeIn delay={0.1}>
                <div className="bg-card rounded-xl p-5 mb-4" style={{ boxShadow: 'var(--shadow-md)' }}>
                  <h3 className="font-display font-semibold text-sm mb-4" style={{ color: '#663f30' }}>School Information</h3>
                  <div className="space-y-3">
                    {school?.website && (
                      <a href={school.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#663f30] transition-colors">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{school.website}</span>
                      </a>
                    )}
                    {school?.phone && (
                      <a href={`tel:${school.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#663f30] transition-colors">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span suppressHydrationWarning>{school.phone}</span>
                      </a>
                    )}
                    {school?.email && (
                      <a href={`mailto:${school.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#663f30] transition-colors">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span suppressHydrationWarning>{school.email}</span>
                      </a>
                    )}
                    {school?.established && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Est. {school.established}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  <Button onClick={toggleFavorite} variant="outline" size="sm" className={isFavorited ? 'text-red-500 border-red-200' : ''}>
                    <Heart className={`w-4 h-4 mr-1 ${isFavorited ? 'fill-red-500' : ''}`} />
                    {isFavorited ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                  <Button onClick={handleShare} variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" /> Share
                  </Button>
                  <Button onClick={() => setShowQR(!showQR)} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> {showQR ? 'Hide' : 'Show'} QR Code
                  </Button>
                  {session && (
                    <Button onClick={() => setShowReport(true)} variant="outline" size="sm" className="text-muted-foreground">
                      <Flag className="w-4 h-4 mr-1" /> Report
                    </Button>
                  )}
                </div>

                {showQR && (
                  <div className="bg-card rounded-xl p-5 text-center" style={{ boxShadow: 'var(--shadow-md)' }}>
                    <QRCodeSVG value={pageUrl || `https://monogram.tt/schools/${school?.slug}`} size={160} bgColor="#ffffff" fgColor="#663f30" className="mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">Scan to visit this page</p>
                  </div>
                )}
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Dialogs */}
      {showCreateListing && (
        <CreateListingDialog
          schoolId={school.id}
          schoolName={school.name}
          category={categoryMap[activeTab] || 'BOOKS'}
          onClose={() => setShowCreateListing(false)}
          onCreated={handleListingCreated}
        />
      )}
      {showCreatePaper && (
        <CreatePastPaperDialog
          schoolId={school.id}
          schoolName={school.name}
          onClose={() => setShowCreatePaper(false)}
          onCreated={handlePaperCreated}
        />
      )}
      {showCreateSupplier && (
        <CreateSupplierDialog
          schoolId={school.id}
          schoolName={school.name}
          onClose={() => setShowCreateSupplier(false)}
          onCreated={handleSupplierCreated}
        />
      )}
      {showCreateEbook && (
        <CreateEbookDialog
          schoolId={school.id}
          schoolName={school.name}
          onClose={() => setShowCreateEbook(false)}
          onCreated={handleEbookCreated}
        />
      )}
      {showReport && (
        <ReportDialog
          type="SCHOOL"
          targetId={school.id}
          targetName={school.name}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
