export type ReportReason = 'SPAM' | 'SCAM' | 'INCORRECT_DATA' | 'OFFENSIVE' | 'DUPLICATE' | 'OTHER';
export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PropertyReport {
  id: number;
  propertyId: number;
  propertyTitle: string;
  reporterId: number;
  reporterName: string;
  reason: ReportReason;
  reasonDescription: string;
  description: string;
  status: ReportStatus;
  reviewedBy?: number;
  reviewerName?: string;
  reviewNotes?: string;
  actionTaken: boolean;
  createdAt: Date;
  reviewedAt?: Date;
}

export interface ReportPropertyRequest {
  propertyId: number;
  reason: ReportReason;
  description: string;
}

export interface ReviewReportRequest {
  reportId: number;
  approve: boolean;
  notes?: string;
}
