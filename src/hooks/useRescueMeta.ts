import { useQuery } from '@tanstack/react-query';
import { fetchPriorityCriteria, type DisasterType } from '../services/rescueService';

export const rescueMetaKeys = {
  all: ['rescueMeta'] as const,
  priorityCriteria: (disasterType: DisasterType) =>
    [...rescueMetaKeys.all, 'priorityCriteria', disasterType] as const,
};

export function usePriorityCriteria(
  disasterType: DisasterType,
  enabled = true,
) {
  return useQuery({
    queryKey: rescueMetaKeys.priorityCriteria(disasterType),
    queryFn: () => fetchPriorityCriteria(disasterType),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
