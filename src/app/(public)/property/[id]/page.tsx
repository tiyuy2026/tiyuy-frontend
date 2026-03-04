// src/app/(public)/property/[id]/page.tsx - Nueva ruta para IDs
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';
import { PropertyDetail } from '@/presentation/components/property/PropertyDetail';
import { TrackPropertyView } from '@/presentation/components/property/TrackPropertyView';
import Script from 'next/script';

interface Props {
  params: Promise<{ id: string }>;
}

const propertyRepo = new PropertyRepository();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const property = await propertyRepo.getById(Number(id));
    
    if (!property) {
      return {
        title: 'Propiedad no encontrada | TIYUY',
      };
    }

    return {
      title: `${property.title} | TIYUY`,
      description: property.description || `Propiedad en ${property.location?.district || 'Perú'}`,
      keywords: [
        property.type,
        property.transactionType,
        property.location?.district,
        property.location?.province,
        'inmobiliaria',
        'perú',
        'tiyuy'
      ].filter(Boolean),
      openGraph: {
        title: property.title,
        description: property.description || `Propiedad en ${property.location?.district || 'Perú'}`,
        images: property.coverPhotoUrl ? [{
          url: property.coverPhotoUrl,
          width: 1200,
          height: 630,
          alt: property.title,
        }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: property.title,
        description: property.description || `Propiedad en ${property.location?.district || 'Perú'}`,
        images: property.coverPhotoUrl ? [{
          url: property.coverPhotoUrl,
          alt: property.title,
        }] : [],
      },
      alternates: {
        canonical: `https://tiyuy.com/property/${id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Propiedad no encontrada | TIYUY',
    };
  }
}

export default async function PropertyPage({ params }: Props) {
  let property;
  
  try {
    const { id } = await params;
    property = await propertyRepo.getById(Number(id));
  } catch (error) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    description: property.description,
    image: property.coverPhotoUrl,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location?.district,
      addressRegion: property.location?.province,
      addressCountry: 'PE',
    },
  };

  return (
    <>
      <Script
        id="property-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <TrackPropertyView propertyId={property.id} />
      
      <PropertyDetail property={property} />
    </>
  );
}
