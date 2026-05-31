import L from 'leaflet';

export const DEFAULT_MARKER_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const SELECTED_MARKER_ICON = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const PROPERTY_MARKER_COLORS: Record<string, string> = {
  SALE: '#2563eb',
  RENT: '#16a34a',
};

export function createPropertyPriceMarker(
  transactionType: string,
  priceLabel: string,
  isHighlighted: boolean
): L.DivIcon {
  const color = PROPERTY_MARKER_COLORS[transactionType] || '#2563eb';
  const size = isHighlighted ? 48 : 40;
  const fontSize = isHighlighted ? 12 : 11;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        display: flex; flex-direction: column; align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: ${color}; color: white;
          padding: 4px 8px; border-radius: 8px;
          font-size: ${fontSize}px; font-weight: 700;
          white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: ${isHighlighted ? '3px solid #fbbf24' : '2px solid white'};
          transform: scale(${isHighlighted ? 1.15 : 1});
          transition: transform 0.2s;
        ">
          ${priceLabel}
        </div>
        <div style="
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [size, size + 16],
    iconAnchor: [size / 2, size + 16],
    popupAnchor: [0, -(size + 24)],
  });
}
