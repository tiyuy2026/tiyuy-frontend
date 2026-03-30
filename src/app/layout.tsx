'use client';

import type { Metadata } from 'next';
import { Hind } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './globals.css';
import { Header } from '@/presentation/components/layout/Header/Header';
import { FirebaseTest } from '@/components/FirebaseTest';
import { metadata } from './metadata';

const hind = Hind({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'] 
});

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="es">
        <head>
          {/* ✅ MercadoPago SDK */}
          <script src="https://sdk.mercadopago.com/js/v2" async />
        </head>
        <body className={hind.className} suppressHydrationWarning>
          <Header />
          <Toaster richColors position="top-right" />
          {children}
        </body>
      </html>
    </QueryClientProvider>
  );
}
