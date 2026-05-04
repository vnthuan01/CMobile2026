import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignVehicleService } from '../services/campaignVehicleService';
import { mobileQueryOptions } from './queryOptions';
import type {
  AssignCampaignVehicleDriverRequest,
  HandoffCampaignVehicleRequest,
  ReturnCampaignVehicleToCoordinatorRequest,
  ReleaseCampaignVehicleRequest,
  UpdateCampaignVehicleAssignmentRequest,
} from '../types/vehicle';

export const campaignVehicleKeys = {
  all: ['campaignVehicles'] as const,
  list: (campaignId: string, campaignTeamId?: string | null) =>
    [...campaignVehicleKeys.all, 'list', campaignId, campaignTeamId ?? 'all'] as const,
  mine: (campaignId: string) => [...campaignVehicleKeys.all, 'mine', campaignId] as const,
};

async function invalidateCampaignVehicleQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  campaignId?: string | null,
) {
  if (campaignId) {
    await Promise.all([
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === campaignVehicleKeys.all[0] &&
          query.queryKey.includes(campaignId),
      }),
      queryClient.invalidateQueries({ queryKey: campaignVehicleKeys.mine(campaignId) }),
    ]);
    return;
  }

  await queryClient.invalidateQueries({ queryKey: campaignVehicleKeys.all });
}

export function useCampaignVehicles(campaignId?: string | null, campaignTeamId?: string | null) {
  return useQuery({
    queryKey: campaignVehicleKeys.list(campaignId || '', campaignTeamId),
    queryFn: async () => {
      const result = await campaignVehicleService.getCampaignVehicles(campaignId || '', campaignTeamId);
      if (!result.success) throw new Error(result.message);
      return result.data ?? [];
    },
    enabled: !!campaignId,
    ...mobileQueryOptions('live'),
  });
}

export function useMyCampaignVehicle(campaignId?: string | null) {
  return useQuery({
    queryKey: campaignVehicleKeys.mine(campaignId || ''),
    queryFn: async () => {
      const result = await campaignVehicleService.getMyVehicleAssignment(campaignId || '');
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
    ...mobileQueryOptions('live'),
  });
}

export function useUpdateCampaignVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      campaignVehicleId,
      request,
    }: {
      campaignId: string;
      campaignVehicleId: string;
      request: UpdateCampaignVehicleAssignmentRequest;
    }) => {
      const result = await campaignVehicleService.updateCampaignVehicle(
        campaignId,
        campaignVehicleId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateCampaignVehicleQueries(queryClient, variables.campaignId);
    },
  });
}

export function useAssignCampaignVehicleDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      campaignVehicleId,
      request,
    }: {
      campaignId: string;
      campaignVehicleId: string;
      request: AssignCampaignVehicleDriverRequest;
    }) => {
      const result = await campaignVehicleService.assignDriver(campaignId, campaignVehicleId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateCampaignVehicleQueries(queryClient, variables.campaignId);
    },
  });
}

export function useReleaseCampaignVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      campaignVehicleId,
      request,
    }: {
      campaignId: string;
      campaignVehicleId: string;
      request: ReleaseCampaignVehicleRequest;
    }) => {
      const result = await campaignVehicleService.releaseVehicle(campaignId, campaignVehicleId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateCampaignVehicleQueries(queryClient, variables.campaignId);
    },
  });
}

export function useHandoffCampaignVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      campaignVehicleId,
      request,
    }: {
      campaignId: string;
      campaignVehicleId: string;
      request: HandoffCampaignVehicleRequest;
    }) => {
      const result = await campaignVehicleService.handoffVehicle(campaignId, campaignVehicleId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateCampaignVehicleQueries(queryClient, variables.campaignId);
    },
  });
}

export function useReturnCampaignVehicleToCoordinator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      campaignVehicleId,
      request,
    }: {
      campaignId: string;
      campaignVehicleId: string;
      request: ReturnCampaignVehicleToCoordinatorRequest;
    }) => {
      const result = await campaignVehicleService.returnVehicleToCoordinator(
        campaignId,
        campaignVehicleId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateCampaignVehicleQueries(queryClient, variables.campaignId);
    },
  });
}
