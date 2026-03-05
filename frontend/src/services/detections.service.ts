import apiClient from '@/lib/api-client';
import type {
  Detection,
  PaginatedResponse,
  DetectionStatus,
  DetectionStatistics,
} from '@/types';

interface QueryDetectionsParams {
  imageId?: string;
  projectId?: string;
  status?: DetectionStatus | string;
  speciesId?: string;
  validatedBy?: string;
  minConfidence?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CreateDetectionData {
  imageId: string;
  boundingBox: any;
  confidence: number;
  speciesId?: string;
  mlModelVersion?: string;
  rawMlOutput?: any;
}

interface ValidateDetectionData {
  status: DetectionStatus;
  validatedSpeciesId?: string;
  validatorNotes?: string;
}

export const detectionsService = {
  async getDetections(
    params?: QueryDetectionsParams
  ): Promise<PaginatedResponse<Detection>> {
    const response = await apiClient.get('/detections', { params });
    return response.data;
  },

  async getDetection(id: string): Promise<Detection> {
    const response = await apiClient.get(`/detections/${id}`);
    return response.data;
  },

  async createDetection(data: CreateDetectionData): Promise<Detection> {
    const response = await apiClient.post('/detections', data);
    return response.data;
  },

  async createBulkDetections(
    data: CreateDetectionData[]
  ): Promise<Detection[]> {
    const response = await apiClient.post('/detections/bulk', data);
    return response.data;
  },

  async validateDetection(
    id: string,
    data: ValidateDetectionData
  ): Promise<Detection> {
    const response = await apiClient.patch(`/detections/${id}/validate`, data);
    return response.data;
  },

  async validateBulkDetections(
    detectionIds: string[],
    data: Omit<ValidateDetectionData, 'validatedSpeciesId'>
  ): Promise<{ message: string; count: number }> {
    const response = await apiClient.patch('/detections/bulk-validate', {
      detectionIds,
      ...data,
    });
    return response.data;
  },

  async updateDetection(
    id: string,
    data: { validated?: boolean; status?: DetectionStatus }
  ): Promise<Detection> {
    const response = await apiClient.patch(`/detections/${id}`, data);
    return response.data;
  },

  async deleteDetection(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/detections/${id}`);
    return response.data;
  },

  async getStatistics(): Promise<DetectionStatistics> {
    const response = await apiClient.get('/detections/statistics');
    return response.data;
  },
};
