import { useQuery } from '@tanstack/react-query';
import { fetchRescueRequestDetail } from '../services/rescueService';

export const rescueDetailKeys = {
  all: ['rescueRequestDetail'] as const,
  detail: (requestId: string) =>
    [...rescueDetailKeys.all, requestId] as const,
};

export function useRescueRequestDetail(requestId: string | null) {
  return useQuery({
    queryKey: rescueDetailKeys.detail(requestId ?? ''),
    queryFn: () => fetchRescueRequestDetail(requestId!),
    enabled: !!requestId,
    staleTime: 1000 * 15, // detail refreshes faster: 15s
  });
}
