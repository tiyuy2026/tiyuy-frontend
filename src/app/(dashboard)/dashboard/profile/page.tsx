'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <p className="text-gray-500">Redirigiendo...</p>
      </div>
    </ProtectedRoute>
  );
}
