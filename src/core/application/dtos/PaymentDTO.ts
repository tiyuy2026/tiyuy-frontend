// DTOs para mapeo entre API y Domain

export interface PaymentResponseDTO {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  description: string;
  transactionId: string;
  errorMessage?: string | null;
  paidAt?: string; // ISO string
  createdAt: string; // ISO string
  phone?: string;
  lastFour?: string;
}

export interface PaymentPageDTO {
  totalElements: number;
  totalPages: number;
  number: number; // página actual (0-based)
  size: number;
  content: PaymentResponseDTO[];
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface TotalPaidDTO {
  totalPaid: number;
  currency: string;
}

export interface PaymentRequestDTO {
  token: string;
  amount: number;
  description: string;
}
