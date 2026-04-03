import { useState, useCallback } from 'react';

interface ValidationCache {
  [key: string]: {
    timestamp: number;
    exists: boolean;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const validationCache: ValidationCache = {};

export const useUserValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const clearCache = useCallback(() => {
    Object.keys(validationCache).forEach(key => delete validationCache[key]);
  }, []);

  const isCached = useCallback((key: string) => {
    const cached = validationCache[key];
    if (!cached) return false;
    
    // Si el cache expiró, lo eliminamos
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      delete validationCache[key];
      return false;
    }
    
    return true;
  }, []);

  const setCache = useCallback((key: string, exists: boolean) => {
    validationCache[key] = {
      timestamp: Date.now(),
      exists
    };
  }, []);

  const validateEmail = useCallback(async (email: string): Promise<boolean> => {
    const cacheKey = `email_${email}`;
    
    // Verificar cache primero
    if (isCached(cacheKey)) {
      return validationCache[cacheKey].exists;
    }

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      const exists = data.exists;
      
      // Guardar en cache
      setCache(cacheKey, exists);
      
      return exists;
    } catch (error) {
      console.error('Error validando email:', error);
      return false;
    }
  }, [isCached, setCache]);

  const validateDni = useCallback(async (dni: string): Promise<boolean> => {
    const cacheKey = `dni_${dni}`;
    
    // Verificar cache primero
    if (isCached(cacheKey)) {
      return validationCache[cacheKey].exists;
    }

    try {
      const response = await fetch('/api/auth/check-dni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni }),
      });

      const data = await response.json();
      const exists = data.exists;
      
      // Guardar en cache
      setCache(cacheKey, exists);
      
      return exists;
    } catch (error) {
      console.error('Error validando DNI:', error);
      return false;
    }
  }, [isCached, setCache]);

  return {
    isValidating,
    validateEmail,
    validateDni,
    clearCache
  };
};
