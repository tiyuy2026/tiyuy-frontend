'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyForm } from '@/presentation/components/property/PropertyForm/PropertyForm';
import { useAuthStore } from '@/presentation/store/authStore';
import { useMyProperties } from '@/presentation/hooks/useProperties';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';

const STEPS = [
  { number: 1, title: 'Información básica', description: 'Tipo y precio' },
  { number: 2, title: 'Ubicación', description: 'Dirección exacta' },
  { number: 3, title: 'Características', description: 'Detalles del inmueble' },
  { number: 4, title: 'Fotos', description: 'Imágenes del inmueble' },
];

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const { data: myPropertiesData } = useMyProperties();
  const { data: activeSubscription } = useActiveSubscription();

  const publishedCount =
    myPropertiesData?.properties?.filter((p: any) => p.status === 'PUBLISHED').length || 0;

  const canPublish = useMemo(() => {
    if (activeSubscription) return activeSubscription.remainingPublications > 0;
    return publishedCount < 1;
  }, [activeSubscription, publishedCount]);

  const maxPublications = activeSubscription?.plan?.maxPublications || 1;
  const remainingPublications =
    activeSubscription?.remainingPublications ?? (1 - publishedCount);

  React.useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent mx-auto mb-3"
            style={{ borderColor: '#00a63e', borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>

      {/* ── TOP NAV ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <span className="text-gray-300 select-none">|</span>
            <button
              onClick={() => router.push('/my-properties')}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Ir a historial
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={
                canPublish
                  ? { backgroundColor: '#f0fdf4', color: '#00a63e' }
                  : { backgroundColor: '#fef2f2', color: '#dc2626' }
              }
            >
              {canPublish
                ? `${remainingPublications}/${maxPublications} publicaciones disponibles`
                : 'Límite alcanzado'}
            </span>
            <span className="text-sm text-gray-500 hidden sm:block">
              Publicando como:{' '}
              <span className="font-semibold text-gray-800">
                {user?.firstName} {user?.lastName}
              </span>
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: '#00a63e' }}
            >
              {user?.firstName?.[0] || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8 items-start">

        {/* ── SIDEBAR: STEPPER ── */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          {/* Card blanco estilo Tiyuy */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Publicar propiedad
              </p>
            </div>
            <div className="px-5 py-5">
              {STEPS.map((step, index) => {
                const isDone = currentStep > step.number;
                const isActive = currentStep === step.number;
                return (
                  <div key={step.number} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300"
                        style={
                          isDone || isActive
                            ? { backgroundColor: '#00a63e', color: '#fff',
                                boxShadow: isActive ? '0 0 0 4px #dcfce7' : 'none' }
                            : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                        }
                      >
                        {isDone ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : step.number}
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className="w-0.5 h-10 mt-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: isDone ? '#00a63e' : '#e5e7eb' }}
                        />
                      )}
                    </div>
                    <div className="pb-10">
                      <p className={`text-sm font-semibold leading-none mt-1.5 ${
                        isActive ? 'text-gray-900' : isDone ? '' : 'text-gray-400'
                      }`} style={isDone ? { color: '#00a63e' } : {}}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card info adicional */}
          <div className="bg-white rounded-xl border border-gray-200 mt-4 overflow-hidden"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                ¿Necesitas ayuda?
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: 'Centro de ayuda', href: '#' },
                { label: 'Contactar soporte', href: '#' },
                { label: 'Guía de publicación', href: '#' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: '#00a63e' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN: FORM en card blanco ── */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 px-8 py-8 min-h-[600px]"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <PropertyForm
              mode="create"
              onStepChange={setCurrentStep}
            />
          </div>
        </main>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-200 mt-6">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">¿Por qué publicar con nosotros?</h4>
            <ul className="space-y-2">
              {[
                'Alcance nacional a miles de compradores',
                'Publicación gratuita sin comisiones',
                'Soporte personalizado 24/7',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
                    style={{ color: '#00a63e' }}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Consejos para una buena publicación</h4>
            <ul className="space-y-1.5 text-sm text-gray-500">
              {[
                'Toma fotos de alta calidad y buena iluminación',
                'Describe detalladamente las características',
                'Incluye información sobre los alrededores',
                'Establece un precio competitivo',
                'Responde rápidamente a las consultas',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="font-bold mt-0.5" style={{ color: '#00a63e' }}>·</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
