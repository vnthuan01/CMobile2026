import { useQuery } from '@tanstack/react-query';
import { fetchMyRescueRequests } from '../services/rescueService';
import type { MyRescueRequestItem } from '../types/rescue';

export const rescueRequestKeys = {
  all: ['rescueRequests'] as const,
  myList: (pageNumber: number, pageSize: number) =>
    [...rescueRequestKeys.all, 'myList', { pageNumber, pageSize }] as const,
};

interface UseMyRescueRequestsOptions {
  pageNumber?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useMyRescueRequests({
  pageNumber = 1,
  pageSize = 20,
  enabled = true,
}: UseMyRescueRequestsOptions = {}) {
  return useQuery({
    queryKey: rescueRequestKeys.myList(pageNumber, pageSize),
    queryFn: () => fetchMyRescueRequests({ pageNumber, pageSize }),
    enabled,
    select: (data) => data.data ?? ([] as MyRescueRequestItem[]),
  });
}
