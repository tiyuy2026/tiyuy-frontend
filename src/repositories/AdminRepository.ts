import axiosClient from "@/infrastructure/api/axios-client";

export const adminRepository = {
  async getAdminByUserId(userId: number) {
    const response = await axiosClient.get(`/admin/admins/by-user/${userId}`);
    return response.data;
  },
};
