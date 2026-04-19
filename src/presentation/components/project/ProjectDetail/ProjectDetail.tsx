'use client';

import { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { ProjectFull, ProjectUnit } from '@/core/domain/entities/Project';
import { useProjects } from '@/presentation/hooks/useProjects';
import ProjectQuotation from './ProjectQuotation';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<ProjectUnit | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: unitsData } = projectUnits(project.id, 0, 100);
  const { data: fullProjectData } = projectFull(project.id);

  const currentProject = fullProjectData || project;
  const units: ProjectUnit[] = unitsData?.content || currentProject.units || [];

  // ── AGRUPAR UNIDADES SIMILARES (ya que backend no devuelve unitGroups) ──
// Unidades con mismas características = mismo "tipo visual"
const groupedUnitTypes = useMemo(() => {
  const map = new Map<string, { units: ProjectUnit[]; key: string }>();
  
  units.forEach(unit => {
    // Clave única por características (no por unitNumber)
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

// Para los tabs, usar los tipos agrupados
const bedroomGroups = [...new Set(
  groupedUnitTypes.map(g => g.units[0].bedrooms ?? 0)
)].sort((a, b) => a - b);

// Mantener unitsByBedrooms para la vista expandida
const unitsByBedrooms = useMemo(() => {
  const acc = {} as Record<number, ProjectUnit[]>;
  units.forEach(unit => {
    const key = unit.bedrooms ?? 0;
    if (!acc[key]) acc[key] = [];
    acc[key].push(unit);
  });
  return acc;
}, [units]);

  // Usar ProjectQuotation hook
  const quotation = ProjectQuotation({
    project: currentProject,
    groupedUnitTypes,
    currency: currentProject.currency || 'S/.',
    TYPE_LABELS,
    PHASE_LABELS,
    deliveryDate: (currentProject as any).deliveryDate ? new Date((currentProject as any).deliveryDate).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' }) : undefined
  });

  const activeGroup = activeTab ?? bedroomGroups[0] ?? null;

  // Imágenes
  const allImages = currentProject.images || [];
  const coverImage = currentProject.coverImageUrl;
  const galleryImages = allImages.length > 0 ? allImages : coverImage ? [coverImage] : [];
  // 🔍 FIX: Excluir video de las imágenes de galería
  const galleryImagesOnly = galleryImages.filter((img: string) => 
    !img.includes('.mp4') && !img.includes('.avi') && !img.includes('.mov') && !img.includes('.webm')
  );
  const blueprints = currentProject.blueprints || [];
  const renders = currentProject.renders || [];

  // 🔍 FIX: Buscar video en renders por extensión de archivo
  const video = renders && renders.length > 0 
    ? renders.find(r => r.includes('.mp4') || r.includes('.avi') || r.includes('.mov') || r.includes('.webm'))
    : null;

  const currency = currentProject.currency === 'USD' ? '$' : 'S/.';

  const deliveryDate = currentProject.estimatedDelivery
    ? new Date(currentProject.estimatedDelivery).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
      })
    : null;

  // Debug: Ver qué datos tenemos
  console.log('🔍 Debug ProjectDetail:', {
    // Dirección
    address: currentProject.address,
    fullAddress: currentProject.fullAddress,
    street: currentProject.street,
    streetNumber: currentProject.streetNumber,
    district: currentProject.district,
    province: currentProject.province,
    latitude: currentProject.latitude,
    longitude: currentProject.longitude,
    // Media
    video: video ? 'FOUND' : 'NOT FOUND',
    videoUrl: video,
    renders: renders,
    images: allImages,
    galleryImages: galleryImages,
    blueprints: blueprints,
    // Units
    units: units.length,
    firstUnit: units[0],
    // API
    hasGoogleMapsKey: !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  });

  return (
    <main className="min-h-screen bg-white">

      {/* ── GALERÍA TIPO URBANIA ── */}
      <section className="max-w-7xl mx-auto px-4 pt-6">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-3">
          <span>Proyectos</span>
          <span className="mx-2">›</span>
          <span>{currentProject.district}</span>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium">{currentProject.name}</span>
        </div>

        {/* Título del desarrollador */}
        {currentProject.developer?.companyName && (
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mb-3">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {currentProject.developer.companyName}
          </div>
        )}

        {/* Grid de imágenes estilo Urbania */}
        <div className="relative grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-2xl overflow-hidden mb-2">

          {/* ── IZQUIERDA: Video o imagen principal (3/4 ancho = 2/3) ── */}
          <div className="col-span-3 row-span-2 relative bg-gray-900 cursor-pointer"
            onClick={() => {
              if (video && videoRef.current) {
                if (isPlaying) {
                  videoRef.current.pause();
                  setIsPlaying(false);
                } else {
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }
            }}
          >
            {video ? (
              <>
                <video
                  ref={videoRef}
                  src={video}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  poster={galleryImagesOnly[0] || undefined}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Botón play/pause centrado */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 hover:bg-black/70 transition rounded-full p-5">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}

                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                  VIDEO 360°
                </span>
              </>
            ) : galleryImagesOnly[0] ? (
              <Image
                src={galleryImagesOnly[0]}
                alt={`Imagen principal de ${currentProject.name}`}
                fill className="object-cover" priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-200 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4h4v4H9z" /></svg>
              </div>
            )}
            {/* Label nombre proyecto */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <span className="text-white text-sm font-semibold">{currentProject.name}</span>
            </div>
          </div>

          {/* ── DERECHA: 2 imágenes en columna ── */}
          {galleryImagesOnly.slice(1, 3).map((imageUrl, index) => (
            <div
              key={index + 1}
              className="relative bg-gray-200 cursor-pointer group overflow-hidden"
              onClick={() => { setCurrentImageIndex(index + 1); setShowAllImages(true); }}
            >
              <Image
                src={imageUrl}
                alt={`${currentProject.name} - imagen ${index + 2}`}
                fill className="object-cover group-hover:brightness-90 transition duration-300"
                sizes="25vw"
              />
            </div>
          ))}

          {/* Si no hay suficientes imágenes, mostrar placeholders */}
          {galleryImagesOnly.length <= 1 && (
            <>
              <div className="w-full h-full bg-gray-100" />
              <div className="w-full h-full bg-gray-100" />
            </>
          )}

          {/* Botón "Ver todas las fotos" */}
          <button
            onClick={() => setShowAllImages(true)}
            className="absolute bottom-3 right-3 bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-gray-50 transition z-10"
          >
            🖼 Ver todas las fotos
            {galleryImagesOnly.length > 0 && (
              <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{galleryImagesOnly.length}</span>
            )}
            {blueprints.length > 0 && (
              <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">Planos: {blueprints.length}</span>
            )}
          </button>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL + SIDEBAR ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── COLUMNA PRINCIPAL ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Info principal */}
            <div>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {currentProject.address}
                </p>
              )}
            </div>

            {/* Stats tipo Urbania */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-gray-100 py-6">
              {currentProject.totalUnits > 0 && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4h4v4H9z" /></svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{currentProject.totalUnits} unidades</p>
                  </div>
                </div>
              )}
              {currentProject.areaFrom && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {currentProject.areaFrom}{currentProject.areaTo ? ` a ${currentProject.areaTo}` : ''} m² tot.
                    </p>
                  </div>
                </div>
              )}
              {currentProject.floors && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" /></svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{currentProject.floors} pisos</p>
                  </div>
                </div>
              )}
              {bedroomGroups.length > 0 && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12V7a2 2 0 012-2h14a2 2 0 012 2v5M3 12h18M3 12v5h18v-5M7 12V9h4v3M13 12V9h4v3" /></svg>
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

            {/* Descripción */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Sobre el proyecto</h2>
              <p className="text-gray-600 leading-relaxed">{currentProject.description}</p>
            </div>

            {/* ── TIPOS DE UNIDADES (agrupados visualmente) ── */}
            {groupedUnitTypes.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Tipos de unidades</h2>
                <p className="text-sm text-gray-500 mb-6">
                  {units.filter(u => u.status === 'AVAILABLE').length} unidades disponibles de {units.length} en total
                </p>

                {/* Tabs por dormitorios */}
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

                {/* Cards de tipos — 1 card por grupo de unidades similares */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedUnitTypes
                    .filter(g => activeGroup === null || (g.units[0].bedrooms ?? 0) === activeGroup)
                    .map(({ units: groupUnits, key }) => {
                      const sample = groupUnits[0];
                      const available = groupUnits.filter(u => u.status === 'AVAILABLE').length;
                      const reserved  = groupUnits.filter(u => u.status === 'RESERVED').length;
                      const sold      = groupUnits.filter(u => u.status === 'SOLD').length;
                      
                      // Intentar detectar nombre del grupo desde el unitNumber
                      // "torre 2-1-1" → "Torre 2" (todo antes del segundo guion)
                      const groupLabel = (() => {
                        const parts = sample.unitNumber.split('-');
                        if (parts.length >= 3) return parts.slice(0, -2).join(' ');
                        return `${sample.bedrooms ?? 0} dorm · ${sample.area}m²`;
                      })();

                      return (
                        <div key={key} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition bg-white">
                          
                          {/* Placeholder del plano (el backend no devuelve blueprintImage aún) */}
                          <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-100">
                            <div className="text-center">
                              <svg className="w-10 h-10 text-gray-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10"/></svg>
                              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                {sample.type === 'APARTMENT' ? 'Departamento' :
                                 sample.type === 'PENTHOUSE' ? 'Penthouse' :
                                 sample.type === 'DUPLEX' ? 'Dúplex' : sample.type}
                              </p>
                            </div>

                            {/* Badge disponibilidad */}
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

                            {/* Total del grupo */}
                            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              {groupUnits.length} unidades en este tipo
                            </div>
                          </div>

                          <div className="p-4">
                            {/* Nombre del grupo */}
                            <p className="font-bold text-gray-900 mb-1 capitalize">{groupLabel}</p>
                            
                            {/* Características */}
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                              {(sample.bedrooms ?? 0) > 0 && (
                                <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12V7a2 2 0 012-2h14a2 2 0 012 2v5M3 12h18M3 12v5h18v-5M7 12V9h4v3M13 12V9h4v3"/></svg>{sample.bedrooms} dorm.</span>
                              )}
                              <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12a2 2 0 01-2-2V7h4v3M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5M8 7V5a2 2 0 114 0v2"/></svg>{sample.bathrooms} baños</span>
                              <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>{sample.area} m²</span>
                              {sample.parkingSpots > 0 && (
                                <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM4 9l2-5h12l2 5M4 9h16M4 9H2m18 0h2"/></svg>{sample.parkingSpots} est.</span>
                              )}
                              {sample.view && (
                                <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"/></svg>{sample.view}</span>
                              )}
                            </div>

                            {/* Precio */}
                            <p className="text-lg font-bold text-gray-900 mb-3">
                              {currency} {sample.price.toLocaleString('en-US')}
                            </p>

                            {/* Barra de disponibilidad */}
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

                            {/* Acciones */}
                            <div className="flex gap-2">
                              {/* COTIZAR → genera PDF */}
                              <button
                                onClick={() => quotation.generateQuotePDF(groupUnits, groupLabel)}
                                className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Cotizar PDF
                              </button>

                              {/* VER UNIDADES → expande/colapsa */}
                              <button
                                onClick={() => quotation.setExpandedGroupKey(quotation.expandedGroupKey === key ? null : key)}
                                className="flex-1 border border-gray-200 text-gray-600 text-xs py-2 px-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1"
                              >
                                {quotation.expandedGroupKey === key ? 'Ocultar' : `Ver ${groupUnits.length} unidades`}
                                <svg className={`w-3 h-3 transition-transform ${quotation.expandedGroupKey === key ? 'rotate-180' : ''}`}
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            {/* CARDS EXPANDIDAS DEL GRUPO */}
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

                {/* ── AMENIDADES ── */}
            {currentProject.amenities && currentProject.amenities.length > 0 && (
              <div>
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

            {/* ── TIMELINE ── */}
            {currentProject.timeline && currentProject.timeline.length > 0 && (
              <div>
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

            {/* ── UBICACIÓN ── */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Ubicación del proyecto</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {currentProject.fullAddress ||
                  currentProject.address ||
                  `${currentProject.street ? currentProject.street + ' ' : ''}${currentProject.streetNumber || ''}, ${currentProject.district}, ${currentProject.province}`}
              </p>

              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-72">
                {/* Debug: Mostrar si tenemos API key */}
                {process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ? (
                  <>
                    {/* Prioridad 1: coordenadas exactas */}
                    {currentProject.latitude && currentProject.longitude ? (
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=${currentProject.latitude},${currentProject.longitude}&zoom=16`}
                      />
                    ) : currentProject.fullAddress || currentProject.address ? (
                      /* Prioridad 2: dirección como texto */
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=${encodeURIComponent(
                          currentProject.fullAddress ||
                          currentProject.address ||
                          `${currentProject.district}, ${currentProject.province}, Perú` 
                        )}&zoom=16`}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        Sin coordenadas ni dirección
                      </div>
                    )}
                  </>
                ) : (
                  /* Fallback: OpenStreetMap si no hay API key */
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentProject.longitude ? currentProject.longitude - 0.01 : '-77.0428'},${currentProject.latitude ? currentProject.latitude - 0.01 : '-12.0464'},${currentProject.longitude ? currentProject.longitude + 0.01 : '-77.0428'},${currentProject.latitude ? currentProject.latitude + 0.01 : '-12.0464'}&layer=mapnik&marker=${currentProject.latitude || '-12.0464'},${currentProject.longitude || '-77.0428'}`}
                  />
                )}
              </div>
            </div>
          </div>
                )}
        </div>

          {/* ── SIDEBAR CONTACTO ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Contáctate con {currentProject.developer?.companyName || 'el desarrollador'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                por el proyecto en {currentProject.district}, {currentProject.province}
              </p>

              <div className="space-y-3 mb-4">
                <input type="email" placeholder="Email" defaultValue={currentProject.developer?.email || ''}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Nombre"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  <input type="tel" placeholder="Teléfono"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <input type="text" placeholder="DNI"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />

                {units.length > 0 && (
                  <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Selecciona la unidad de interés</option>
                    {units.filter(u => u.status === 'AVAILABLE').map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unitNumber} - {unit.bedrooms} dorm - {currency} {unit.price?.toLocaleString('en-US')}
                      </option>
                    ))}
                  </select>
                )}

                <textarea rows={3} placeholder="¡Hola! Quiero que se comuniquen conmigo por este proyecto..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
              </div>

              <div className="space-y-2 mb-4 text-xs text-gray-500">
                <label className="flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-green-600" />
                  <span>Acepto los <span className="underline cursor-pointer">Términos y Condiciones</span> y las <span className="underline cursor-pointer">políticas de privacidad</span>.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" defaultChecked className="mt-0.5 accent-green-600" />
                  <span>Autorizo el uso de mi información para fines adicionales</span>
                </label>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                Contactar
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Info del developer */}
              {currentProject.developer?.companyName && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                  {currentProject.developer.phone && (
                    <p className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      {currentProject.developer.phone}
                    </p>
                  )}
                  {currentProject.developer.ruc && (
                    <p className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4h4v4H9z"/></svg>
                      RUC: {currentProject.developer.ruc}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL GALERÍA COMPLETA ── */}
      {showAllImages && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button onClick={() => setShowAllImages(false)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300">✕</button>

          <div className="w-full max-w-5xl">
            {/* Imagen actual */}
            <div className="relative h-[60vh] mb-4">
              {galleryImagesOnly[currentImageIndex] && (
                <Image src={galleryImagesOnly[currentImageIndex]} alt="Galería"
                  fill className="object-contain" />
              )}
              <button onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition">
                ‹
              </button>
              <button onClick={() => setCurrentImageIndex(Math.min(galleryImagesOnly.length - 1, currentImageIndex + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition">
                ›
              </button>
              <span className="absolute bottom-2 right-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                {currentImageIndex + 1} / {galleryImagesOnly.length}
              </span>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {galleryImagesOnly.map((img, index) => (
                <button key={index} onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    index === currentImageIndex ? 'border-white' : 'border-transparent'
                  }`}>
                  <Image src={img} alt={`thumb ${index}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedUnit.unitNumber}</h3>
                  <p className="text-xs text-gray-400">{currentProject.name}</p>
                </div>
                <button onClick={() => setSelectedUnit(null)}
                  className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Plano de la unidad */}
              <div className="relative h-52 bg-gray-50 border-b border-gray-100 flex items-center justify-center">
                {(selectedUnit as any).blueprintImage ? (
                  <img
                    src={(selectedUnit as any).blueprintImage}
                    alt={`Plano ${selectedUnit.unitNumber}`}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center text-gray-300">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                    </svg>
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

              {/* Info completa de la unidad */}
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4h4v4H9z" /></svg>, label: 'Piso', value: selectedUnit.floor },
                    { icon: <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>, label: 'Área', value: `${selectedUnit.area} m²` },
                    { icon: <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>, label: 'Tipo', value:
                      selectedUnit.type === 'APARTMENT' ? 'Depto' :
                      selectedUnit.type === 'PENTHOUSE' ? 'PH' :
                      selectedUnit.type === 'DUPLEX' ? 'Dúplex' :
                      selectedUnit.type === 'OFFICE' ? 'Oficina' : selectedUnit.type },
                    { icon: <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12V7a2 2 0 012-2h14a2 2 0 012 2v5M3 12h18M3 12v5h18v-5M7 12V9h4v3M13 12V9h4v3" /></svg>, label: 'Dormitorios', value: selectedUnit.bedrooms ?? '-' },
                    { icon: <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12a2 2 0 01-2-2V7h4v3M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5M8 7V5a2 2 0 114 0v2" /></svg>, label: 'Baños', value: selectedUnit.bathrooms },
                    { icon: <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM4 9l2-5h12l2 5M4 9h16M4 9H2m18 0h2" /></svg>, label: 'Estac.', value: selectedUnit.parkingSpots },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="mb-1">{icon}</div>
                      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                      <p className="font-bold text-gray-800 text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Vista */}
                {selectedUnit.view && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    <span>Vista: <strong>{selectedUnit.view}</strong></span>
                  </div>
                )}

                {/* Precio */}
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

              {/* Botones de acción */}
              <div className="px-6 pb-6 flex gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882l6.162-1.616A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.878 9.878 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.859 9.859 0 012.106 12C2.106 6.579 6.579 2.106 12 2.106S21.894 6.579 21.894 12 17.421 21.894 12 21.894z"/>
                  </svg>
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
      })
      ()}
    </main>
  );
}
