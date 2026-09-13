'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'monogram_pwa_dismissed';
const INSTALLED_KEY = 'monogram_pwa_installed';
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function isDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  const dismissed = localStorage.getItem(DISMISS_KEY);
  return !!dismissed && Date.now() - parseInt(dismissed) < COOLDOWN_MS;
}

function isInstalled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(INSTALLED_KEY) === 'true';
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
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
    setShowAndroid(false);
    setShowIOS(false);
  }, []);

  useEffect(() => {
    if (isStandalone() || isInstalled() || isDismissed()) return;

    // Android / desktop Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
      setVisible(true);
    };
    const installedHandler = () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setVisible(false);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    // iOS Safari — show after a short delay so the page loads first
    if (isIOSSafari()) {
      const t = setTimeout(() => {
        setShowIOS(true);
        setVisible(true);
      }, 3000);
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('appinstalled', installedHandler);
        clearTimeout(t);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, 'true');
    }
    // Whether accepted or declined, the native prompt is now spent and
    // deferredPrompt is being cleared below - hide the banner either way
    // so a decline doesn't leave a dead "Install App" button on screen.
    dismiss();
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-3 right-3 z-[60] animate-in slide-in-from-bottom-4 duration-500">
      <div className="relative max-w-xs mx-auto bg-white rounded-2xl border border-border p-3" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-2.5">
          {/* App icon */}
          <div className="w-9 h-9 rounded-lg bg-pattern-brown flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-base" style={{ color: '#FFA800' }}>M</span>
          </div>

          <div className="min-w-0 flex-1 pr-3">
            <p className="font-display font-bold text-[#663f30] text-xs">Install MONOGRAM</p>

            {showAndroid && (
              <>
                <p className="text-[11px] leading-snug text-muted-foreground mt-0.5 break-words">Add to your home screen for quick access.</p>
                <button
                  onClick={handleInstall}
                  className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: '#663f30' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#533226')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#663f30')}
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
              </>
            )}

            {showIOS && (
              <>
                <p className="text-[11px] leading-snug text-muted-foreground mt-0.5 break-words">Works like an app on your phone.</p>
                <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground bg-muted/60 rounded-lg px-2.5 py-1.5 break-words">
                  <Share className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#663f30]" />
                  <span>Tap <strong className="text-foreground">Share</strong>, then <strong className="text-foreground">&quot;Add to Home Screen&quot;</strong>.</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
