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
