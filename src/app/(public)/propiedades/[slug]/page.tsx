// src/app/(public)/propiedades/[slug]/page.tsx
// Redirección a /propiedad/[slug] para mantener compatibilidad con URLs del backend

import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PropiedadesRedirectPage({ params }: Props) {
  const { slug } = await params;
  // Redirige a la ruta correcta /propiedad/[slug]
  redirect(`/propiedad/${slug}`);
}
