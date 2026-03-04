import { Contact, SendContactData, ContactListItem } from '../entities/Contact';

export interface IContactRepository {
  sendContact(data: SendContactData): Promise<Contact>;
  markAsRead(contactId: number): Promise<Contact>;
  getUnreadCount(): Promise<number>;
  getSentContacts(page?: number, size?: number): Promise<{
    content: ContactListItem[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }>;
  getReceivedContacts(page?: number, size?: number): Promise<{
    content: ContactListItem[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }>;
}
