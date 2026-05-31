import { MapSearchResult } from '@/core/domain/entities/Property';
import { PropertyFilter } from '@/core/domain/entities/PropertyFilter';
import { IPropertyRepository } from '@/core/domain/repositories/IPropertyRepository';

export class SearchPropertiesForMapUseCase {
  constructor(private propertyRepository: IPropertyRepository) {}

  async execute(filters: PropertyFilter): Promise<MapSearchResult> {
    return this.propertyRepository.searchForMap(filters);
  }
}
