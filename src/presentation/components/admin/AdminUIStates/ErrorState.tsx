import { TriangleAlert } from 'lucide-react';
/**
 * Admin Error State Component
 * Consistent error UI for admin module
 */

'use client';

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  retry?: () => void;
}

export function ErrorState({ 
  title = 'Error', 
  message, 
  action, 
  retry 
}: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <TriangleAlert className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      
      <div className="flex justify-center gap-3">
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
