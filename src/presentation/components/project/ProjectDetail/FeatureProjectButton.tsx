'use client';

import { useState } from 'react';
import { useAuthStore } from '@/presentation/store/authStore';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { toast } from 'sonner';
import { UpgradePlanModal } from '@/presentation/components/modals/UpgradePlanModal';
import { Crown, Star, Lock } from 'lucide-react';

interface FeatureProjectButtonProps {
  projectId: number;
  developerId: number;
  isFeatured?: boolean;
  status?: string;
}

export function FeatureProjectButton({ 
  projectId, 
  developerId, 
  isFeatured = false, 
  status = '' 
}: FeatureProjectButtonProps) {
  const { user } = useAuthStore();
  const { data: activeSubscription } = useActiveSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Obtener el plan actual del usuario
  const currentPlan = activeSubscription?.plan?.id || 'FREE';
  const canFeatureProject = currentPlan === 'PRO';

  // Solo mostrar si el usuario es el desarrollador y el proyecto está publicado
  if (!user || user.id !== developerId) {
    return null;
  }

  // Solo mostrar si está publicado y no está destacado
  if (status !== 'PUBLISHED' || isFeatured) {
    return null;
  }

  const handleFeatureProject = async () => {
    if (isLoading) return;

    // Verificar si tiene plan PRO
    if (!canFeatureProject) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const projectRepo = new ProjectRepository();
      await projectRepo.featureProject(projectId);
      
      toast.success('✅ ¡Proyecto destacado correctamente!');
      
      // Recargar la página para mostrar el cambio
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error destacando proyecto:', error);
      
      if (error.response?.status === 403) {
        toast.error('❌ No tienes permiso para destacar este proyecto');
      } else if (error.response?.status === 409) {
        toast.error('❌ El proyecto ya está destacado');
      } else if (error.response?.status === 400) {
        toast.error('❌ Solo se pueden destacar proyectos publicados');
      } else {
        toast.error('❌ Error al destacar proyecto: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanInfo = () => {
    switch (currentPlan) {
      case 'PRO':
        return {
          name: 'PRO',
          icon: <Crown className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          description: 'Acceso completo a todas las funciones'
        };
      case 'BASIC':
        return {
          name: 'BASIC',
          icon: <Star className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          description: 'Funciones limitadas'
        };
      case 'FREE':
        return {
          name: 'FREE',
          icon: <Lock className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          description: 'Funciones básicas'
        };
      default:
        // Si no hay suscripción, mostrar FREE por defecto
        return {
          name: 'FREE',
          icon: <Lock className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          description: 'Funciones básicas'
        };
    }
  };

  const planInfo = getPlanInfo();

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {/* Badge del plan actual */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${planInfo.color}`}>
              {planInfo.icon}
              Plan {planInfo.name}
            </span>
            {!canFeatureProject && (
              <span className="text-xs text-gray-500">
                {planInfo.description}
              </span>
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl mb-3">
            {canFeatureProject ? '⭐' : '🔒'}
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {canFeatureProject ? 'Destaca tu proyecto' : 'Mejora tu plan para destacar'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {canFeatureProject 
              ? 'Haz que tu proyecto aparezca en la página principal y reciba más visitas'
              : 'El destacado de proyectos está disponible solo para usuarios con plan PRO'
            }
          </p>
          <button
            onClick={handleFeatureProject}
            disabled={isLoading || !canFeatureProject}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              canFeatureProject
                ? 'bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : canFeatureProject ? (
              <>
                ⭐ Destacar proyecto
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Actualizar a PRO
              </>
            )}
          </button>
          {!canFeatureProject && (
            <p className="text-xs text-gray-500 mt-3">
              <span className="font-semibold">Plan PRO:</span> Destaca tus proyectos y recibe más visitas
            </p>
          )}
        </div>
      </div>

      {/* Modal de upgrade */}
      {showUpgradeModal && (
        <UpgradePlanModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
}
