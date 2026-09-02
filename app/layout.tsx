import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EchoSphere — Adaptive Multi-Persona Voice Interview Platform',
  description:
    'Real-time adaptive voice interview platform built on Agora Conversational AI and LangGraph meta-orchestration.',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-light-surface text-deep-indigo font-sora antialiased selection:bg-yellow-accent selection:text-deep-indigo">
        {children}
      </body>
    </html>
  );
}
