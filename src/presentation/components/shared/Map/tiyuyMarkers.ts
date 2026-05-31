'use client';

/**
 * Marcadores personalizados de Tiyuy para Leaflet
 * Estilo tipo Urbania/Google Maps con la marca Tiyuy
 */

// SVG del marcador tipo chincheta de Tiyuy (color brand)
export const TIYUY_MARKER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 56" width="40" height="56">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  <path d="M20 0C9 0 0 9 0 20c0 15 20 36 20 36s20-21 20-36C40 9 31 0 20 0z" fill="url(#grad)" filter="url(#shadow)"/>
  <circle cx="20" cy="18" r="8" fill="white" opacity="0.9"/>
  <text x="20" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#2563EB">T</text>
</svg>`;

// SVG del marcador seleccionado (más grande, con glow)
export const TIYUY_MARKER_SELECTED_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="48" height="64">
  <defs>
    <linearGradient id="gradSel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
    <filter id="shadowSel" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-opacity="0.4"/>
    </filter>
  </defs>
  <path d="M24 0C11 0 0 11 0 24c0 18 24 40 24 40s24-22 24-40C48 11 37 0 24 0z" fill="url(#gradSel)" filter="url(#shadowSel)"/>
  <circle cx="24" cy="22" r="10" fill="white" opacity="0.95"/>
  <text x="24" y="27" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#2563EB">T</text>
</svg>`;

// SVG del marcador con precio (tipo Urbania - badge con precio)
export function createPriceMarkerSvg(price: string, isSelected: boolean = false): string {
  const bgColor = isSelected ? '#2563EB' : '#1F2937';
  const textColor = '#FFFFFF';
  const borderColor = isSelected ? '#3B82F6' : '#374151';
  
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 36" width="140" height="36">
  <defs>
    <filter id="shadowPrice" x="-10%" y="-10%" width="120%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="140" height="30" rx="15" ry="15" fill="${bgColor}" filter="url(#shadowPrice)"/>
  <rect x="0" y="0" width="140" height="30" rx="15" ry="15" fill="none" stroke="${borderColor}" stroke-width="1"/>
  <text x="70" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${textColor}">${price}</text>
  <polygon points="65,30 75,30 70,38" fill="${bgColor}"/>
</svg>`;
}

// SVG del cluster (grupo de marcadores)
export function createClusterSvg(count: number): string {
  const size = count > 99 ? 56 : count > 9 ? 48 : 40;
  const fontSize = count > 99 ? 14 : count > 9 ? 16 : 18;
  
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#2563EB" opacity="0.9"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 6}" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
  <text x="${size/2}" y="${size/2 + fontSize/3}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">${count}</text>
</svg>`;
}

/**
 * Crea un icono Leaflet personalizado de Tiyuy
 */
export function createTiyuyIcon(isSelected: boolean = false): any {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  const svgContent = isSelected ? TIYUY_MARKER_SELECTED_SVG : TIYUY_MARKER_SVG;
  const size = isSelected ? [48, 64] : [40, 56];
  const anchor = isSelected ? [24, 64] : [20, 56];
  
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgContent)}`,
    iconSize: size as [number, number],
    iconAnchor: anchor as [number, number],
    popupAnchor: [0, -size[1]],
  });
}

/**
 * Crea un icono Leaflet con precio (tipo Urbania)
 * @param color - Color personalizado para el badge (opcional)
 */
export function createPriceIcon(price: string, isSelected: boolean = false, color?: string): any {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  const svgContent = createPriceMarkerSvg(price, isSelected);
  
  // Si se especifica un color personalizado, modificar el SVG
  let finalSvg = svgContent;
  if (color && !isSelected) {
    finalSvg = svgContent.replace(/#1F2937/g, color).replace(/#374151/g, color);
  }
  
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(finalSvg)}`,
    iconSize: [140, 38],
    iconAnchor: [70, 38],
    popupAnchor: [0, -45],
  });
}

/**
 * Crea un icono Leaflet con precio y color según el origen del marcador
 * - EXACT_DISTRICT: verde oscuro (#059669)
 * - NEARBY_DISTRICTS: verde claro (#10b981)
 * - Otros (expansión): azul (#3b82f6)
 */
export function createColoredPriceIcon(price: string, matchType: 'EXACT' | 'NEARBY' | 'EXPANDED', isSelected: boolean = false): any {
  const colorMap = {
    'EXACT': '#059669',
    'NEARBY': '#10b981',
    'EXPANDED': '#3b82f6',
  };
  return createPriceIcon(price, isSelected, colorMap[matchType]);
}

/**
 * Crea un icono Leaflet para cluster
 */
export function createClusterIcon(count: number): any {
  if (typeof window === 'undefined') return null;
  
  const L = require('leaflet');
  const svgContent = createClusterSvg(count);
  const size = count > 99 ? 56 : count > 9 ? 48 : 40;
  
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px">${svgContent}</div>`,
    className: 'tiyuy-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
}
