'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyContactsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mensajes');
  }, [router]);

  return null;
}
