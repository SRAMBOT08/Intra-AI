import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Intra — Voice AI & Intelligent Recruiting Platform',
  description:
    'Every candidate gets a real shot. You get a real signal. Intra Voice AI replaces the resume lottery with structured voice interviews and intelligent ATS workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Sora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-warm-cream text-forest-950 font-sora antialiased selection:bg-emerald-subtle selection:text-emerald-brand">
        {children}
      </body>
    </html>
  );
}
