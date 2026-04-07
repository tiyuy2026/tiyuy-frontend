'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardContent } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { axiosClient } from '@/infrastructure/api/axios-client';

interface Group {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  memberCount: number;
  isMember: boolean;
  isOwner: boolean;
  shareLink: string;
  createdAt: string;
  category: string | null;
}

interface GroupMember {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joinedAt: string;
}

const fetchGroups = async (): Promise<Group[]> => {
  const response = await axiosClient.get('/contacts/extended/groups');
  return response.data.content || [];
};

const fetchGroupMembers = async (groupId: number): Promise<GroupMember[]> => {
  const response = await axiosClient.get(`/contacts/extended/groups/${groupId}/members`);
  return response.data;
};

const createGroup = async (data: { name: string; description: string; category?: string }): Promise<Group> => {
  const response = await axiosClient.post('/contacts/extended/groups', data);
  return response.data;
};

const updateGroup = async (groupId: number, data: { name: string; description: string; category?: string }): Promise<Group> => {
  const response = await axiosClient.put(`/contacts/extended/groups/${groupId}`, data);
  return response.data;
};

const deleteGroup = async (groupId: number): Promise<void> => {
  await axiosClient.delete(`/contacts/extended/groups/${groupId}`);
};

const removeGroupMember = async ({ groupId, userId }: { groupId: number; userId: number }): Promise<void> => {
  await axiosClient.delete(`/contacts/extended/groups/${groupId}/members/${userId}`);
};

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', description: '', category: '' });

  const { hasPermission } = usePermissions();
  const canManageGroups = hasPermission('MANAGE_GROUPS');
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: fetchGroups,
  });

  const { data: groupMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['group-members', selectedGroup?.id],
    queryFn: () => fetchGroupMembers(selectedGroup!.id),
    enabled: !!selectedGroup && isMembersModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      setIsCreateModalOpen(false);
      setGroupForm({ name: '', description: '', category: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateGroup>[1] }) => updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      setIsEditModalOpen(false);
      setSelectedGroup(null);
      setGroupForm({ name: '', description: '', category: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      setIsDeleteModalOpen(false);
      setSelectedGroup(null);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeGroupMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', selectedGroup?.id] });
    },
  });

  const handleCreateGroup = () => {
    createMutation.mutate(groupForm);
  };

  const handleUpdateGroup = () => {
    if (!selectedGroup) return;
    updateMutation.mutate({ id: selectedGroup.id, data: groupForm });
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;
    deleteMutation.mutate(selectedGroup.id);
  };

  const handleRemoveMember = (userId: number) => {
    if (!selectedGroup) return;
    removeMemberMutation.mutate({ groupId: selectedGroup.id, userId });
  };

  const openEditModal = (group: Group) => {
    setSelectedGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description,
      category: group.category || '',
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (group: Group) => {
    setSelectedGroup(group);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };

  const openMembersModal = (group: Group) => {
    setSelectedGroup(group);
    setIsMembersModalOpen(true);
  };

  const filteredGroups = groups?.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups Management</h1>
          <p className="text-gray-600 mt-1">Manage user groups and memberships</p>
        </div>
        {canManageGroups && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            Create Group
          </button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups?.map((group) => (
                <div
                  key={group.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                      {group.name[0]}
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {group.memberCount} members
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openViewModal(group)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                    >
                      View Details
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openMembersModal(group)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        Members
                      </button>
                      {canManageGroups && (
                        <>
                          <button
                            onClick={() => openEditModal(group)}
                            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(group)}
                            className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredGroups?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No groups found matching your search
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Group"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
            <Input
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              placeholder="Enter group name..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              placeholder="Enter group description..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category (Optional)</label>
            <Input
              value={groupForm.category}
              onChange={(e) => setGroupForm({ ...groupForm, category: e.target.value })}
              placeholder="Enter category..."
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={createMutation.isPending || !groupForm.name || !groupForm.description}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Group"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
            <Input
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              placeholder="Enter group name..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              placeholder="Enter group description..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Input
              value={groupForm.category}
              onChange={(e) => setGroupForm({ ...groupForm, category: e.target.value })}
              placeholder="Enter category..."
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateGroup}
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Group Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Group Details"
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-2xl font-bold">
                {selectedGroup.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedGroup.name}</h3>
                <p className="text-gray-600">{selectedGroup.memberCount} members</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-900">{selectedGroup.description}</p>
            </div>
            {selectedGroup.category && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {selectedGroup.category}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Created</p>
              <p className="text-gray-900">{new Date(selectedGroup.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Share Link</p>
              <p className="text-gray-900 text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg">
                {selectedGroup.shareLink}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Group Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Group"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this group? This action cannot be undone.
          </p>
          <p className="text-gray-900 font-medium">{selectedGroup?.name}</p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteGroup}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Group'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Group Members Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title={`Members - ${selectedGroup?.name}`}
        size="lg"
      >
        {isLoadingMembers ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                    {canManageGroups && <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {groupMembers?.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-sm font-semibold">
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          member.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'MODERATOR' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      {canManageGroups && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={removeMemberMutation.isPending}
                            className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {groupMembers?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No members in this group
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
