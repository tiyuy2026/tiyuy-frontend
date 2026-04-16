/**
 * Admin Layout
 * El header y sidebar están encapsulados dentro de GitHubShell
 */

'use client';

import { ReactNode } from 'react';
import { AdminGuard } from '@/presentation/components/guards/AdminGuard';
import { GitHubShell } from '@/presentation/components/admin/AdminShell/AdminShell';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <GitHubShell>
        {children}
      </GitHubShell>
    </AdminGuard>
  );
}