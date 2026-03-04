import { PropertyReport, ReportPropertyRequest, ReviewReportRequest } from '../entities/Moderation';

export interface IModerationRepository {
  reportProperty(request: ReportPropertyRequest): Promise<PropertyReport>;
  reviewReport(request: ReviewReportRequest): Promise<PropertyReport>;
  getPendingReports(page?: number, size?: number): Promise<{
    content: PropertyReport[];
    totalElements: number;
    totalPages: number;
  }>;
}
