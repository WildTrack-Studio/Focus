import apiClient from '@/lib/api-client';
import type {
  Project,
  PaginatedResponse,
  ProjectStatistics,
} from '@/types';

interface CreateProjectData {
  name: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isPrivate?: boolean;
}

interface QueryProjectsParams {
  search?: string;
  location?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const projectsService = {
  async getProjects(
    params?: QueryProjectsParams
  ): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  async updateProject(
    id: string,
    data: Partial<CreateProjectData>
  ): Promise<Project> {
    const response = await apiClient.patch(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  async getStatistics(): Promise<ProjectStatistics> {
    const response = await apiClient.get('/projects/statistics');
    return response.data;
  },

  async addUserToProject(
    projectId: string,
    userId: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post(`/projects/${projectId}/users`, {
      userId,
    });
    return response.data;
  },

  async removeUserFromProject(
    projectId: string,
    userId: string
  ): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `/projects/${projectId}/users/${userId}`
    );
    return response.data;
  },

  async getProjectUsers(projectId: string): Promise<any> {
    const response = await apiClient.get(`/projects/${projectId}/users`);
    return response.data;
  },
};
