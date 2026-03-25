// GROUP ENTITIES - Hexagonal Architecture
// This file belongs to GROUPS module

export type GroupStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type GroupRole = 'ADMIN' | 'MODERATOR' | 'MEMBER';

export interface Group {
  id: number;
  name: string;
  description: string;
  status: GroupStatus;
  memberCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
  isUserMember: boolean;
  userRole?: GroupRole;
}

export interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  userName: string;
  userEmail: string;
  role: GroupRole;
  joinedAt: Date;
  isActive: boolean;
}
