'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'monogram_pwa_dismissed';

function isDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  return sessionStorage.getItem(DISMISS_KEY) === 'true';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isIOSSafari(): boolean {
  if (!isIOS()) return false;
  const ua = navigator.userAgent;
  // Safari on iOS: has Safari in UA but NOT CriOS/FxiOS/EdgiOS
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, 'true');
    setVisible(false);
    setShowAndroid(false);
    setShowIOS(false);
  }, []);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    // Android / desktop Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari — show after a short delay so the page loads first
    if (isIOSSafari()) {
      const t = setTimeout(() => {
        setShowIOS(true);
        setVisible(true);
      }, 3000);
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        clearTimeout(t);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      dismiss();
    }
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-3 right-3 z-[60] animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-border p-4" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="w-12 h-12 rounded-xl bg-pattern-brown flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-xl" style={{ color: '#FFA800' }}>M</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-display font-bold text-[#663f30] text-sm">Install MONOGRAM</p>

            {showAndroid && (
              <>
                <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen for quick access — works like a native app.</p>
                <button
                  onClick={handleInstall}
                  className="mt-2.5 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: '#663f30' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#533226')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#663f30')}
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
              </>
            )}

            {showIOS && (
              <>
                <p className="text-xs text-muted-foreground mt-0.5">Install for quick access — it&apos;ll work like an app on your phone.</p>
                <div className="mt-2.5 flex items-start gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
                  <Share className="w-4 h-4 shrink-0 mt-0.5 text-[#663f30]" />
                  <span>Tap the <strong className="text-foreground">Share</strong> button in Safari, then tap <strong className="text-foreground">&quot;Add to Home Screen&quot;</strong>.</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
