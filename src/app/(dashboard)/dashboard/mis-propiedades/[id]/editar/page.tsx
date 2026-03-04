'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DashboardEditPropertyRedirectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  useEffect(() => {
    if (params?.id) router.replace(`/mis-propiedades/${params.id}/editar`);
  }, [router, params?.id]);

  return null;
}
