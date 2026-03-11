export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED';
  phase: 'PRE_SALE' | 'SALE' | 'DELIVERY';
  type: 'INDUSTRIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'RESIDENTIAL';
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  priceFrom: number;
  priceTo?: number;
  currency: 'PEN' | 'USD';
  // Ubicación completa
  district: string;
  province: string;
  region: string;
  urbanization?: string;
  address?: string;
  fullAddress?: string;
  street?: string;
  streetNumber?: string;
  number?: string; 
  latitude?: number;
  longitude?: number;
  areaFrom?: number;
  areaTo?: number;
  floors?: number;
  coverImageUrl?: string;
  constructionStart?: string; 
  startDate?: string; 
  estimatedDelivery: string;
  timeline?: Array<{
    id: number;
    phase: string;
    date: string;
    description: string;
  }>;
  amenities?: string[];
  certifications?: string[];
  milestones?: Array<{
    title: string;
    date: string;
    completed: boolean;
  }>;
  images?: string[];
  blueprints?: string[];
  renders?: string[];
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount: number;
  contactsCount: number;
}

export interface ProjectUnit {
  id: number;
  unitNumber: string;
  type: 'APARTMENT' | 'DUPLEX' | 'PENTHOUSE' | 'OFFICE' | 'STORE' | 'WAREHOUSE';
  floor: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'BLOCKED';
  view?: string;
  image?: string;        // Imagen de la unidad
  blueprintImage?: string; // Plano de la unidad
}

export interface ProjectFull extends Project {
  developer: {
    id: number;
    companyName: string;
    ruc: string;
    email: string;
    phone: string;
  };
  units: ProjectUnit[];
  amenities: string[];
  images?: string[];
  blueprints?: string[];
  renders?: string[];
}
