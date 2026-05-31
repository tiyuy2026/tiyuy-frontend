/**
 * Mapa de tipos de propiedad en español (usados en URLs y localStorage)
 * a los valores del enum PropertyType que espera el backend.
 */
const SPANISH_TO_ENUM: Record<string, string> = {
  'departamentos': 'APARTMENT',
  'departamento': 'APARTMENT',
  'apartamento': 'APARTMENT',
  'apartamentos': 'APARTMENT',
  'casas': 'HOUSE',
  'casa': 'HOUSE',
  'terrenos': 'LAND',
  'terreno': 'LAND',
  'lotes': 'LAND',
  'lote': 'LAND',
  'oficinas': 'OFFICE',
  'oficina': 'OFFICE',
  'locales': 'COMMERCIAL',
  'local': 'COMMERCIAL',
  'comercial': 'COMMERCIAL',
  'habitaciones': 'ROOM',
  'habitacion': 'ROOM',
  'cuarto': 'ROOM',
  'cuartos': 'ROOM',
  'depositos': 'WAREHOUSE',
  'depósito': 'WAREHOUSE',
  'almacen': 'WAREHOUSE',
  'almacén': 'WAREHOUSE',
  'edificios': 'BUILDING',
  'edificio': 'BUILDING',
  'cocheras': 'PARKING',
  'cochera': 'PARKING',
  'estacionamiento': 'PARKING',
};

/**
 * Mapa de tipos de transacción en español/minúsculas
 * a los valores del enum TransactionType que espera el backend.
 */
const TRANSACTION_TYPE_MAP: Record<string, string> = {
  'sale': 'SALE',
  'venta': 'SALE',
  'rent': 'RENT',
  'alquiler': 'RENT',
  'alquilar': 'RENT',
  'temporary': 'TEMPORARY',
  'temporal': 'TEMPORARY',
  'transfer': 'TRANSFER',
  'traspaso': 'TRANSFER',
  'auction': 'AUCTION',
  'remate': 'AUCTION',
  'subasta': 'AUCTION',
};

/**
 * Convierte un tipo de propiedad en español (ej: "casas", "departamentos")
 * al valor del enum PropertyType (ej: "HOUSE", "APARTMENT").
 * Si no encuentra mapeo, devuelve el valor original.
 */
export function mapSpanishPropertyType(spanishType: string): string {
  if (!spanishType) return spanishType;
  const key = spanishType.toLowerCase().trim();
  return SPANISH_TO_ENUM[key] || spanishType;
}

/**
 * Convierte un tipo de transacción (ej: "sale", "venta", "alquiler")
 * al valor del enum TransactionType (ej: "SALE", "RENT").
 * Si no encuentra mapeo, devuelve el valor original en mayúsculas.
 */
export function mapTransactionType(transactionType: string): string {
  if (!transactionType) return transactionType;
  const key = transactionType.toLowerCase().trim();
  return TRANSACTION_TYPE_MAP[key] || transactionType.toUpperCase();
}
