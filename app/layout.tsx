import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://convert.my.id';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      'convert.my.id – Alat Konverter File Online Gratis, Cepat & 100% Privasi (Free Online Converter)',
    template: '%s',
  },
  description:
    'Alat konverter file online gratis 100% client-side di convert.my.id. Konversi gambar (WebP, PNG, JPG, SVG), video & audio (MP4, MP3, WAV), 3D model (OBJ, STL, GLB), kode & data (JSON, CSV, YAML) instan di browser tanpa upload ke server.',
  keywords: [
    'alat konverter file online gratis',
    'konverter file online',
    'free online file converter',
    'convert file online gratis',
    'ubah format file online',
    'konverter gambar online',
    'konverter video ke mp3',
    'json to typescript converter',
    'image to webp converter',
    'mp4 to mp3 converter',
    '3d model converter online',
    'client-side converter',
    'convert.my.id',
  ],
  authors: [{ name: 'convert.my.id', url: SITE_URL }],
  creator: 'convert.my.id',
  publisher: 'convert.my.id',
  category: 'Utilities & Developer Tools',
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/logo.jpg', type: 'image/jpeg' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: ['en_US'],
    url: SITE_URL,
    siteName: 'convert.my.id',
    title:
      'convert.my.id – Alat Konverter File Online Gratis, Instan & 100% Privasi',
    description:
      '200+ alat konverter file online gratis 100% client-side. Konversi Gambar, Audio/Video, Model 3D, CSS, dan Data langsung di browser tanpa upload server.',
    images: [
      {
        url: '/logo.jpg',
        width: 1024,
        height: 1024,
        alt: 'convert.my.id – Alat Konverter File Online Gratis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'convert.my.id – Alat Konverter File Online Gratis & 100% Client-Side',
    description:
      '200+ alat konverter file online gratis di browser kamu tanpa upload server. Cepat, aman, dan tanpa batas.',
    images: ['/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    other: {
      'msvalidate.01': '21DE076E729FB5B2911615629505BF67',
    },
  },
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('convert-my-id-theme');
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

const monetagInPagePushScript = `(function(s){s.dataset.zone='12194738',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="msvalidate.01" content="21DE076E729FB5B2911615629505BF67" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: monetagInPagePushScript }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
