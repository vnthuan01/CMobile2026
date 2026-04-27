import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reliefDistributionService } from '../services/reliefDistributionService';
import { leaderTaskKeys } from './useLeaderTasks';
import type {
  CampaignPackageQueryRequest,
  DistributionPointQueryRequest,
  DeliveryQueryRequest,
  HouseholdQueryRequest,
  UpdateCampaignHouseholdStatusRequest,
  CreateSupplyShortageRequestPayload,
  SupplyShortageRequestQueryRequest,
  CompleteHouseholdDeliveryRequest,
  CompleteHouseholdDeliveryBatchRequest,
} from '../types/reliefDistribution';

export const reliefKeys = {
  all: ['relief'] as const,
  inventoryBalance: (campaignId: string) =>
    [...reliefKeys.all, 'inventoryBalance', campaignId] as const,
  packages: (campaignId: string, query?: CampaignPackageQueryRequest) =>
    [...reliefKeys.all, 'packages', campaignId, query ?? {}] as const,
  distributionPoints: (campaignId: string, query?: DistributionPointQueryRequest) =>
    [...reliefKeys.all, 'distributionPoints', campaignId, query ?? {}] as const,
  households: (campaignId: string, query?: HouseholdQueryRequest) =>
    [...reliefKeys.all, 'households', campaignId, query ?? {}] as const,
  checklist: (campaignId: string, query?: DeliveryQueryRequest) =>
    [...reliefKeys.all, 'checklist', campaignId, query ?? {}] as const,
  deliveryDetail: (campaignId: string, householdDeliveryId: string) =>
    [...reliefKeys.all, 'deliveryDetail', campaignId, householdDeliveryId] as const,
  shortageRequests: (campaignId: string, query?: SupplyShortageRequestQueryRequest) =>
    [...reliefKeys.all, 'shortageRequests', campaignId, query ?? {}] as const,
};

// ─── Distribution Points (with lat/lng for map) ────────────

export function useInventoryBalance(campaignId?: string | null) {
  return useQuery({
    queryKey: reliefKeys.inventoryBalance(campaignId || ''),
    queryFn: async () => {
      const result = await reliefDistributionService.getInventoryBalance(campaignId || '');
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
  });
}

export function useCampaignPackages(
  campaignId?: string | null,
  query?: CampaignPackageQueryRequest,
) {
  return useQuery({
    queryKey: reliefKeys.packages(campaignId || '', query),
    queryFn: async () => {
      const result = await reliefDistributionService.getCampaignPackages(campaignId || '', query);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
  });
}

export function useDistributionPoints(
  campaignId?: string | null,
  query?: DistributionPointQueryRequest,
) {
  return useQuery({
    queryKey: reliefKeys.distributionPoints(campaignId || '', query),
    queryFn: async () => {
      const result = await reliefDistributionService.getDistributionPoints(campaignId || '', query);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
  });
}

// ─── Households ────────────────────────────────────────────

export function useCampaignHouseholds(
  campaignId?: string | null,
  query?: HouseholdQueryRequest,
) {
  return useQuery({
    queryKey: reliefKeys.households(campaignId || '', query),
    queryFn: async () => {
      const result = await reliefDistributionService.getCampaignHouseholds(campaignId || '', query);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
  });
}

export function useReliefChecklist(
  campaignId?: string | null,
  query?: DeliveryQueryRequest,
) {
  return useQuery({
    queryKey: reliefKeys.checklist(campaignId || '', query),
    queryFn: async () => {
      const result = await reliefDistributionService.getChecklist(campaignId || '', query);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
  });
}

export function useDeliveryDetail(
  campaignId?: string | null,
  householdDeliveryId?: string | null,
) {
  return useQuery({
    queryKey: reliefKeys.deliveryDetail(campaignId || '', householdDeliveryId || ''),
    queryFn: async () => {
      const result = await reliefDistributionService.getDeliveryById(campaignId || '', householdDeliveryId || '');
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId && !!householdDeliveryId,
  });
}

export function useUpdateHouseholdStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      campaignHouseholdId,
      request,
    }: {
      campaignId: string;
      campaignHouseholdId: string;
      request: UpdateCampaignHouseholdStatusRequest;
    }) => {
      const result = await reliefDistributionService.updateHouseholdStatus(
        campaignId,
        campaignHouseholdId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: reliefKeys.all }),
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
      ]);
    },
  });
}

// ─── Shortage Requests ────────────────────────────────────

export function useShortageRequests(
  campaignId?: string | null,
  query?: SupplyShortageRequestQueryRequest,
) {
  return useQuery({
    queryKey: reliefKeys.shortageRequests(campaignId || '', query),
    queryFn: async () => {
      const result = await reliefDistributionService.getShortageRequests(campaignId || '', query);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
  });
}

export function useCreateShortageRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      request,
    }: {
      campaignId: string;
      request: CreateSupplyShortageRequestPayload;
    }) => {
      const result = await reliefDistributionService.createShortageRequest(campaignId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reliefKeys.all });
    },
  });
}

// ─── Deliveries ────────────────────────────────────────────

export function useCompleteDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      householdDeliveryId,
      request,
    }: {
      campaignId: string;
      householdDeliveryId: string;
      request: CompleteHouseholdDeliveryRequest;
    }) => {
      const result = await reliefDistributionService.completeDelivery(
        campaignId,
        householdDeliveryId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: reliefKeys.all }),
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
      ]);
    },
  });
}

export function useCompleteDeliveryBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      request,
    }: {
      campaignId: string;
      request: CompleteHouseholdDeliveryBatchRequest;
    }) => {
      const result = await reliefDistributionService.completeDeliveryBatch(campaignId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: reliefKeys.all }),
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
      ]);
    },
  });
}
