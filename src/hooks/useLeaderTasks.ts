import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaderTaskService } from '../services/leaderTaskService';
import { teamKeys } from './useMyTeam';
import type {
  AssignMemberTaskRequest,
  ChangeCampaignTaskStatusRequest,
  ChangeMemberTaskStatusRequest,
  CreateCampaignTaskRequest,
  GetMyMemberTasksQuery,
  GetCampaignTasksQuery,
  UpdateCampaignTaskRequest,
} from '../types/leaderTask';

export const leaderTaskKeys = {
  all: ['leaderTasks'] as const,
  campaignTeams: (campaignId: string) =>
    [...leaderTaskKeys.all, 'campaignTeams', campaignId] as const,
  tasks: (campaignId: string, query?: GetCampaignTasksQuery) =>
    [...leaderTaskKeys.all, 'tasks', campaignId, query ?? {}] as const,
  myMemberTasks: (campaignId: string, query?: GetMyMemberTasksQuery) =>
    [...leaderTaskKeys.all, 'myMemberTasks', campaignId, query ?? {}] as const,
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
  });
}

export function useMyMemberTasks(
  campaignId?: string | null,
  query?: GetMyMemberTasksQuery,
) {
  return useQuery({
    queryKey: leaderTaskKeys.myMemberTasks(campaignId || '', query),
    queryFn: async () => {
      const result = await leaderTaskService.getMyMemberTasks(campaignId || '', query);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
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

export function useCreateCampaignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaignId, request }: { campaignId: string; request: CreateCampaignTaskRequest }) => {
      const result = await leaderTaskService.createCampaignTask(campaignId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
        queryClient.invalidateQueries({ queryKey: teamKeys.all }),
      ]);
    },
  });
}

export function useUpdateCampaignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaignTaskId, request }: { campaignTaskId: string; request: UpdateCampaignTaskRequest }) => {
      const result = await leaderTaskService.updateCampaignTask(campaignTaskId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
        queryClient.invalidateQueries({ queryKey: teamKeys.all }),
      ]);
    },
  });
}

export function useChangeCampaignTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaignTaskId, request }: { campaignTaskId: string; request: ChangeCampaignTaskStatusRequest }) => {
      const result = await leaderTaskService.changeCampaignTaskStatus(campaignTaskId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
        queryClient.invalidateQueries({ queryKey: teamKeys.all }),
      ]);
    },
  });
}

export function useDeleteCampaignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaignTaskId: string) => {
      const result = await leaderTaskService.deleteCampaignTask(campaignTaskId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
        queryClient.invalidateQueries({ queryKey: teamKeys.all }),
      ]);
    },
  });
}

export function useAssignMemberTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaignTaskId, request }: { campaignTaskId: string; request: AssignMemberTaskRequest }) => {
      const result = await leaderTaskService.assignMemberTask(campaignTaskId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
        queryClient.invalidateQueries({ queryKey: teamKeys.all }),
      ]);
    },
  });
}

export function useBulkAssignMemberTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaignTaskId, members }: { campaignTaskId: string; members: AssignMemberTaskRequest[] }) => {
      const result = await leaderTaskService.bulkAssignMemberTasks(campaignTaskId, members);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
        queryClient.invalidateQueries({ queryKey: teamKeys.all }),
      ]);
    },
  });
}

export function useChangeMemberTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberTaskId, request }: { memberTaskId: string; request: ChangeMemberTaskStatusRequest }) => {
      const result = await leaderTaskService.changeMemberTaskStatus(memberTaskId, request);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }),
        queryClient.invalidateQueries({ queryKey: teamKeys.all }),
      ]);
    },
  });
}
