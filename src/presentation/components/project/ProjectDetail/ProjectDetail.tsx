'use client';

import { useState, useMemo } from 'react';
import { ProjectFull, ProjectUnit } from '@/core/domain/entities/Project';
import { useProjects } from '@/presentation/hooks/useProjects';
import ProjectQuotation from './ProjectQuotation';
import { SimilarProjects } from '../SimilarProjects';
import { ProjectGallery } from './ProjectGallery';
import { ProjectContactSidebar } from './ProjectContactSidebar';
import { ProjectComments } from './ProjectComments';
import { FavoriteButton } from '../../shared/FavoriteButton/FavoriteButton';
import { ShareButton } from '../../shared/ShareButton/ShareButton';
import { StarRating } from '../../property/PropertyDetail/StarRating';
import { Building, Calendar, ChevronDown, Download, FileText, Home, Landmark, MapPin, Maximize, Menu, MessageCircle, ShoppingCart, Tag, Truck, X } from 'lucide-react';

interface ProjectDetailProps {
  project: ProjectFull;
}

const PHASE_LABELS: Record<string, string> = {
  PRE_SALE: 'En planos',
  SALE: 'En construcción',
  DELIVERY: 'Entrega inmediata',
};

const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: 'Residencial',
  COMMERCIAL: 'Comercial',
  INDUSTRIAL: 'Industrial',
  MIXED_USE: 'Uso mixto',
};

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const { projectUnits, projectFull } = useProjects();
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<ProjectUnit | null>(null);
  const [rating, setRating] = useState<{ averageRating: number; totalRatings: number } | null>(null);

  const { data: unitsData } = projectUnits(project.id, 0, 100);
  const { data: fullProjectData } = projectFull(project.id);

  const currentProject = fullProjectData || project;
  const units: ProjectUnit[] = unitsData?.content || currentProject.units || [];

  // ── AGRUPAR UNIDADES SIMILARES ──
  const groupedUnitTypes = useMemo(() => {
    const map = new Map<string, { units: ProjectUnit[]; key: string }>();

    units.forEach(unit => {
      const key = `${unit.type}-${unit.bedrooms ?? 0}-${unit.bathrooms}-${unit.area}-${unit.price}-${unit.floor}`;
      if (!map.has(key)) {
        map.set(key, { units: [], key });
      }
      map.get(key)!.units.push(unit);
    });

    return Array.from(map.values()).sort((a, b) =>
      (a.units[0].bedrooms ?? 0) - (b.units[0].bedrooms ?? 0)
    );
  }, [units]);

  const bedroomGroups = [...new Set(
    groupedUnitTypes.map(g => g.units[0].bedrooms ?? 0)
  )].sort((a, b) => a - b);

  // Usar ProjectQuotation hook
  const quotation = ProjectQuotation({
    project: currentProject,
    groupedUnitTypes,
    currency: currentProject.currency || 'S/.',
    TYPE_LABELS,
    PHASE_LABELS,
    deliveryDate: (currentProject as any).deliveryDate
      ? new Date((currentProject as any).deliveryDate).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })
      : undefined,
  });

  const activeGroup = activeTab ?? bedroomGroups[0] ?? null;

  // Imágenes
  const allImages = currentProject.images || [];
  const coverImage = currentProject.coverImageUrl;
  const galleryImages = allImages.length > 0 ? allImages : coverImage ? [coverImage] : [];
  const galleryImagesOnly = galleryImages.filter((img: string) =>
    !img.includes('.mp4') && !img.includes('.avi') && !img.includes('.mov') && !img.includes('.webm')
  );
  const blueprints = currentProject.blueprints || [];
  const renders = currentProject.renders || [];

  const video: string | null = renders && renders.length > 0
    ? renders.find(r => r.includes('.mp4') || r.includes('.avi') || r.includes('.mov') || r.includes('.webm')) ?? null
    : null;

  const currency = currentProject.currency === 'USD' ? '$' : 'S/.';

  const deliveryDate = currentProject.estimatedDelivery
    ? new Date(currentProject.estimatedDelivery).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
      })
    : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ════════════════════════════════════════
              COLUMNA PRINCIPAL (3/4)
          ════════════════════════════════════════ */}
          <div className="lg:col-span-9 space-y-4">

            {/* ── FAVORITO / COMPARTIR (encima de la galería) ── */}
            <div className="flex items-center justify-end gap-1">
              <FavoriteButton propertyId={project.id} variant="topbar" />
              <ShareButton variant="topbar" />
            </div>

            {/* 1. GALERÍA */}
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm -mt-2">
              <ProjectGallery
                project={currentProject}
                galleryImagesOnly={galleryImagesOnly}
                blueprints={blueprints}
                video={video}
              />
            </div>

            {/* 2. INFO PRINCIPAL */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-1">
                    {TYPE_LABELS[currentProject.type] || currentProject.type} en {currentProject.district}
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {PHASE_LABELS[currentProject.phase] || currentProject.phase}
                      {deliveryDate && ` · Entrega ${deliveryDate}`}
                    </span>
                    {currentProject.isVerified && (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">✓ Verificado</span>
                    )}
                    {currentProject.isFeatured && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">⭐ Destacado</span>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProject.name}</h1>

                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    Venta desde {currency} {currentProject.priceFrom?.toLocaleString('en-US')}
                  </p>

                  {currentProject.address && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {currentProject.address}
                    </p>
                  )}
                </div>

                {/* Estrellas de calificación a la derecha */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                  <StarRating
                    projectId={project.id}
                    size="md"
                    showValue
                    onRatingSaved={() => {
                      fetch(`/api/projects/${project.id}/rating`).then(res => {
                        if (res.ok) res.json().then(data => setRating(data));
                      }).catch(() => {});
                    }}
                  />
                  {rating && rating.totalRatings > 0 && (
                    <span className="text-xs text-gray-500">
                      {rating.averageRating.toFixed(1)} ({rating.totalRatings} {rating.totalRatings === 1 ? 'reseña' : 'reseñas'})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {currentProject.totalUnits > 0 && (
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{currentProject.totalUnits} unidades</p>
                  </div>
                </div>
              )}
              {currentProject.areaFrom && (
                <div className="flex items-center gap-3">
                  <Maximize className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {currentProject.areaFrom}{currentProject.areaTo ? ` a ${currentProject.areaTo}` : ''} m² tot.
                    </p>
                  </div>
                </div>
              )}
              {currentProject.floors && (
                <div className="flex items-center gap-3">
                  <Landmark className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{currentProject.floors} pisos</p>
                  </div>
                </div>
              )}
              {bedroomGroups.length > 0 && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {bedroomGroups[0] === 0
                        ? 'Estudio'
                        : bedroomGroups.length > 1
                        ? `${bedroomGroups[0]} a ${bedroomGroups[bedroomGroups.length - 1]} dorm.`
                        : `${bedroomGroups[0]} dorm.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 4. DESCRIPCIÓN */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Sobre el proyecto</h2>
              <p className="text-gray-600 leading-relaxed">{currentProject.description}</p>
            </div>

            {/* 5. TIPOS DE UNIDADES */}
            {groupedUnitTypes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Tipos de unidades</h2>
                <p className="text-sm text-gray-500 mb-6">
                  {units.filter(u => u.status === 'AVAILABLE').length} unidades disponibles de {units.length} en total
                </p>

                {bedroomGroups.length > 1 && (
                  <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
                    {bedroomGroups.map(beds => (
                      <button
                        key={beds}
                        onClick={() => setActiveTab(beds)}
                        className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                          activeGroup === beds
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {beds === 0 ? 'Estudio / Comercial' : `${beds} Dormitorio${beds > 1 ? 's' : ''}`}
                        <span className="ml-1 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5">
                          {units.filter(u => (u.bedrooms ?? 0) === beds && u.status === 'AVAILABLE').length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {groupedUnitTypes
                    .filter(g => activeGroup === null || (g.units[0].bedrooms ?? 0) === activeGroup)
                    .map(({ units: groupUnits, key }) => {
                      const sample = groupUnits[0];
                      const available = groupUnits.filter(u => u.status === 'AVAILABLE').length;
                      const reserved = groupUnits.filter(u => u.status === 'RESERVED').length;
                      const sold = groupUnits.filter(u => u.status === 'SOLD').length;

                      const groupLabel = (() => {
                        const parts = sample.unitNumber.split('-');
                        if (parts.length >= 3) return parts.slice(0, -2).join(' ');
                        return `${sample.bedrooms ?? 0} dorm · ${sample.area}m²`;
                      })();

                      return (
                        <div key={key} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition bg-white">
                          <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-100">
                            <div className="text-center">
                              <Home className="w-10 h-10 text-gray-300 mx-auto mb-1" />
                              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                {sample.type === 'APARTMENT' ? 'Departamento' :
                                 sample.type === 'PENTHOUSE' ? 'Penthouse' :
                                 sample.type === 'DUPLEX' ? 'Dúplex' : sample.type}
                              </p>
                            </div>

                            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                              {available > 0 && (
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                  {available} disponible{available > 1 ? 's' : ''}
                                </span>
                              )}
                              {reserved > 0 && (
                                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                                  {reserved} reservado{reserved > 1 ? 's' : ''}
                                </span>
                              )}
                              {sold > 0 && (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                                  {sold} vendido{sold > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              {groupUnits.length} unidades en este tipo
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="font-bold text-gray-900 mb-1 capitalize">{groupLabel}</p>

                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                              {(sample.bedrooms ?? 0) > 0 && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {sample.bedrooms} dorm.
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" />
                                {sample.bathrooms} baños
                              </span>
                              <span className="flex items-center gap-1">
                                <Maximize className="w-3.5 h-3.5" />
                                {sample.area} m²
                              </span>
                              {sample.parkingSpots > 0 && (
                                <span className="flex items-center gap-1">
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  {sample.parkingSpots} est.
                                </span>
                              )}
                              {sample.view && (
                                <span className="flex items-center gap-1">
                                  <Menu className="w-3.5 h-3.5" />
                                  {sample.view}
                                </span>
                              )}
                            </div>

                            <p className="text-lg font-bold text-gray-900 mb-3">
                              {currency} {sample.price.toLocaleString('en-US')}
                            </p>

                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Disponibilidad</span>
                                <span>{Math.round((available / groupUnits.length) * 100)}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full transition-all"
                                  style={{ width: `${(available / groupUnits.length) * 100}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => quotation.generateQuotePDF(groupUnits, groupLabel)}
                                className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Cotizar PDF
                              </button>

                              <button
                                onClick={() => quotation.setExpandedGroupKey(quotation.expandedGroupKey === key ? null : key)}
                                className="flex-1 border border-gray-200 text-gray-600 text-xs py-2 px-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1"
                              >
                                {quotation.expandedGroupKey === key ? 'Ocultar' : `Ver ${groupUnits.length} unidades`}
                                <ChevronDown className="" />
                              </button>
                            </div>

                            {quotation.expandedGroupKey === key && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
                                  Unidades de este tipo
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {groupUnits.map(unit => {
                                    const waPhone = currentProject.developer?.phone?.replace(/\D/g, '') || '';
                                    const waMsg = encodeURIComponent(
                                      `Hola, estoy interesado en la unidad *${unit.unitNumber}* del proyecto *${currentProject.name}*.\n` +
                                      `• Área: ${unit.area} m²\n• Precio: ${currentProject.currency || 'S/.'} ${unit.price.toLocaleString()}\n¿Podría darme más información?`
                                    );
                                    return (
                                      <div key={unit.id}
                                        className="border border-gray-100 rounded-xl p-3 bg-gray-50 hover:border-blue-200 hover:bg-blue-50 transition">
                                        <p className="font-bold text-gray-800 text-xs truncate">{unit.unitNumber}</p>
                                        <p className="text-xs text-gray-400">Piso {unit.floor} · {unit.area} m²</p>
                                        <p className="text-xs font-semibold text-gray-700 mt-1">
                                          {currentProject.currency || 'S/.'} {unit.price.toLocaleString()}
                                        </p>
                                        <span className={`inline-block mt-1 mb-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                          unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                          unit.status === 'RESERVED'  ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-red-100 text-red-700'
                                        }`}>
                                          {unit.status === 'AVAILABLE' ? 'Disponible' :
                                           unit.status === 'RESERVED'  ? 'Reservado' : 'Vendido'}
                                        </span>
                                        <div className="flex gap-1">
                                          <a href={`https://wa.me/${waPhone}?text=${waMsg}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="flex-1 bg-green-500 text-white text-xs py-1.5 rounded-lg text-center hover:bg-green-600 transition font-medium">
                                            WhatsApp
                                          </a>
                                          <button onClick={() => setSelectedUnit(unit)}
                                            className="flex-1 border border-gray-200 text-gray-600 text-xs py-1.5 rounded-lg hover:bg-white transition">
                                            Detalle
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 6. AMENIDADES */}
            {currentProject.amenities && currentProject.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Amenidades</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(currentProject.amenities as any[]).map((amenity, i) => {
                    const name = typeof amenity === 'string' ? amenity : amenity.name;
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                        <span className="text-green-600">✓</span>
                        <span>{name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. TIMELINE */}
            {currentProject.timeline && currentProject.timeline.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cronograma del proyecto</h2>
                <div className="relative border-l-2 border-blue-200 pl-6 space-y-6">
                  {currentProject.timeline.map((milestone, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[29px] w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow"></div>
                      <p className="text-xs text-gray-400 mb-1">
                        {new Date(milestone.date).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
                      </p>
                      <p className="font-semibold text-gray-800">{milestone.phase}</p>
                      {milestone.description && (
                        <p className="text-sm text-gray-500">{milestone.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. UBICACIÓN */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Ubicación del proyecto</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                <MapPin className="w-4 h-4 text-gray-400" />
                {currentProject.fullAddress ||
                  currentProject.address ||
                  `${currentProject.street ? currentProject.street + ' ' : ''}${currentProject.streetNumber || ''}, ${currentProject.district}, ${currentProject.province}`}
              </p>

              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-72">
                {process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ? (
                  <>
                    {currentProject.latitude && currentProject.longitude ? (
                      <iframe
                        width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=${currentProject.latitude},${currentProject.longitude}&zoom=16`}
                      />
                    ) : currentProject.fullAddress || currentProject.address ? (
                      <iframe
                        width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=${encodeURIComponent(
                          currentProject.fullAddress || currentProject.address || `${currentProject.district}, ${currentProject.province}, Perú`
                        )}&zoom=16`}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        Sin coordenadas ni dirección
                      </div>
                    )}
                  </>
                ) : (
                  <iframe
                    width="100%" height="100%" style={{ border: 0 }} loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentProject.longitude ? currentProject.longitude - 0.01 : '-77.0428'},${currentProject.latitude ? currentProject.latitude - 0.01 : '-12.0464'},${currentProject.longitude ? currentProject.longitude + 0.01 : '-77.0428'},${currentProject.latitude ? currentProject.latitude + 0.01 : '-12.0464'}&layer=mapnik&marker=${currentProject.latitude || '-12.0464'},${currentProject.longitude || '-77.0428'}`}
                  />
                )}
              </div>

              {/* Comentarios del proyecto */}
              <div className="border-t border-gray-100 mt-6 pt-6">
                <ProjectComments projectId={currentProject.id} />
              </div>
            </div>

            {/* 9. PROYECTOS SIMILARES */}
            <SimilarProjects currentProject={currentProject} />
          </div>

          {/* ════════════════════════════════════════
              SIDEBAR (1/3) — sticky
          ════════════════════════════════════════ */}
          <div className="lg:col-span-3">
            <ProjectContactSidebar
              project={currentProject}
              units={units}
              currency={currency}
            />
          </div>

        </div>
      </div>

      {/* ── MODAL DETALLE DE UNIDAD ── */}
      {selectedUnit && (() => {
        const whatsappPhone = currentProject.developer?.phone?.replace(/\D/g, '') || '';
        const whatsappMsg = encodeURIComponent(
          `Hola, estoy interesado en la unidad *${selectedUnit.unitNumber}* del proyecto *${currentProject.name}*.\n` +
          `• Tipo: ${selectedUnit.type}\n` +
          `• Piso: ${selectedUnit.floor}\n` +
          `• Área: ${selectedUnit.area} m²\n` +
          `• Dormitorios: ${selectedUnit.bedrooms ?? '-'}\n` +
          `• Baños: ${selectedUnit.bathrooms}\n` +
          `• Estacionamientos: ${selectedUnit.parkingSpots}\n` +
          `• Vista: ${selectedUnit.view || 'No especificada'}\n` +
          `• Precio: ${currency} ${selectedUnit.price.toLocaleString()}\n\n` +
          `¿Podría darme más información?`
        );
        const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappMsg}`;

        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedUnit(null); }}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedUnit.unitNumber}</h3>
                  <p className="text-xs text-gray-400">{currentProject.name}</p>
                </div>
                <button onClick={() => setSelectedUnit(null)}
                  className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative h-52 bg-gray-50 border-b border-gray-100 flex items-center justify-center">
                {(selectedUnit as any).blueprintImage ? (
                  <img src={(selectedUnit as any).blueprintImage} alt={`Plano ${selectedUnit.unitNumber}`}
                    className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center text-gray-300">
                    <FileText className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">Plano no disponible</p>
                  </div>
                )}
                <span className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-bold ${
                  selectedUnit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                  selectedUnit.status === 'RESERVED'  ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                }`}>
                  {selectedUnit.status === 'AVAILABLE' ? 'Disponible' :
                   selectedUnit.status === 'RESERVED'  ? 'Reservado' : 'Vendido'}
                </span>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Building className="w-5 h-5 text-gray-400 mx-auto" />, label: 'Piso', value: selectedUnit.floor },
                    { icon: <Maximize className="w-5 h-5 text-gray-400 mx-auto" />, label: 'Área', value: `${selectedUnit.area} m²` },
                    { icon: <Tag className="w-5 h-5 text-gray-400 mx-auto" />, label: 'Tipo', value:
                      selectedUnit.type === 'APARTMENT' ? 'Depto' :
                      selectedUnit.type === 'PENTHOUSE' ? 'PH' :
                      selectedUnit.type === 'DUPLEX' ? 'Dúplex' :
                      selectedUnit.type === 'OFFICE' ? 'Oficina' : selectedUnit.type },
                    { icon: <Calendar className="w-5 h-5 text-gray-400 mx-auto" />, label: 'Dormitorios', value: selectedUnit.bedrooms ?? '-' },
                    { icon: <Truck className="w-5 h-5 text-gray-400 mx-auto" />, label: 'Baños', value: selectedUnit.bathrooms },
                    { icon: <ShoppingCart className="w-5 h-5 text-gray-400 mx-auto" />, label: 'Estac.', value: selectedUnit.parkingSpots },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="mb-1">{icon}</div>
                      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                      <p className="font-bold text-gray-800 text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {selectedUnit.view && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <Menu className="w-4 h-4 text-gray-400" />
                    <span>Vista: <strong>{selectedUnit.view}</strong></span>
                  </div>
                )}

                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs text-blue-500 font-medium">Precio de venta</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {currency} {selectedUnit.price.toLocaleString('en-US')}
                    </p>
                  </div>
                  {currentProject.developer?.phone && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Vendedor</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {currentProject.developer.companyName || 'Desarrollador'}
                      </p>
                      <p className="text-xs text-gray-500">{currentProject.developer.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  Escribir por WhatsApp
                </a>
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
