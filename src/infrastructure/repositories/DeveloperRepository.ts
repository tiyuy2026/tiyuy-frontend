import { axiosClient } from '../api/axios-client';
import { PromotionCampaign, MarketingStats, CreatePromotionCampaignRequest, UpdatePromotionCampaignRequest, Banner, CreateBannerRequest } from '@/core/domain/entities/Admin';
import { PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';

export interface TargetEntity {
  id: number;
  title: string;
  type: 'PROPERTY' | 'PROJECT';
  status: string;
  imageUrl: string | null;
  price: string;
  location: string;
}

const BASE_URL = '/v1/developer';

export class DeveloperRepository {
  // Marketing
  async getMarketingStats(): Promise<MarketingStats> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/stats`);
    return response.data;
  }

  async getMyCampaigns(params?: { page?: number; size?: number }): Promise<PaginatedResponse<PromotionCampaign>> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/campaigns`, { params });
    return response.data;
  }

  async createMyCampaign(request: CreatePromotionCampaignRequest): Promise<PromotionCampaign> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/campaigns`, request);
    return response.data;
  }

  async updateMyCampaign(id: number, request: UpdatePromotionCampaignRequest): Promise<PromotionCampaign> {
    const response = await axiosClient.put(`${BASE_URL}/marketing/campaigns/${id}`, request);
    return response.data;
  }

  async deleteMyCampaign(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/marketing/campaigns/${id}`);
  }

  // Banners
  async getMyBanners(): Promise<Banner[]> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/banners`);
    return response.data;
  }

  async createMyBanner(request: CreateBannerRequest): Promise<Banner> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/banners`, request);
    return response.data;
  }

  async updateMyBanner(id: number, request: CreateBannerRequest): Promise<Banner> {
    const response = await axiosClient.put(`${BASE_URL}/marketing/banners/${id}`, request);
    return response.data;
  }

  async deleteMyBanner(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/marketing/banners/${id}`);
  }

  // Publish (DRAFT → PENDING_APPROVAL)
  async publishMyCampaign(id: number): Promise<PromotionCampaign> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/campaigns/${id}/publish`);
    return response.data;
  }

  // Renew
  async renewCampaign(id: number, paymentRequest: any): Promise<PromotionCampaign> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/campaigns/${id}/renew`, paymentRequest);
    return response.data;
  }

  // Pay
  async payForCampaign(id: number, paymentRequest: any): Promise<PromotionCampaign> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/campaigns/${id}/pay`, paymentRequest);
    return response.data;
  }

  // Target Entities (for campaign linking)
  async getTargetEntities(): Promise<TargetEntity[]> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/target-entities`);
    return response.data;
  }

  // Pricing List
  async getPricingList(): Promise<any[]> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/pricing`);
    return response.data;
  }

  // Image Upload
  async uploadCampaignImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post(`${BASE_URL}/marketing/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.imageUrl;
  }
}
