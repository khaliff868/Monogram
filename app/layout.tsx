import { DM_Sans, Montserrat, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { PwaInstallBanner } from '@/components/pwa-install-banner'
import Providers from './providers'

export const dynamic = 'force-dynamic';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400','500','600','700','800','900'], style: ['normal','italic'], variable: '--font-display' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'MONOGRAM — Your School. Your Community.',
  description: "Trinidad & Tobago's premier school directory — find books, uniforms, past papers and suppliers for every school.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'MONOGRAM — Your School. Your Community.',
    description: "Trinidad & Tobago's premier school directory.",
    images: [{ url: '/og-image.png' }],
    type: 'website',
    siteName: 'MONOGRAM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MONOGRAM — Your School. Your Community.',
    description: "Trinidad & Tobago's premier school directory.",
    images: ['/og-image.png'],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MONOGRAM',
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
}

export const viewport = {
  themeColor: '#663f30',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={`${dmSans.variable} ${montserrat.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <MobileBottomNav />
            <PwaInstallBanner />
            <Toaster />
            <ChunkLoadErrorHandler />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
