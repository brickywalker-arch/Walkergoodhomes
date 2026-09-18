import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';
import { DEVELOPMENT } from '@/data/development';
import './globals.css';

// Self-hosted at build time by next/font, so no runtime request to Google.
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const title = 'Walker Good Homes — Plots 1 & 2, Hoyle Ing, Linthwaite';
const description =
  'Two attached Yorkshire-stone homes on Land Adjacent 2 Hoyle Ing, Linthwaite, Huddersfield. Three bedrooms over three storeys, two en-suites and a family bathroom in each. Explore the architect’s drawings, step inside room by room and choose your finishes.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://walkergoodhomes.co.uk'),
  title: { default: title, template: '%s — Walker Good Homes' },
  description,
  applicationName: 'Walker Good Homes',
  authors: [{ name: DEVELOPMENT.company }],
  keywords: [
    'new build Huddersfield',
    'Linthwaite new homes',
    'Hoyle Ing',
    'Yorkshire stone homes',
    'Walker Good Homes',
    'HD7 5RX',
  ],
  openGraph: {
    type: 'website',
    siteName: DEVELOPMENT.company,
    title,
    description,
    locale: 'en_GB',
    images: [
      {
        url: '/assets/photo/exterior-dusk-1728.webp',
        width: 1728,
        height: 1104,
        alt: 'Plots 1 and 2, Hoyle Ing — computer-generated image',
      },
    ],
  },
  twitter: { card: 'summary_large_image', title, description },
  icons: { icon: '/favicon.svg' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06223a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>{children}</body>
    </html>
  );
}
