'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Building2, Home, Heart, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { PromotionCampaign } from '@/core/domain/entities/Admin';

/**
 * Página pública que lista todas las campañas activas
 * Ruta: /campaigns
 */
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCampaigns();
    try {
      const saved = localStorage.getItem('campaignFavorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/v1/public/marketing/campaigns/active');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (campaignId: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(campaignId)) {
        next.delete(campaignId);
      } else {
        next.add(campaignId);
      }
      localStorage.setItem('campaignFavorites', JSON.stringify([...next]));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1920px] mx-auto px-8 xl:px-16 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[360px] bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1920px] mx-auto px-8 xl:px-16 py-8">
        {/* Breadcrumb / Volver */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3">
            <Star className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Campañas Destacadas
            </h1>
            <p className="text-sm text-foreground/60">
              {campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''} activa{campaigns.length !== 1 ? 's' : ''} de inmobiliarias y agentes
            </p>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground/60 mb-2">
              No hay campañas activas
            </h2>
            <p className="text-foreground/40">
              Vuelve a revisar más tarde para descubrir nuevas promociones.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {campaigns.map((campaign) => {
              const isFavorited = favorites.has(campaign.id);
              const entityName = campaign.targetProjectName || campaign.targetPropertyName || campaign.title;
              const entityType = campaign.targetProjectId ? 'Proyecto' : campaign.targetPropertyId ? 'Propiedad' : 'Promoción';
              const entityIcon = campaign.targetProjectId ? <Building2 className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />;

              let targetUrl = '#';
              if (campaign.targetProjectId) {
                targetUrl = `/projects/${campaign.targetProjectId}`;
              } else if (campaign.targetPropertyId) {
                targetUrl = `/propiedades/${campaign.targetPropertyId}`;
              }

              return (
                <Link
                  key={campaign.id}
                  href={targetUrl}
                  className="group block"
                >
                  <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full">
                    {/* Imagen */}
                    <div className="relative h-48 overflow-hidden">
                      {campaign.imageUrl ? (
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center">
                          <Star className="w-16 h-16 text-emerald-300" />
                        </div>
                      )}

                      {/* Logo del owner */}
                      {campaign.ownerLogoUrl && (
                        <div className="absolute bottom-2 left-2 w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-md overflow-hidden bg-[var(--bg-card)]">
                          <img
                            src={campaign.ownerLogoUrl}
                            alt={campaign.ownerName || 'Logo'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Etiqueta "Destacado" */}
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold shadow-sm">
                          <Star className="w-3 h-3" />
                          Destacado
                        </span>
                      </div>

                      {/* Botón de Like */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(campaign.id);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-sm hover:bg-[var(--bg-card)] transition-all shadow-sm"
                        aria-label={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isFavorited ? 'fill-red-500 text-red-500' : 'text-[var(--text-secondary)]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Información */}
                    <div className="p-4">
                      {campaign.ownerName && (
                        <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                          {campaign.ownerName}
                        </p>
                      )}

                      <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1 line-clamp-1">
                        {entityName}
                      </h3>

                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] mb-2">
                        {entityIcon}
                        <span>{entityType}</span>
                      </div>

                      {campaign.pricePaid && campaign.pricePaid > 0 && (
                        <p className="text-base font-bold text-emerald-600 mb-2">
                          Desde S/ {campaign.pricePaid.toLocaleString()}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium border border-emerald-200 dark:border-emerald-800">
                          <Star className="w-2.5 h-2.5" />
                          7 Días Premium
                        </span>
                        {campaign.endDate && (
                          <span className="text-[10px] text-[var(--text-muted)]">
                            Hasta {new Date(campaign.endDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
