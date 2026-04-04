// src/app/(public)/properties/[slug]/page.tsx
// Redirection to /property/[slug] for backend URL compatibility

import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PropiedadesRedirectPage({ params }: Props) {
  const { slug } = await params;
  // Redirects to the correct route /property/[slug]
  redirect(`/propiedad/${slug}`);
}
