import { DniValidationResponse, RucValidationResponse, KycVerification } from '../entities';

export interface IKycRepository {
  validateDni(dni: string): Promise<DniValidationResponse>;
  validateRuc(ruc: string): Promise<RucValidationResponse>;
  completeKyc(userId: string, dni: string, validation: DniValidationResponse): Promise<KycVerification>;
  upgradeToDeveloper(userId: string, ruc: string): Promise<any>;
}
