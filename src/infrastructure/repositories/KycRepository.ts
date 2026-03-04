import axiosClient from '../api/axios-client';
import { KYC_ENDPOINTS } from '../api/endpoints';
import { IKycRepository } from '@/core/domain/repositories';
import {
  DniValidationResponse,
  RucValidationResponse,
  KycVerification,
} from '@/core/domain/entities';

export class KycRepository implements IKycRepository {
  async validateDni(dni: string): Promise<DniValidationResponse> {
    try {
      const response = await axiosClient.post<DniValidationResponse>(
        KYC_ENDPOINTS.VALIDATE_DNI,
        { dni }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al validar DNI');
    }
  }

  async validateRuc(ruc: string): Promise<RucValidationResponse> {
    try {
      const response = await axiosClient.post<RucValidationResponse>(
        KYC_ENDPOINTS.VALIDATE_RUC,
        { ruc }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al validar RUC');
    }
  }

  async completeKyc(
    userId: string,
    dni: string,
    validation: DniValidationResponse
  ): Promise<KycVerification> {
    try {
      const response = await axiosClient.post<KycVerification>(
        KYC_ENDPOINTS.COMPLETE_KYC,
        { dni }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al completar KYC');
    }
  }

  async upgradeToDeveloper(userId: string, ruc: string): Promise<any> {
    try {
      const response = await axiosClient.post(KYC_ENDPOINTS.UPGRADE_DEVELOPER, { ruc });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al actualizar a desarrollador'
      );
    }
  }
}
