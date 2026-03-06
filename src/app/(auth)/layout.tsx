import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Autenticación - TIYUY',
  description: 'Inicia sesión o regístrate en TIYUY',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">{children}</div>
  );
}
