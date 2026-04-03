'use client';

import { usePropertyById } from '@/presentation/hooks/useProperties';
import { PropertyForm } from '@/presentation/components/property/PropertyForm';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';

export default function EditPropertyClient({ id }: { id: number }) {
  const { data: property, isLoading } = usePropertyById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Propiedad no encontrada</h2>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <PropertyForm mode="edit" property={property} />
    </ProtectedRoute>
  );
}
