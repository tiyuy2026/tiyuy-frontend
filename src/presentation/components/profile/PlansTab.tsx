'use client';

import { useState } from 'react';
import { User } from '@/core/domain/entities';
import { Button } from '@/presentation/components/ui';
import { Star, Crown, Zap, Check, ArrowRight } from 'lucide-react';

interface PlansTabProps {
  user: User;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
  current?: boolean;
}

export const PlansTab: React.FC<PlansTabProps> = ({ user }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price: 0,
      features: [
        'Hasta 3 propiedades publicadas',
        'Búsqueda básica',
        'Contacto directo',
        'Soporte por email'
      ],
      icon: <Star className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-700 border-blue-300',
      current: true
    },
    {
      id: 'professional',
      name: 'Profesional',
      price: 99,
      features: [
        'Hasta 15 propiedades publicadas',
        'Búsqueda avanzada',
        'Destaque en búsquedas',
        'Estadísticas detalladas',
        'Soporte prioritario',
        'Badge verificado'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 299,
      features: [
        'Propiedades ilimitadas',
        'Búsqueda premium',
        'Destaque principal',
        'Analytics completo',
        'API access',
        'Soporte 24/7',
        'Marca personalizada',
        'Gestión multi-usuario'
      ],
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-700 border-purple-300'
    }
  ];

  const handlePlanChange = async (planId: string) => {
    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      // TODO: Conectar con backend para cambiar plan
      console.log('Cambiando a plan:', planId);
      
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Plan actualizado correctamente');
    } catch (error) {
      console.error('Error cambiando plan:', error);
    } finally {
      setIsLoading(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Mi Plan</h2>
        <p className="text-gray-600">
          Elige el plan que mejor se adapte a tus necesidades como {user.role === 'AGENT' ? 'agente inmobiliario' : 'desarrollador'}.
        </p>
      </div>

      {/* Plan Actual */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Plan Actual</p>
            <p className="text-lg font-bold text-blue-900">Básico</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Activo
          </div>
        </div>
      </div>

      {/* Planes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border-2 p-6 transition-all duration-200 ${
              plan.current
                ? 'border-blue-500 bg-blue-50'
                : plan.popular
                ? 'border-blue-300 hover:border-blue-400'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Badge Popular */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  MÁS POPULAR
                </span>
              </div>
            )}

            {/* Badge Actual */}
            {plan.current && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  PLAN ACTUAL
                </span>
              </div>
            )}

            {/* Header del Plan */}
            <div className={`text-center mb-6 ${plan.current ? 'opacity-75' : ''}`}>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${plan.color}`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-600">/mes</span>
              </div>
            </div>

            {/* Características */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Botón de Acción */}
            <Button
              variant={plan.current ? 'outline' : 'primary'}
              fullWidth
              disabled={plan.current || isLoading}
              onClick={() => handlePlanChange(plan.id)}
              className={plan.current ? 'cursor-not-allowed' : ''}
            >
              {plan.current ? (
                plan.price === 0 ? 'Plan en uso' : 'Plan Actual'
              ) : selectedPlan === plan.id ? (
                'Procesando...'
              ) : (
                <>
                  {plan.popular && <ArrowRight className="w-4 h-4 mr-2" />}
                  {plan.price === 0 ? 'Comenzar Gratis' : 'Actualizar Plan'}
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Información Adicional */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">¿Necesitas ayuda?</h3>
        <p className="text-gray-600 mb-4">
          Nuestro equipo de soporte está disponible para ayudarte a elegir el plan perfecto para tus necesidades.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline">
            Contactar Soporte
          </Button>
          <Button variant="outline">
            Ver Comparación Detallada
          </Button>
        </div>
      </div>
    </div>
  );
};
