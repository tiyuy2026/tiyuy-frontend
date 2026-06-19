'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/presentation/store/authStore';
import { LogIn, UserPlus, X, PlusCircle } from 'lucide-react';

interface PublishButtonProps {
  className?: string;
  label?: string;
}

export function PublishButton({ className = '', label = 'Publica un inmueble' }: PublishButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = () => {
    if (isAuthenticated) {
      router.push('/my-properties/new');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`text-gray-800 hover:text-black text-base block cursor-pointer w-full text-left ${className}`}
      >
        {label}
      </button>

      {/* Modal de autenticación */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <PlusCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Publicar un inmueble
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Para publicar un inmueble, necesitas una cuenta en Tiyuy.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push('/profile-selector');
                }}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push('/profile-selector');
                }}
                className="w-full flex items-center justify-center gap-2 bg-white text-teal-600 font-semibold py-3 px-4 rounded-xl border-2 border-teal-600 hover:bg-teal-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Crear cuenta gratis
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
