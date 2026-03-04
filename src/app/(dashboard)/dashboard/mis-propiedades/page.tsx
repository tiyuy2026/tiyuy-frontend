'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardMyPropertiesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mis-propiedades');
  }, [router]);

  return null;
}
