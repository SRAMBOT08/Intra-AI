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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
