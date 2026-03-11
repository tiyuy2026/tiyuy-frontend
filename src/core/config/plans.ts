export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  maxPublications: number;
  features: string[];
  iconName: 'star' | 'crown' | 'zap';
  color: string;
  popular?: boolean;
  description?: string;
  isFeatured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 0,
    currency: 'USD',
    maxPublications: 3,
    description: 'Perfecto para comenzar',
    features: [
      'Hasta 3 propiedades publicadas',
      'Búsqueda básica',
      'Contacto directo',
      'Soporte por email'
    ],
    iconName: 'star',
    color: 'bg-blue-50 text-blue-700 border-blue-300'
  },
  {
    id: 'professional',
    name: 'Profesional',
    price: 99,
    currency: 'USD',
    maxPublications: 15,
    description: 'Ideal para profesionales',
    features: [
      'Hasta 15 propiedades publicadas',
      'Búsqueda avanzada',
      'Destaque en búsquedas',
      'Estadísticas detalladas',
      'Soporte prioritario',
      'Badge verificado'
    ],
    iconName: 'crown',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    popular: true,
    isFeatured: true
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 299,
    currency: 'USD',
    maxPublications: -1, // -1 = ilimitado
    description: 'Para grandes empresas',
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
    iconName: 'zap',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    isFeatured: false
  }
];

export const getPlanById = (id: string): Plan | undefined => {
  return PLANS.find(plan => plan.id === id);
};

export const getCurrentPlan = (userPlanId?: string): Plan => {
  return getPlanById(userPlanId || 'basic') || PLANS[0];
};
