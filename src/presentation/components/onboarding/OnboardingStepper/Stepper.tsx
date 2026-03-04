'use client';
import React from 'react';
import { useOnboarding } from '@/presentation/hooks';
import { Button } from '@/presentation/components/ui';

export const OnboardingStepper: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentStep, totalSteps, handleNext, handlePrev, progress } = useOnboarding();

  return (
    <div className={`flex flex-col items-center gap-4 mb-8 ${className}`}>
      {/* Botones navegación */}
      <div className="flex gap-4">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handlePrev}
            className="px-8"
          >
            Anterior
          </Button>
        )}
        
        <Button
          variant="primary"
          onClick={handleNext}
          className="px-8"
        >
          {currentStep === totalSteps ? 'Finalizar' : 'Siguiente'}
        </Button>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md">
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Progreso: {Math.round(progress)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
