export const PROFILES_CONFIG = {
  LANDLORD: {
    id: 'LANDLORD',
    name: 'Propietario',
    description: 'Publico propiedades para alquiler o venta',
    icon: '🏠',
    color: 'blue'
  },
  DEVELOPER: {
    id: 'DEVELOPER', 
    name: 'Desarrollador',
    description: 'Soy desarrollador inmobiliario',
    icon: '🏗️',
    color: 'green'
  },
  AGENT: {
    id: 'AGENT',
    name: 'Asesor Inmobiliario',
    description: 'Vendo propiedades de terceros',
    icon: '🤝',
    color: 'purple'
  }
} as const;

export type ProfileType = keyof typeof PROFILES_CONFIG;