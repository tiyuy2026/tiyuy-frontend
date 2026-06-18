'use client';

import { useState } from 'react';
import { toast } from '@/presentation/store/toastStore';
import { Icon } from '@iconify/react';
import { MessageCircle } from 'lucide-react';

interface ShareButtonProps {
  variant?: 'topbar' | 'icon';
  className?: string;
}

export function ShareButton({ variant = 'icon', className = '' }: ShareButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl  = typeof window !== 'undefined' ? window.location.href : '';
  const currentTitle = typeof document !== 'undefined' ? document.title : 'Propiedad en TIYUY';

  /* Intenta Web Share API primero, si no abre el menú manual */
  const handleMainClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: currentTitle, url: currentUrl });
        return;
      } catch {
        // usuario canceló → no hacer nada
        return;
      }
    }
    // Sin Web Share API (desktop): abrir menú
    setMenuOpen((o) => !o);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(currentUrl);
    toast.success('Enlace copiado al portapapeles');
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      label: 'Copiar enlace',
      icon: (
        <Icon icon="mdi:link-variant" className="w-4 h-4" />
      ),
      action: copyLink,
    },
    {
      label: 'WhatsApp',
      icon: (
        <MessageCircle className="w-4 h-4" />
      ),
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${currentTitle} - ${currentUrl}`)}`, '_blank');
        setMenuOpen(false);
      },
    },
    {
      label: 'Facebook',
      icon: (
        <Icon icon="mdi:facebook" className="w-4 h-4" />
      ),
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
        setMenuOpen(false);
      },
    },
    {
      label: 'X (Twitter)',
      icon: (
        <Icon icon="mdi:twitter" className="w-4 h-4" />
      ),
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentTitle)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
        setMenuOpen(false);
      },
    },
  ];

  /* ── Variante topbar: texto + ícono SVG ── */
  if (variant === 'topbar') {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={handleMainClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-150"
        >
          <Icon icon="mdi:share-variant" className="w-4 h-4" />
          {copied ? '¡Copiado!' : 'Compartir'}
        </button>

        {/* Dropdown manual (solo aparece si no hay Web Share API) */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 overflow-hidden">
              {shareOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-400">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── Variante icon: botón redondo (uso general) ── */
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleMainClick}
        aria-label="Compartir"
        className="w-11 h-11 rounded-full flex items-center justify-center bg-white/90 hover:bg-white shadow hover:shadow-md transition-all duration-150"
      >
        <Icon icon="mdi:share-variant" className="w-5 h-5 text-gray-500" />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 overflow-hidden">
            {shareOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={opt.action}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}