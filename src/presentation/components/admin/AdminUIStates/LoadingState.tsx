/**
 * Admin Loading State Component
 * Consistent loading UI for admin module
 */

'use client';

import { Spinner } from '@/presentation/components/ui/Spinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'lg',
  fullScreen = false 
}: LoadingStateProps) {
  const content = (
    <div className="text-center">
      <Spinner size={size} />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}
