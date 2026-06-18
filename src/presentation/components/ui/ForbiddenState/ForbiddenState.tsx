/**
 * ForbiddenState Component
 * Displays when user lacks permissions
 */

import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

interface ForbiddenStateProps {
  title?: string;
  description?: string;
  requiredPermission?: string;
}

export function ForbiddenState({
  title = 'Access Forbidden',
  description = 'You do not have the required permissions to access this resource.',
  requiredPermission,
}: ForbiddenStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 mb-4 bg-amber-100 rounded-full flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-amber-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-4">{description}</p>
      {requiredPermission && (
        <p className="text-sm text-gray-400 mb-6">
          Required: {requiredPermission}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          Go Back
        </button>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
