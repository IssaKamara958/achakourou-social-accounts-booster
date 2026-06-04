'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react'; // Assuming next-auth is used for session management
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider> {/* Wrap with SessionProvider */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
