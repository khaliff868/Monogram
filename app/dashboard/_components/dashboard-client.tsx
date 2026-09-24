'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SchoolCard } from '@/components/school-card';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/animate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Heart, Clock, GraduationCap, Bell, BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { SafeDate } from '@/components/safe-format';

interface UserData {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  role: string;
}

interface School {
  id: string;
  slug: string;
  name: string;
  location: string;
  type: string;
  gender: string;
  initials: string | null;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface MyListing {
  id: string;
  title: string;
  category: string;
  status: string;
  price: number | null;
  createdAt: string;
  school: { name: string };
}

export function DashboardClient({ user, favorites, recentlyViewed, notifications = [], myListings = [] }: { user: UserData | null; favorites: School[]; recentlyViewed: School[]; notifications?: Notification[]; myListings?: MyListing[] }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-gradient-to-br from-[#663f30] to-[#0f1d3d] py-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-white/70 text-sm mt-1">Welcome back, {user?.username ?? 'User'}</p>
        </div>
      </section>

      <section className="py-8 bg-background flex-1">
        <div className="max-w-[1200px] mx-auto px-4">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6 bg-muted flex-wrap">
              <TabsTrigger value="profile"><User className="w-4 h-4 mr-1" /> Profile</TabsTrigger>
              <TabsTrigger value="favorites"><Heart className="w-4 h-4 mr-1" /> Favorites</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1" /> Notifications</TabsTrigger>
              <TabsTrigger value="listings"><BookOpen className="w-4 h-4 mr-1" /> My Listings</TabsTrigger>
              <TabsTrigger value="recent"><Clock className="w-4 h-4 mr-1" /> Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <FadeIn>
                <div className="bg-card rounded-xl p-6 max-w-md" style={{ boxShadow: 'var(--shadow-md)' }}>
                  <h2 className="font-display font-semibold text-lg mb-4" style={{ color: '#663f30' }}>My Profile</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Username</span>
                      <p className="text-sm font-medium">{user?.username ?? 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Email</span>
                      <p className="text-sm font-medium"><span suppressHydrationWarning>{user?.email ?? 'N/A'}</span></p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Joined</span>
                      <p className="text-sm font-medium">{user?.createdAt ? <SafeDate date={user.createdAt} options={{ dateStyle: 'medium' }} /> : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Role</span>
                      <p className="text-sm font-medium capitalize">{user?.role ?? 'user'}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </TabsContent>

            <TabsContent value="favorites">
              <FadeIn>
                {(favorites?.length ?? 0) === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">No favorite schools yet.</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/schools"><GraduationCap className="w-4 h-4 mr-1" /> Browse Schools</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(favorites ?? []).map((s: School) => (
                      <SchoolCard key={s.id} slug={s.slug} name={s.name} location={s.location} type={s.type} gender={s.gender} initials={s.initials} level={s.level} />
                    ))}
                  </div>
                )}
              </FadeIn>
            </TabsContent>

            <TabsContent value="notifications">
              <FadeIn>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No notifications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-2xl">
                    {notifications.map(n => (
                      <div key={n.id} className={`bg-card rounded-xl p-4 flex items-start gap-3 ${!n.read ? 'border-l-4 border-[#FFA800]' : ''}`} style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className={`p-1.5 rounded-full mt-0.5 ${n.type === 'listing_approved' ? 'bg-green-100 text-green-600' : n.type === 'listing_rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {n.type === 'listing_approved' ? <CheckCircle className="w-3.5 h-3.5" /> : n.type === 'listing_rejected' ? <XCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: '#663f30' }}>{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1"><SafeDate date={n.createdAt} options={{ dateStyle: 'medium' }} /></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FadeIn>
            </TabsContent>

            <TabsContent value="listings">
              <FadeIn>
                {myListings.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">You haven&apos;t submitted any listings yet.</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/schools"><GraduationCap className="w-4 h-4 mr-1" /> Browse Schools</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-2xl">
                    {myListings.map(l => (
                      <div key={l.id} className="bg-card rounded-xl p-4 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium" style={{ color: '#663f30' }}>{l.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{l.school?.name} &middot; {l.category}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          l.status === 'approved' ? 'bg-green-100 text-green-800' : l.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>{l.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </FadeIn>
            </TabsContent>

            <TabsContent value="recent">
              <FadeIn>
                {(recentlyViewed?.length ?? 0) === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">No recently viewed schools.</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/schools"><GraduationCap className="w-4 h-4 mr-1" /> Browse Schools</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(recentlyViewed ?? []).map((s: School) => (
                      <SchoolCard key={s.id} slug={s.slug} name={s.name} location={s.location} type={s.type} gender={s.gender} initials={s.initials} level={s.level} />
                    ))}
                  </div>
                )}
              </FadeIn>
            </TabsContent>

          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
