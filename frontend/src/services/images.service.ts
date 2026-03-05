import apiClient from '@/lib/api-client';
import type {
  Image,
  PaginatedResponse,
  ImageStatus,
  ImageStatistics,
} from '@/types';

interface QueryImagesParams {
  projectId?: string;
  status?: ImageStatus | string;
  uploadedBy?: string;
  validatedBy?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UpdateImageData {
  filename?: string;
  description?: string;
  status?: ImageStatus;
  validatedBy?: string;
}

export const imagesService = {
  async getImages(
    params?: QueryImagesParams
  ): Promise<PaginatedResponse<Image>> {
    const response = await apiClient.get('/images', { params });
    return response.data;
  },

  async getImage(id: string): Promise<Image> {
    const response = await apiClient.get(`/images/${id}`);
    return response.data;
  },

  async uploadImage(
    projectId: string,
    file: File,
    description?: string
  ): Promise<Image> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadMultipleImages(
    projectId: string,
    files: File[],
    description?: string
  ): Promise<Image[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('projectId', projectId);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/images/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateImage(id: string, data: UpdateImageData): Promise<Image> {
    const response = await apiClient.patch(`/images/${id}`, data);
    return response.data;
  },

  async deleteImage(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/images/${id}`);
    return response.data;
  },

  async downloadImage(id: string): Promise<Blob> {
    const response = await apiClient.get(`/images/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getStatistics(): Promise<ImageStatistics> {
    const response = await apiClient.get('/images/statistics');
    return response.data;
  },

  getImageUrl(id: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/images/${id}/download`;
  },
};
