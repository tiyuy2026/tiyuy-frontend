import { axiosClient } from '../api/axios-client';
import { ENDPOINTS } from '../api/endpoints';
import { IPropertyRepository, CreatePropertyData, UpdatePropertyData } from '@/core/domain/repositories/IPropertyRepository';
import { Property, PropertySummary, PropertyMedia } from '@/core/domain/entities/Property';
import { PropertyFilter, PropertySearchResult } from '@/core/domain/entities/PropertyFilter';
import { PropertyMapper } from '@/core/application/mappers/PropertyMapper';

export class PropertyRepository implements IPropertyRepository {
  async search(filters: PropertyFilter): Promise<PropertySearchResult> {
    console.log('🔍 Enviando filtros al backend:', JSON.stringify(filters, null, 2));
    
    const response = await axiosClient.get(ENDPOINTS.PROPERTIES.SEARCH, {
      params: {
        type: filters.type,
        transactionType: filters.transactionType,
        district: filters.district,
        province: filters.province,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minBedrooms: filters.minBedrooms,
        minBathrooms: filters.minBathrooms,
        minParkingSpots: filters.minParkingSpots,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
        page: filters.page || 0,
        size: filters.size || 20,
        sort: filters.sort || 'createdAt,desc',
      },
    });

    console.log('📥 Respuesta del backend:', {
      totalElements: response.data.totalElements,
      first: response.data.first,
      content: response.data.content?.length || 0
    });

    return {
      properties: response.data.content.map(PropertyMapper.toSummary),
      pagination: {
        currentPage: response.data.number,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        pageSize: response.data.size,
        hasNext: !response.data.last,
        hasPrevious: !response.data.first,
      },
    };
  }

  async getBySlug(slug: string): Promise<Property> {
    const maybeId = Number(slug);
    if (!Number.isNaN(maybeId) && maybeId > 0) {
      return this.getById(maybeId);
    }

    // Buscar directamente por slug sin extraer ID
    console.log('Buscando por slug directamente:', slug);
    const response = await axiosClient.get(ENDPOINTS.PROPERTIES.BY_SLUG(slug));
    return PropertyMapper.toDomain(response.data.property);
  }

// En PropertyRepository.ts, método getById
async getById(id: number): Promise<Property> {
  const response = await axiosClient.get(`${ENDPOINTS.PROPERTIES.BASE}/${id}`);
  console.log('🔥 RAW response.data:', JSON.stringify(response.data, null, 2));
  const dto = response.data?.property ? response.data.property : response.data;
  return PropertyMapper.toDomain(dto);
}
  

  async create(data: CreatePropertyData): Promise<Property> {
    const response = await axiosClient.post(ENDPOINTS.PROPERTIES.BASE, data);
    return PropertyMapper.toDomain(response.data);
  }

  async update(id: number, data: UpdatePropertyData): Promise<Property> {
    const response = await axiosClient.patch(`${ENDPOINTS.PROPERTIES.BASE}/${id}`, data);
    const dto = response.data?.property ? response.data.property : response.data;
    return PropertyMapper.toDomain(dto);
  }

  async publish(id: number): Promise<PropertySummary> {
    const response = await axiosClient.patch(ENDPOINTS.PROPERTIES.PUBLISH(id));
    return PropertyMapper.toSummary(response.data);
  }

  async delete(id: number): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.PROPERTIES.BASE}/${id}`);
  }

  async getMyProperties(page = 0, size = 20): Promise<PropertySearchResult> {
    const response = await axiosClient.get(ENDPOINTS.PROPERTIES.MY_PROPERTIES, {
      params: { page, size },
    });

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.debug('[my-properties] raw page keys:', Object.keys(response.data || {}));
      // eslint-disable-next-line no-console
      console.debug('[my-properties] first item:', response.data?.content?.[0]);
    }

    return {
      properties: response.data.content.map(PropertyMapper.toSummary),
      pagination: {
        currentPage: response.data.number,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        pageSize: response.data.size,
        hasNext: !response.data.last,
        hasPrevious: !response.data.first,
      },
    };
  }

  async uploadPhotos(propertyId: number, files: File[]): Promise<PropertyMedia[]> {
    const formData = new FormData();

    // Agregar cada archivo con la key 'files' para el endpoint batch
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Usar el nuevo endpoint batch (sin /api porque ya está en baseURL)
    const response = await axiosClient.post(
      `/media/${propertyId}/photos/batch`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async deletePhoto(mediaId: number): Promise<void> {
    await axiosClient.delete(ENDPOINTS.PROPERTIES.DELETE_PHOTO(mediaId));
  }

  async featureProperty(propertyId: number): Promise<any> {
    const response = await axiosClient.patch(ENDPOINTS.PROPERTIES.FEATURE(propertyId));
    return response.data;
  }

  async getFeaturedProperties(page = 0, size = 4): Promise<PropertySearchResult> {
    try {
      const response = await axiosClient.get(ENDPOINTS.PROPERTIES.SEARCH, {
        params: {
          page,
          size,
          isFeatured: true,
          sort: 'createdAt,desc'
        },
        timeout: 120000, // Aumentar timeout a 2 minutos
      });

      return {
        properties: response.data.content.map(PropertyMapper.toSummary),
        pagination: {
          currentPage: response.data.number,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
          pageSize: response.data.size,
          hasNext: !response.data.last,
          hasPrevious: !response.data.first,
        },
      };
    } catch (error) {
      console.error('Error loading featured properties:', error);
      // Retornar datos vacíos en caso de error para que la app no se rompa
      return {
        properties: [],
        pagination: {
          currentPage: 0,
          totalPages: 0,
          totalElements: 0,
          pageSize: size,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }
  }

  async setCoverPhoto(propertyId: number, mediaId: number): Promise<void> {
    await axiosClient.patch(`${ENDPOINTS.PROPERTIES.BASE}/${propertyId}/cover-photo/${mediaId}`);
  }
}
