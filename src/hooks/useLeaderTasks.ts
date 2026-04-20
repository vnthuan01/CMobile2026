import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaderTaskService } from '../services/leaderTaskService';
import type {
  AssignMemberTaskRequest,
  ChangeCampaignTaskStatusRequest,
  CreateCampaignTaskRequest,
  GetCampaignTasksQuery,
  UpdateCampaignTaskRequest,
} from '../types/leaderTask';

export const leaderTaskKeys = {
  all: ['leaderTasks'] as const,
  campaignTeams: (campaignId: string) =>
    [...leaderTaskKeys.all, 'campaignTeams', campaignId] as const,
  tasks: (campaignId: string, query?: GetCampaignTasksQuery) =>
    [...leaderTaskKeys.all, 'tasks', campaignId, query ?? {}] as const,
  taskDetail: (campaignTaskId: string) =>
    [...leaderTaskKeys.all, 'taskDetail', campaignTaskId] as const,
};

export function useCampaignTeams(campaignId?: string | null) {
  return useQuery({
    queryKey: leaderTaskKeys.campaignTeams(campaignId || ''),
    queryFn: async () => {
      const result = await leaderTaskService.getCampaignTeams(campaignId || '');
      if (!result.success) throw new Error(result.message);
      return result.data ?? [];
    },
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCampaignTasks(
  campaignId?: string | null,
  query?: GetCampaignTasksQuery,
) {
  return useQuery({
    queryKey: leaderTaskKeys.tasks(campaignId || '', query),
    queryFn: async () => {
      const result = await leaderTaskService.getCampaignTasks(campaignId || '', query);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
    staleTime: 1000 * 30,
  });
}

export function useCampaignTaskDetail(campaignTaskId?: string | null) {
  return useQuery({
    queryKey: leaderTaskKeys.taskDetail(campaignTaskId || ''),
    queryFn: async () => {
      const result = await leaderTaskService.getCampaignTaskDetail(campaignTaskId || '');
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignTaskId,
  });
}

export function useCreateCampaignTask(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateCampaignTaskRequest) => {
      const result = await leaderTaskService.createCampaignTask(campaignId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
  });
}

export function useUpdateCampaignTask(campaignTaskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: UpdateCampaignTaskRequest) => {
      const result = await leaderTaskService.updateCampaignTask(campaignTaskId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
  });
}

export function useChangeCampaignTaskStatus(campaignTaskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: ChangeCampaignTaskStatusRequest) => {
      const result = await leaderTaskService.changeCampaignTaskStatus(campaignTaskId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
  });
}

export function useDeleteCampaignTask(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaignTaskId: string) => {
      const result = await leaderTaskService.deleteCampaignTask(campaignTaskId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: leaderTaskKeys.tasks(campaignId, undefined),
      }),
  });
}

export function useAssignMemberTask(campaignTaskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: AssignMemberTaskRequest) => {
      const result = await leaderTaskService.assignMemberTask(campaignTaskId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
  });
}
