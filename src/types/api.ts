// Generic API wrapper types shared across all service responses

export interface PaginatedResponse<T> {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  data: T[];
}

export interface ApiResult<T> {
  success: boolean;
  data: T | null;
  message: string;
  status?: number;
}
