import { Payment, PaymentRequest } from '../entities/Wallet';

export interface IPaymentRepository {
  processPayment(request: PaymentRequest): Promise<Payment>;
  getPaymentById(paymentId: number): Promise<Payment>;
  getMyPayments(page?: number, size?: number): Promise<{
    content: Payment[];
    totalElements: number;
    totalPages: number;
  }>;
  getTotalPaid(): Promise<{ totalPaid: number; currency: string }>;
}
