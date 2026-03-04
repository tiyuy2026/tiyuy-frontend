import { axiosClient } from '../api/axios-client';
import { ENDPOINTS } from '../api/endpoints';
import { IContactRepository } from '@/core/domain/repositories/IContactRepository';
import { Contact, SendContactData, ContactListItem } from '@/core/domain/entities/Contact';
import { 
  SendContactRequestDTO, 
  ContactResponseDTO, 
  ContactPageDTO,
  UnreadCountDTO 
} from '@/core/application/dtos/ContactDTO';

export class ContactRepository implements IContactRepository {
  private mapToContact(dto: ContactResponseDTO): Contact {
    return {
      id: dto.id,
      propertyId: dto.propertyId,
      propertyTitle: dto.propertyTitle,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      message: dto.message,
      status: dto.status as any,
      preferredContactMethod: dto.preferredContactMethod as any,
      isRead: dto.isRead,
      createdAt: new Date(dto.createdAt),
      ownerName: dto.ownerName,
      ownerEmail: dto.ownerEmail,
      ownerPhone: dto.ownerPhone,
    };
  }

  private mapToListItem(dto: ContactResponseDTO): ContactListItem {
    return {
      id: dto.id,
      propertyId: dto.propertyId,
      propertyTitle: dto.propertyTitle,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      message: dto.message,
      status: dto.status as any,
      isRead: dto.isRead,
      createdAt: new Date(dto.createdAt),
    };
  }

  async sendContact(data: SendContactData): Promise<Contact> {
    const requestBody: SendContactRequestDTO = {
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      message: data.message,
      preferredContactMethod: data.preferredContactMethod,
    };

    const response = await axiosClient.post<ContactResponseDTO>(
      ENDPOINTS.CONTACTS.CONTACT_PROPERTY(data.propertyId),
      requestBody
    );

    return this.mapToContact(response.data);
  }

  async markAsRead(contactId: number): Promise<Contact> {
    const response = await axiosClient.patch<ContactResponseDTO>(
      ENDPOINTS.CONTACTS.MARK_READ(contactId)
    );

    return this.mapToContact(response.data);
  }

  async getUnreadCount(): Promise<number> {
    const response = await axiosClient.get<UnreadCountDTO>(
      ENDPOINTS.CONTACTS.UNREAD_COUNT
    );

    return response.data.unreadCount;
  }

  async getSentContacts(page = 0, size = 20): Promise<{
    content: ContactListItem[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }> {
    const response = await axiosClient.get<ContactPageDTO>(
      ENDPOINTS.CONTACTS.SENT,
      {
        params: { page, size, sort: 'createdAt,desc' },
      }
    );

    return {
      content: response.data.content.map(this.mapToListItem),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      page: response.data.number,
      size: response.data.size,
    };
  }

  async getReceivedContacts(page = 0, size = 20): Promise<{
    content: ContactListItem[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }> {
    const response = await axiosClient.get<ContactPageDTO>(
      ENDPOINTS.CONTACTS.RECEIVED,
      {
        params: { page, size, sort: 'createdAt,desc' },
      }
    );

    return {
      content: response.data.content.map(this.mapToListItem),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      page: response.data.number,
      size: response.data.size,
    };
  }
}
