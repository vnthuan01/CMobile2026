import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaderTaskService } from '../services/leaderTaskService';
import type {
  AssignMemberTaskRequest,
  ChangeCampaignTaskStatusRequest,
  ChangeMemberTaskStatusRequest,
  CreateCampaignTaskRequest,
  GetCampaignTasksQuery,
  GetMyMemberTasksQuery,
  UpdateCampaignTaskRequest,
} from '../types/leaderTask';
import { mobileQueryOptions } from './queryOptions';
import { teamKeys } from './useMyTeam';

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

async function invalidateLeaderTaskQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  options?: {
    campaignId?: string | null;
    campaignTaskId?: string | null;
    refreshTeam?: boolean;
  },
) {
  const jobs: Promise<unknown>[] = [];

  if (options?.campaignId) {
    jobs.push(
      queryClient.invalidateQueries({
        queryKey: leaderTaskKeys.campaignTeams(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: leaderTaskKeys.tasks(options.campaignId),
      }),
      queryClient.invalidateQueries({
        queryKey: leaderTaskKeys.myMemberTasks(options.campaignId),
      }),
    );
  } else {
    jobs.push(queryClient.invalidateQueries({ queryKey: leaderTaskKeys.all }));
  }

  if (options?.campaignTaskId) {
    jobs.push(
      queryClient.invalidateQueries({
        queryKey: leaderTaskKeys.taskDetail(options.campaignTaskId),
      }),
    );
  }

  if (options?.refreshTeam) {
    jobs.push(queryClient.invalidateQueries({ queryKey: teamKeys.all }));
  }

  await Promise.all(jobs);
}

export function useCampaignTeams(campaignId?: string | null) {
  return useQuery({
    queryKey: leaderTaskKeys.campaignTeams(campaignId || ''),
    queryFn: async () => {
      const result = await leaderTaskService.getCampaignTeams(campaignId || '');
      if (!result.success) throw new Error(result.message);
      return result.data ?? [];
    },
    enabled: !!campaignId,
    ...mobileQueryOptions('normal'),
  });
}

export function useCampaignTasks(
  campaignId?: string | null,
  query?: GetCampaignTasksQuery,
) {
  return useQuery({
    queryKey: leaderTaskKeys.tasks(campaignId || '', query),
    queryFn: async () => {
      const result = await leaderTaskService.getCampaignTasks(
        campaignId || '',
        query,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
    ...mobileQueryOptions('normal', { staleTime: 1000 * 15 }),
  });
}

export function useMyMemberTasks(
  campaignId?: string | null,
  query?: GetMyMemberTasksQuery,
) {
  return useQuery({
    queryKey: leaderTaskKeys.myMemberTasks(campaignId || '', query),
    queryFn: async () => {
      const result = await leaderTaskService.getMyMemberTasks(
        campaignId || '',
        query,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignId,
    ...mobileQueryOptions('normal', { staleTime: 1000 * 15 }),
  });
}

export function useCampaignTaskDetail(campaignTaskId?: string | null) {
  return useQuery({
    queryKey: leaderTaskKeys.taskDetail(campaignTaskId || ''),
    queryFn: async () => {
      const result = await leaderTaskService.getCampaignTaskDetail(
        campaignTaskId || '',
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!campaignTaskId,
    ...mobileQueryOptions('live'),
  });
}

export function useCreateCampaignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      request,
    }: {
      campaignId: string;
      request: CreateCampaignTaskRequest;
    }) => {
      const result = await leaderTaskService.createCampaignTask(
        campaignId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateLeaderTaskQueries(queryClient, {
        campaignId: variables.campaignId,
        refreshTeam: true,
      });
    },
  });
}

export function useUpdateCampaignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignTaskId,
      request,
    }: {
      campaignTaskId: string;
      request: UpdateCampaignTaskRequest;
    }) => {
      const result = await leaderTaskService.updateCampaignTask(
        campaignTaskId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateLeaderTaskQueries(queryClient, {
        campaignTaskId: variables.campaignTaskId,
        refreshTeam: true,
      });
    },
  });
}

export function useChangeCampaignTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignTaskId,
      request,
    }: {
      campaignTaskId: string;
      request: ChangeCampaignTaskStatusRequest;
    }) => {
      const result = await leaderTaskService.changeCampaignTaskStatus(
        campaignTaskId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateLeaderTaskQueries(queryClient, {
        campaignTaskId: variables.campaignTaskId,
        refreshTeam: true,
      });
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
      await invalidateLeaderTaskQueries(queryClient, { refreshTeam: true });
    },
  });
}

export function useAssignMemberTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignTaskId,
      request,
    }: {
      campaignTaskId: string;
      request: AssignMemberTaskRequest;
    }) => {
      const result = await leaderTaskService.assignMemberTask(
        campaignTaskId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateLeaderTaskQueries(queryClient, {
        campaignTaskId: variables.campaignTaskId,
        refreshTeam: true,
      });
    },
  });
}

export function useBulkAssignMemberTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignTaskId,
      members,
    }: {
      campaignTaskId: string;
      members: AssignMemberTaskRequest[];
    }) => {
      const result = await leaderTaskService.bulkAssignMemberTasks(
        campaignTaskId,
        members,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async (_data, variables) => {
      await invalidateLeaderTaskQueries(queryClient, {
        campaignTaskId: variables.campaignTaskId,
        refreshTeam: true,
      });
    },
  });
}

export function useChangeMemberTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      memberTaskId,
      request,
    }: {
      memberTaskId: string;
      request: ChangeMemberTaskStatusRequest;
    }) => {
      const result = await leaderTaskService.changeMemberTaskStatus(
        memberTaskId,
        request,
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: async () => {
      await invalidateLeaderTaskQueries(queryClient, { refreshTeam: true });
    },
  });
}
