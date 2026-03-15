'use client';

import { useState, useEffect } from 'react';

export interface MessageLifetime {
  name: string;
  hours: number;
  description: string;
  isTemporary: boolean;
  isDefault: boolean;
}

export function useMessageLifetimes() {
  const [lifetimes, setLifetimes] = useState<MessageLifetime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar las opciones de duración del backend
  const loadMessageLifetimes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/contacts/extended/messages/lifetimes');
      
      if (!response.ok) {
        throw new Error('Error cargando duraciones de mensajes');
      }
      
      const data = await response.json();
      setLifetimes(data.lifetimes || []);
      
    } catch (err) {
      console.error('Error cargando duraciones de mensajes:', err);
      setError('No se pudieron cargar las duraciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar las opciones al montar el componente
  useEffect(() => {
    loadMessageLifetimes();
  }, []);

  const getTemporaryLifetimes = () => {
    return lifetimes.filter(l => l.isTemporary);
  };

  const getLifetimeByName = (name: string) => {
    return lifetimes.find(l => l.name === name);
  };

  const getDefaultLifetime = () => {
    return lifetimes.find(l => l.isDefault);
  };

  const getEffectiveLifetime = (lifetime: MessageLifetime, customHours?: number) => {
    if (customHours && customHours > 0) {
      return {
        name: 'custom',
        hours: customHours,
        description: `${customHours} horas`,
        isTemporary: true,
        isDefault: false
      };
    }
    return lifetime;
  };

  return {
    lifetimes,
    isLoading,
    error,
    loadMessageLifetimes,
    getTemporaryLifetimes,
    getLifetimeByName,
    getDefaultLifetime,
    getEffectiveLifetime
  };
}
