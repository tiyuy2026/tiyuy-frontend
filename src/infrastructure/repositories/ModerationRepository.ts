import { apiClient } from '../api/axios-client';
import { IModerationRepository } from '@/core/domain/repositories/IModerationRepository';
import { PropertyReport, ReportPropertyRequest, ReviewReportRequest } from '@/core/domain/entities/Moderation';

export class ModerationRepository implements IModerationRepository {
  async reportProperty(request: ReportPropertyRequest): Promise<PropertyReport> {
    const response = await apiClient.post(
      `/moderation/reports/properties/${request.propertyId}`,
      {
        reason: request.reason,
        description: request.description,
      }
    );

    return {
      id: response.data.id,
      propertyId: response.data.propertyId,
      propertyTitle: response.data.propertyTitle,
      reporterId: response.data.reporterId,
      reporterName: response.data.reporterName,
      reason: response.data.reason,
      reasonDescription: response.data.reasonDescription,
      description: response.data.description,
      status: response.data.status,
      reviewedBy: response.data.reviewedBy,
      reviewerName: response.data.reviewerName,
      reviewNotes: response.data.reviewNotes,
      actionTaken: response.data.actionTaken,
      createdAt: new Date(response.data.createdAt),
      reviewedAt: response.data.reviewedAt ? new Date(response.data.reviewedAt) : undefined,
    };
  }

  async reviewReport(request: ReviewReportRequest): Promise<PropertyReport> {
    const params = new URLSearchParams();
    params.append('approve', request.approve.toString());
    if (request.notes) params.append('notes', request.notes);

    const response = await apiClient.patch(
      `/moderation/reports/${request.reportId}/review?${params}`
    );

    return {
      id: response.data.id,
      propertyId: response.data.propertyId,
      propertyTitle: response.data.propertyTitle,
      reporterId: response.data.reporterId,
      reporterName: response.data.reporterName,
      reason: response.data.reason,
      reasonDescription: response.data.reasonDescription,
      description: response.data.description,
      status: response.data.status,
      reviewedBy: response.data.reviewedBy,
      reviewerName: response.data.reviewerName,
      reviewNotes: response.data.reviewNotes,
      actionTaken: response.data.actionTaken,
      createdAt: new Date(response.data.createdAt),
      reviewedAt: response.data.reviewedAt ? new Date(response.data.reviewedAt) : undefined,
    };
  }

  async getPendingReports(page = 0, size = 20): Promise<{
    content: PropertyReport[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/moderation/reports/pending', {
      params: { page, size, sort: 'createdAt,desc' },
    });

    return {
      content: response.data.content.map((item: any) => ({
        id: item.id,
        propertyId: item.propertyId,
        propertyTitle: item.propertyTitle,
        reporterId: item.reporterId,
        reporterName: item.reporterName,
        reason: item.reason,
        reasonDescription: item.reasonDescription,
        description: item.description,
        status: item.status,
        reviewedBy: item.reviewedBy,
        reviewerName: item.reviewerName,
        reviewNotes: item.reviewNotes,
        actionTaken: item.actionTaken,
        createdAt: new Date(item.createdAt),
        reviewedAt: item.reviewedAt ? new Date(item.reviewedAt) : undefined,
      })),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
    };
  }
}
