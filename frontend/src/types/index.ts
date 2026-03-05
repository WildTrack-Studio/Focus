// Enums
export enum Role {
  ADMIN = 'ADMIN',
  RESEARCHER = 'RESEARCHER',
  VALIDATOR = 'VALIDATOR',
}

export enum ImageStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum DetectionStatus {
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
}

// User
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
  };
}

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Project
export interface Project {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  imageCount?: number;
  detectionCount?: number;
  _count?: {
    images: number;
    users: number;
  };
}

// Image
export interface Image {
  id: string;
  originalName: string;
  filename: string;
  filePath: string;
  url?: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  capturedAt: string | null;
  gpsLocation: any | null;
  exifData: any | null;
  description: string | null;
  status: ImageStatus;
  projectId: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  detectionCount?: number;
  project?: {
    id: string;
    name: string;
  };
  _count?: {
    detections: number;
  };
}

// Detection
export interface Detection {
  id: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  speciesId: string | null;
  predictedLabel: string | null;
  status: DetectionStatus;
  validated: boolean;
  validatedById: string | null;
  validatedAt: string | null;
  mlModelVersion: string | null;
  additionalData: any | null;
  metadata?: any;
  projectId: string | null;
  imageId: string;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
  species?: {
    id: string;
    name: string;
    scientificName: string | null;
  } | null;
  validatedBy?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  image?: {
    id: string;
    filename: string;
    url?: string;
  };
}

// Species
export interface Species {
  id: string;
  name: string;
  scientificName: string | null;
  description: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Statistics
export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<Role, number>;
}

export interface ProjectStatistics {
  totalProjects: number;
  totalImages: number;
  totalDetections: number;
  averageImagesPerProject: number;
  topProjects: Array<{
    project: Project;
    imageCount: number;
    detectionCount: number;
  }>;
}

export interface ImageStatistics {
  total: number;
  byStatus: Record<ImageStatus, number>;
  totalSizeBytes: number;
  totalSizeMB: number;
  recentUploads7Days: number;
}

export interface DetectionStatistics {
  total: number;
  byStatus: Record<DetectionStatus, number>;
  validated: number;
  pending: number;
  rejected: number;
  averageConfidence: number;
  topSpecies: Array<{
    species: Species;
    count: number;
  }>;
}
