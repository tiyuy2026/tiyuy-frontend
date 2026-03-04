'use client';

import { useAuthStore } from '@/presentation/store/authStore';
import { useFavoriteStatus, useToggleFavorite } from '@/presentation/hooks/useFavorites';
import { useRouter } from 'next/navigation';

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
        <svg
          className={`w-4 h-4 transition-all duration-200 ${
            isFavorite
              ? 'fill-rose-500 stroke-rose-500 scale-110'
              : 'fill-none stroke-current'
          }`}
          viewBox="0 0 24 24"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        {isPending ? (
          <span className="flex items-center gap-1">
            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
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
        <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <svg
          className={`w-5 h-5 transition-all duration-200 ${
            isFavorite
              ? 'fill-rose-500 stroke-rose-500 scale-110'
              : 'fill-none stroke-gray-400'
          }`}
          viewBox="0 0 24 24"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  );
}