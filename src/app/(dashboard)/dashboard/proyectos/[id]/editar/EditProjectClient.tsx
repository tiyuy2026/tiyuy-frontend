'use client';

import { useProjects } from '@/presentation/hooks/useProjects';
import { PropertyForm } from '@/presentation/components/property/PropertyForm';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';

export default function EditProjectClient({ id }: { id: number }) {
  const { projectById } = useProjects();
  const { data: project, isLoading } = projectById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900">Proyecto no encontrado</h2>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <PropertyForm mode="edit" property={project} formType="project" />
    </ProtectedRoute>
  );
}
