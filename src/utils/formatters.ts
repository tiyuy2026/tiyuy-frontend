/**
 * Utilidades de formateo centralizadas para evitar duplicación
 */

// Formateo de números con separadores de miles
export const formatNumber = (num: number, locale: string = 'es-PE'): string => {
  return num.toLocaleString(locale);
};

// Formateo de números grandes (1K, 1.5K, etc.)
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Formateo de precios con símbolo de moneda
export const formatPrice = (price: number, currency: string = 'PEN', locale: string = 'es-PE'): string => {
  const symbol = currency === 'USD' ? 'US$' : 'S/';
  return `${symbol} ${price.toLocaleString(locale)}`;
};

// Formateo de fecha relativa en español
export const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return options?.addSuffix ? 'hace un momento' : 'un momento';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return options?.addSuffix ? `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}` : `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return options?.addSuffix ? `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}` : `${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return options?.addSuffix ? `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}` : `${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
};

// Formateo de fecha completa en español
export const formatDate = (date: Date | string, locale: string = 'es-PE'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Formateo de fecha corta
export const formatShortDate = (date: Date | string, locale: string = 'es-PE'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
};
