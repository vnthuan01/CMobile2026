import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reliefDistributionService } from '../services/reliefDistributionService';
import { leaderTaskKeys } from './useLeaderTasks';
import { mobileQueryOptions } from './queryOptions';
import type {
  CampaignPackageQueryRequest,
  DistributionPointQueryRequest,
  DeliveryQueryRequest,
  HouseholdQueryRequest,
  UpdateCampaignHouseholdStatusRequest,
  ReportNewReliefHouseholdRequest,
  CreateSupplyShortageRequestPayload,
  SupplyShortageRequestQueryRequest,
  CompleteHouseholdDeliveryRequest,
  CompleteHouseholdDeliveryBatchRequest,
  ReliefCampaignPlanSummary,
  TeamWorklistQueryRequest,
  MemberTaskDeliveryQueryRequest,
  CompleteMemberTaskDeliveryWithDeliveryRequest,
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
  teamWorklist: (campaignId: string, query?: TeamWorklistQueryRequest) =>
    [...reliefKeys.all, 'teamWorklist', campaignId, query ?? {}] as const,
  myMemberTaskDeliveries: (campaignId: string, query?: MemberTaskDeliveryQueryRequest) =>
    [...reliefKeys.all, 'myMemberTaskDeliveries', campaignId, query ?? {}] as const,
  deliveryDetail: (campaignId: string, householdDeliveryId: string) =>
    [...reliefKeys.all, 'deliveryDetail', campaignId, householdDeliveryId] as const,
  shortageRequests: (campaignId: string, query?: SupplyShortageRequestQueryRequest) =>
    [...reliefKeys.all, 'shortageRequests', campaignId, query ?? {}] as const,
  planSummary: (campaignId: string) => [...reliefKeys.all, 'planSummary', campaignId] as const,
};

async function invalidateReliefQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  options?: {
    campaignId?: string | null;
    householdDeliveryId?: string | null;
    refreshLeaderTasks?: boolean;
  },
) {
  const jobs: Promise<unknown>[] = [];

  if (options?.campaignId) {
    jobs.push(
      queryClient.invalidateQueries({
        queryKey: reliefKeys.inventoryBalance(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: reliefKeys.packages(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: reliefKeys.distributionPoints(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: reliefKeys.households(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: reliefKeys.checklist(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: reliefKeys.teamWorklist(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: reliefKeys.myMemberTaskDeliveries(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: reliefKeys.shortageRequests(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: reliefKeys.planSummary(options.campaignId),
      }),
    );
  } else {
    jobs.push(queryClient.invalidateQueries({ queryKey: reliefKeys.all }));
  }

  if (options?.householdDeliveryId && options?.campaignId) {
    jobs.push(
      queryClient.invalidateQueries({
        queryKey: reliefKeys.deliveryDetail(
          options.campaignId,
          options.householdDeliveryId,
        ),
      }),
    );
  }

  if (options?.refreshLeaderTasks) {
    jobs.push(queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }));
  }

  await Promise.all(jobs);
}

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
    ...mobileQueryOptions('normal'),
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
    ...mobileQueryOptions('static'),
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
    ...mobileQueryOptions('normal'),
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
    ...mobileQueryOptions('normal', { staleTime: 1000 * 15 }),
  });
}

export function useReportNewReliefHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      request,
    }: {
      campaignId: string;
      request: ReportNewReliefHouseholdRequest;
    }) => {
      const result = await reliefDistributionService.reportNewReliefHousehold(campaignId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateReliefQueries(queryClient, {
        campaignId: variables.campaignId,
        refreshLeaderTasks: true,
      });
    },
  });
}

export function useCampaignPlanSummary(campaignId?: string | null) {
  return useQuery<ReliefCampaignPlanSummary | null>({
    queryKey: reliefKeys.planSummary(campaignId || ''),
    queryFn: async () => {
      const result = await reliefDistributionService.getCampaignPlanSummary(campaignId || '');
      if (!result.success) {
        if (result.status === 404) return null;
        throw new Error(result.message);
      }
      return result.data;
    },
    enabled: !!campaignId,
    ...mobileQueryOptions('static'),
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
    ...mobileQueryOptions('live'),
  });
}

export function useTeamWorklist(
  campaignId?: string | null,
  query?: TeamWorklistQueryRequest,
) {
  return useQuery({
    queryKey: reliefKeys.teamWorklist(campaignId || '', query),
    queryFn: async () => {
      const result = await reliefDistributionService.getTeamWorklist(campaignId || '', query);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
    ...mobileQueryOptions('live'),
  });
}

export function useMyMemberTaskDeliveries(
  campaignId?: string | null,
  query?: MemberTaskDeliveryQueryRequest,
) {
  return useQuery({
    queryKey: reliefKeys.myMemberTaskDeliveries(campaignId || '', query),
    queryFn: async () => {
      const result = await reliefDistributionService.getMyMemberTaskDeliveries(campaignId || '', query);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
    ...mobileQueryOptions('live'),
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
    ...mobileQueryOptions('live'),
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
    onSuccess: async (_data, variables) => {
      await invalidateReliefQueries(queryClient, {
        campaignId: variables.campaignId,
        refreshLeaderTasks: true,
      });
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
    ...mobileQueryOptions('normal', { staleTime: 1000 * 15 }),
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
    onSuccess: async (_data, variables) => {
      await invalidateReliefQueries(queryClient, {
        campaignId: variables.campaignId,
        refreshLeaderTasks: true,
      });
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
    onSuccess: async (_data, variables) => {
      await invalidateReliefQueries(queryClient, {
        campaignId: variables.campaignId,
        refreshLeaderTasks: true,
      });
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
    onSuccess: async (_data, variables) => {
      await invalidateReliefQueries(queryClient, {
        campaignId: variables.campaignId,
        refreshLeaderTasks: true,
      });
    },
  });
}

export function useCompleteMemberTaskDeliveryWithDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      memberTaskDeliveryId,
      request,
    }: {
      memberTaskDeliveryId: string;
      request: CompleteMemberTaskDeliveryWithDeliveryRequest;
    }) => {
      const result = await reliefDistributionService.completeMemberTaskDeliveryWithDelivery(
        memberTaskDeliveryId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateReliefQueries(queryClient, {
        campaignId: variables.request.campaignId,
        refreshLeaderTasks: true,
      });
    },
  });
}
