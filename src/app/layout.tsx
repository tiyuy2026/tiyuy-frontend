'use client';

import { Hind } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { ConditionalHeader } from '@/presentation/components/layout/ConditionalHeader/ConditionalHeader';
import { ThemeProvider } from '@/presentation/components/ThemeProvider';

const hind = Hind({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'] 
});

// Configuracion de React Query
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
      <html lang="es" suppressHydrationWarning>
        <head>
          <script src="https://sdk.mercadopago.com/js/v2" async />
        </head>
        <body className={hind.className} suppressHydrationWarning>
          <ThemeProvider>
            <ConditionalHeader />
            <Toaster richColors position="top-right" />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </QueryClientProvider>
  );
}
