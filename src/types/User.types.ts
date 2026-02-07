// 1. User - Full entity from database
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  extraFields?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// 2. UserFormData - For creating/updating users
export interface UserFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

// 3. ApiResponse - Standard API response
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// 4. PaginationMetadata - Pagination info from server
export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// 5. PaginatedResponse - API response with pagination
export interface PaginatedResponse<T> {
  data: T;
  pagination: PaginationMetadata;
}