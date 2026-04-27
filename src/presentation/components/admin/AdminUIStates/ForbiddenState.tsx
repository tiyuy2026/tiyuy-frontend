/**
 * Admin Forbidden State Component
 * Access denied UI for admin module
 */

'use client';

import { useRouter } from 'next/navigation';

interface ForbiddenStateProps {
  title?: string;
  message?: string;
  requiredPermission?: string;
}

export function ForbiddenState({ 
  title = 'Access Denied', 
  message = 'You do not have permission to access this resource.',
  requiredPermission 
}: ForbiddenStateProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {requiredPermission && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Required permission:</strong> {requiredPermission}
            </p>
          </div>
        )}
        
        <div className="flex justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
