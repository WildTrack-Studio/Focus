import apiClient from '@/lib/api-client';
import type {
  User,
  PaginatedResponse,
  Role,
  UserStatistics,
} from '@/types';

interface QueryUsersParams {
  search?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  organization?: string;
}

interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  organization?: string;
  isActive?: boolean;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const usersService = {
  async getUsers(params?: QueryUsersParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  async changePassword(
    id: string,
    data: ChangePasswordData
  ): Promise<{ message: string }> {
    const response = await apiClient.patch(`/users/${id}/password`, data);
    return response.data;
  },

  async getStatistics(): Promise<UserStatistics> {
    const response = await apiClient.get('/users/statistics');
    return response.data;
  },
};
