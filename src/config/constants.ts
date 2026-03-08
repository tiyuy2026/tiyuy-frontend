export const LIMITS = {
  FREE_PUBLICATIONS: 2,
  MAX_PHOTOS_PER_PROPERTY: 10,
  MAX_FAVORITE_NOTES_LENGTH: 500,
} as const;

export const PROPERTY_TYPES = {
  APARTMENT: 'Departamento',
  HOUSE: 'Casa',
  LAND: 'Terreno',
  OFFICE: 'Oficina',
  COMMERCIAL: 'Local Comercial',
  ROOM: 'Habitación',
} as const;

export const TRANSACTION_TYPES = {
  SALE: 'Venta',
  RENT: 'Alquiler',
} as const;

export const CURRENCIES = {
  PEN: { code: 'PEN', symbol: 'S/', name: 'Soles' },
  USD: { code: 'USD', symbol: '$', name: 'Dólares' },
} as const;

// Enums para Proyectos (deben coincidir exactamente con el backend)
export const PROJECT_PHASES = {
  PRE_SALE: 'PRE_SALE',        // Backend: PRE_SALE
  CONSTRUCTION: 'CONSTRUCTION', // Backend: CONSTRUCTION  
  FINISHING: 'FINISHING',       // Backend: FINISHING
  READY: 'READY',             // Backend: READY
  DELIVERED: 'DELIVERED',     // Backend: DELIVERED
  SOLD_OUT: 'SOLD_OUT'        // Backend: SOLD_OUT
} as const;

// Etiquetas en español para mostrar en la UI
export const PROJECT_PHASES_LABELS = {
  PRE_SALE: 'Preventa',
  CONSTRUCTION: 'En Construcción',
  FINISHING: 'Acabados',
  READY: 'Listo para Entrega',
  DELIVERED: 'Entregado',
  SOLD_OUT: 'Agotado'
} as const;

export const PROJECT_TYPES = {
  INDUSTRIAL: 'INDUSTRIAL',
  COMMERCIAL: 'COMMERCIAL', 
  MIXED_USE: 'MIXED_USE',
  RESIDENTIAL: 'RESIDENTIAL'
} as const;

// Etiquetas en español para mostrar en la UI
export const PROJECT_TYPES_LABELS = {
  INDUSTRIAL: 'Industrial',
  COMMERCIAL: 'Comercial',
  MIXED_USE: 'Uso Mixto',
  RESIDENTIAL: 'Residencial'
} as const;

export const PROJECT_UNIT_TYPES = {
  APARTMENT: 'APARTMENT',           // Literal exacto del backend
  FLAT: 'FLAT',                   // Literal exacto del backend
  DUPLEX: 'DUPLEX',                // Literal exacto del backend
  PENTHOUSE: 'PENTHOUSE',            // Literal exacto del backend
  OFFICE: 'OFFICE',                // Literal exacto del backend
  COMMERCIAL_SPACE: 'COMMERCIAL_SPACE', // Literal exacto del backend
  WAREHOUSE: 'WAREHOUSE',             // Literal exacto del backend
} as const;

// Etiquetas en español para mostrar en la UI
export const PROJECT_UNIT_TYPES_LABELS = {
  APARTMENT: 'Departamento',
  FLAT: 'Departamento',
  DUPLEX: 'Dúplex',
  PENTHOUSE: 'Penthouse',
  OFFICE: 'Oficina',
  COMMERCIAL_SPACE: 'Local Comercial',
  WAREHOUSE: 'Almacén'
} as const;

export const PROJECT_UNIT_STATUS = {
  AVAILABLE: 'AVAILABLE',    // Backend: AVAILABLE
  RESERVED: 'RESERVED',      // Backend: RESERVED  
  SOLD: 'SOLD',            // Backend: SOLD
  BLOCKED: 'BLOCKED'       // Backend: BLOCKED
} as const;

// Etiquetas en español para mostrar en la UI
export const PROJECT_UNIT_STATUS_LABELS = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  BLOCKED: 'Bloqueado'
} as const;

export const PROJECT_STATUS = {
  DRAFT: 'DRAFT',        // Backend: DRAFT
  PUBLISHED: 'PUBLISHED', // Backend: PUBLISHED
  PAUSED: 'PAUSED',      // Backend: PAUSED
  COMPLETED: 'COMPLETED', // Backend: COMPLETED
  CANCELLED: 'CANCELLED'   // Backend: CANCELLED
} as const;

// Etiquetas en español para mostrar en la UI
export const PROJECT_STATUS_LABELS = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado'
} as const;

// Enums para MediaType (deben coincidir exactamente con el backend)
export const PROJECT_MEDIA_TYPES = {
  COVER: 'COVER',           // Portada
  RENDER: 'RENDER',          // Render 3D
  FLOOR_PLAN: 'FLOOR_PLAN', // Plano
  PHOTO: 'PHOTO',           // Foto real
  VIDEO: 'VIDEO',           // Video
  VIRTUAL_TOUR: 'VIRTUAL_TOUR', // Tour virtual
  IMAGE: 'IMAGE'            // Imagen genérica
} as const;

// Etiquetas en español para planes de suscripción
export const SUBSCRIPTION_PLAN_LABELS = {
  FREE: 'Plan Gratis',
  BASIC: 'Plan Básico',
  PRO: 'Plan Pro',
  ENTERPRISE_TRIAL: 'Prueba Empresarial',
  ENTERPRISE: 'Plan Empresarial'
} as const;

// Descripciones de planes de suscripción
export const SUBSCRIPTION_PLAN_DESCRIPTIONS = {
  FREE: '1 propiedad gratuita',
  BASIC: '2 publicaciones mensuales',
  PRO: '5 publicaciones mensuales + Soporte',
  ENTERPRISE_TRIAL: '12 propiedades por 3 meses',
  ENTERPRISE: 'Hasta 4 proyectos por 45 días - Renovable'
} as const;
