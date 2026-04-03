'use client';
import React, { useEffect, useState } from 'react';
import { auth } from '@/config/firebase';

export const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Verificando Firebase...');

  useEffect(() => {
    const checkFirebase = () => {
      try {
        if (auth) {
          setStatus(' Firebase Auth inicializado correctamente');
          console.log('Firebase Auth:', auth);
          console.log('Configuración:', auth.app.options);
        } else {
          setStatus(' Firebase Auth no disponible');
        }
      } catch (error) {
        setStatus(` Error: ${error}`);
        console.error('Error en Firebase:', error);
      }
    };

    // Pequeño delay para asegurar que Firebase esté listo
    const timer = setTimeout(checkFirebase, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2"> Firebase Status</h3>
      <p className="text-xs">{status}</p>
      
      <div className="mt-2 text-xs text-gray-600">
        <p>Project ID: {auth?.app.options.projectId}</p>
        <p>Auth Domain: {auth?.app.options.authDomain}</p>
      </div>
    </div>
  );
};
