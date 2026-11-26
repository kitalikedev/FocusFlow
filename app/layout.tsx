import type { Metadata, Viewport } from 'next';
import type React from 'react';
import '../src/app/index.css';

export const metadata: Metadata = {
  title: 'FocusFlow',
  description: 'FocusFlow — Aesthetic Focus Timer & Workspace for deep work and mindful productivity.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

/** Root layout of the Next.js App Router: the page shell every route is rendered into. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
