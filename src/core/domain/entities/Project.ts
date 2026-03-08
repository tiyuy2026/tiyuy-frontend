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
  district: string;
  province: string;
  region: string;
  coverImageUrl?: string;
  estimatedDelivery: string;
  isFeatured: boolean;
  isVerified: boolean;
  viewsCount: number;
  contactsCount: number;
}

export interface ProjectUnit {
  id: number;
  unitNumber: string;
  type: 'APARTMENT' | 'OFFICE' | 'PENTHOUSE';
  floor: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
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
}
