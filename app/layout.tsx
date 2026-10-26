import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://convert.my.id';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'convert.my.id – Free, Instant & Private Online Converters',
    template: '%s',
  },
  description:
    '100% Client-side online converters on convert.my.id. Convert Code & Dev, Image & Media, CSS & Unit, and Text & Data formats locally in your browser with zero server uploads.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'convert.my.id',
    title: 'convert.my.id – Free, Instant & Private Online Converters',
    description:
      '100% Client-side. Your files and data never leave your browser. 100 instant developer, image, CSS, and data conversion tools.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'convert.my.id – Free, Instant & Private Online Converters',
    description:
      '100% Client-side. Your files and data never leave your browser.',
  },
  robots: {
    index: true,
    follow: true,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
