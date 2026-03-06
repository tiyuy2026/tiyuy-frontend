'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyForm } from '@/presentation/components/property/PropertyForm/PropertyForm';
import { useAuthStore } from '@/presentation/store/authStore';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { TrialGuard } from '@/presentation/components/guards/TrialGuard/TrialGuard';
import { TrialWarningBanner } from '@/presentation/components/guards/TrialGuard/TrialWarningBanner';

const PROJECT_STEPS = [
  { number: 1, title: 'Información del Proyecto', description: 'Tipo y fase' },
  { number: 2, title: 'Ubicación', description: 'Dirección exacta' },
  { number: 3, title: 'Unidades', description: 'Departamentos disponibles' },
  { number: 4, title: 'Timeline', description: 'Fechas de entrega' },
  { number: 5, title: 'Multimedia', description: 'Planos y renders' },
];

export default function NuevoProyectoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);

  console.log('NuevoProyectoPage: Usuario:', user?.role);

  return (
    <ProtectedRoute>
      <TrialGuard>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Banner de advertencia de trial */}
            <TrialWarningBanner />

            {/* Header */}
            <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Nuevo Proyecto Inmobiliario
                </h1>
                <p className="text-gray-600 mt-2">
                  Publica tu proyecto de obra nueva y llega a miles de interesados
                </p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Volver
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {PROJECT_STEPS.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                      ${currentStep >= step.number
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {step.number}
                  </div>
                  {index < PROJECT_STEPS.length - 1 && (
                    <div
                      className={`
                        w-full h-0.5 mx-4 transition-colors
                        ${currentStep > step.number ? 'bg-purple-600' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {PROJECT_STEPS.map((step) => (
                <div key={step.number} className="flex-1 text-center">
                  <p className="text-xs text-gray-600">{step.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <PropertyForm
              mode="create"
              formType="project"
              onStepChange={setCurrentStep}
            />
          </div>
        </div>
      </div>
    </TrialGuard>
    </ProtectedRoute>
  );
}
