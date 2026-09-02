'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FadeIn, SlideIn } from '@/components/ui/animate';
import { GraduationCap, Search, Users, BookOpen, Mail } from 'lucide-react';

export function AboutClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#663f30] to-[#0f1d3d] py-12">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="font-freezone text-4xl md:text-5xl text-white tracking-tight mb-2">About MONOGRAM</h1>
          <p className="text-white/70 text-sm">Connecting T&T schools and communities</p>
        </div>
      </section>

      <section className="py-12 bg-background flex-1">
        <div className="max-w-[800px] mx-auto px-4">
          {/* What is Monogram */}
          <FadeIn>
            <div className="bg-card rounded-xl p-6 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5" style={{ color: '#FFA800' }} />
                <h2 className="font-display font-semibold text-lg" style={{ color: '#663f30' }}>What is MONOGRAM?</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                MONOGRAM is Trinidad & Tobago&apos;s premier school directory platform. We connect students, parents, and communities with the resources they need — from textbooks and uniforms to past papers and school suppliers. Every school has its own dedicated page with essential information and community-driven listings.
              </p>
            </div>
          </FadeIn>

          {/* Mission */}
          <FadeIn delay={0.1}>
            <div className="bg-card rounded-xl p-6 mb-6" style={{ boxShadow: 'var(--shadow-md)' }}>
              <h2 className="font-display font-semibold text-lg mb-3" style={{ color: '#663f30' }}>Our Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To create a centralized, easy-to-use platform that empowers the Trinidad & Tobago education community. We believe that access to school resources shouldn&apos;t be fragmented across WhatsApp groups and Facebook posts. MONOGRAM brings it all together in one place.
              </p>
            </div>
          </FadeIn>

          {/* How it works */}
          <FadeIn delay={0.2}>
            <div className="mb-6">
              <h2 className="font-display font-semibold text-lg mb-4 text-center" style={{ color: '#663f30' }}>How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: <Search className="w-6 h-6" />, title: 'Find Your School', desc: 'Search or browse our directory to find your school\'s page.' },
                  { icon: <BookOpen className="w-6 h-6" />, title: 'Explore Resources', desc: 'Browse books, uniforms, past papers and suppliers for your school.' },
                  { icon: <Users className="w-6 h-6" />, title: 'Join the Community', desc: 'Sign up to save favorites, contribute listings, and connect.' },
                ].map((step, i) => (
                  <div key={i} className="bg-card rounded-xl p-5 text-center" style={{ boxShadow: 'var(--shadow-md)' }}>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pattern-brown flex items-center justify-center" style={{ color: '#FFA800' }}>
                      {step.icon}
                    </div>
                    <h3 className="font-display font-semibold text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Contact */}
          <FadeIn delay={0.3}>
            <div className="bg-card rounded-xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5" style={{ color: '#FFA800' }} />
                <h2 className="font-display font-semibold text-lg" style={{ color: '#663f30' }}>Contact Us</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Have questions, suggestions, or want to partner with us? We&apos;d love to hear from you. Reach out to the MONOGRAM team and we&apos;ll get back to you as soon as possible.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
