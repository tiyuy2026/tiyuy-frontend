'use client';

import { useAuthStore } from '@/presentation/store/authStore';
import { useFavoriteStatus, useToggleFavorite } from '@/presentation/hooks/useFavorites';
import { useRouter } from 'next/navigation';
import { Heart, Loader } from 'lucide-react';;

interface FavoriteButtonProps {
  propertyId: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'topbar' | 'icon';
}

export function FavoriteButton({ propertyId, size = 'md', variant = 'icon' }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { isFavorite, isLoading } = useFavoriteStatus(propertyId);
  const toggleMutation = useToggleFavorite(propertyId);

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // mutate sin callbacks extra — el onSuccess/onError ya está en useMutation
    toggleMutation.mutate(undefined);
  };

  const isPending = isLoading || toggleMutation.isPending;

  /* ── Variante topbar ── */
  if (variant === 'topbar') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
          text-sm font-medium transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isFavorite
            ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
            : 'text-gray-600 hover:text-rose-500 hover:bg-rose-50'
          }
        `}
      >
        <Heart className="" />
        {isPending ? (
          <span className="flex items-center gap-1">
            <Loader className="animate-spin w-3 h-3" />
            ...
          </span>
        ) : isFavorite ? 'Guardado' : 'Favorito'}
      </button>
    );
  }

  /* ── Variante icon ── */
  const sizes = { sm: 'w-8 h-8', md: 'w-9 h-9', lg: 'w-11 h-11' };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={`
        ${sizes[size]}
        rounded-full flex items-center justify-center
        bg-white/90 hover:bg-white shadow
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isPending ? (
        <Loader className="animate-spin w-4 h-4 text-gray-400" />
      ) : (
        <Heart className="" />
      )}
    </button>
  );
}