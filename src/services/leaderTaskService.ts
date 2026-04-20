import api from './api';
import { extractApiErrorMessage } from '../utils/apiError';

import type {
  CreateCampaignTaskRequest,
  UpdateCampaignTaskRequest,
  ChangeCampaignTaskStatusRequest,
  AssignMemberTaskRequest,
  CampaignTaskResponse,
  CampaignTaskDetailResponse,
  CampaignTeamResponse,
  GetCampaignTasksQuery,
} from '../types/leaderTask';

export type {
  CreateCampaignTaskRequest,
  UpdateCampaignTaskRequest,
  ChangeCampaignTaskStatusRequest,
  AssignMemberTaskRequest,
  CampaignTaskResponse,
  CampaignTaskDetailResponse,
  CampaignTeamResponse,
  GetCampaignTasksQuery,
} from '../types/leaderTask';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  status?: number;
}

export interface PaginatedCampaignTaskResponse {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  items: CampaignTaskResponse[];
}

export const leaderTaskService = {
  // Campaign Teams endpoints
  getCampaignTeams: async (campaignId: string): Promise<ApiResponse<CampaignTeamResponse[]>> => {
    const routes = [`/campaigns/${campaignId}/teams`, `/api/campaigns/${campaignId}/teams`];

    for (const route of routes) {
      try {
        const response = await api.get<CampaignTeamResponse[]>(route);
        return {
          success: response.status === 200,
          data: Array.isArray(response.data) ? response.data : [],
          message: 'Lấy danh sách campaign teams thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(error, 'Không thể tải danh sách campaign teams.'),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint campaign teams.',
    };
  },

  // Campaign Tasks endpoints
  createCampaignTask: async (
    campaignId: string,
    request: CreateCampaignTaskRequest
  ): Promise<ApiResponse<CampaignTaskResponse>> => {
    const routes = [`/campaigns/${campaignId}/tasks`, `/api/campaigns/${campaignId}/tasks`];

    for (const route of routes) {
      try {
        const response = await api.post<CampaignTaskResponse>(route, request);
        return {
          success: response.status >= 200 && response.status < 300,
          data: response.data,
          message: 'Tạo nhiệm vụ thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(error, 'Không thể tạo nhiệm vụ.'),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint campaign tasks.',
    };
  },

  getCampaignTasks: async (
    campaignId: string,
    query?: GetCampaignTasksQuery
  ): Promise<ApiResponse<PaginatedCampaignTaskResponse>> => {
    const routes = [`/campaigns/${campaignId}/tasks`, `/api/campaigns/${campaignId}/tasks`];

    for (const route of routes) {
      try {
        const response = await api.get<PaginatedCampaignTaskResponse>(route, {
          params: query,
        });
        return {
          success: response.status === 200,
          data: response.data,
          message: 'Lấy danh sách nhiệm vụ thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(error, 'Không thể tải danh sách nhiệm vụ.'),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint campaign tasks.',
    };
  },

  getCampaignTaskDetail: async (
    campaignTaskId: string
  ): Promise<ApiResponse<CampaignTaskDetailResponse>> => {
    const routes = [`/campaigns/tasks/${campaignTaskId}`, `/api/campaigns/tasks/${campaignTaskId}`];

    for (const route of routes) {
      try {
        const response = await api.get<CampaignTaskDetailResponse>(route);
        return {
          success: response.status === 200,
          data: response.data,
          message: 'Lấy chi tiết nhiệm vụ thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(error, 'Không thể tải chi tiết nhiệm vụ.'),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint campaign task detail.',
    };
  },

  updateCampaignTask: async (
    campaignTaskId: string,
    request: UpdateCampaignTaskRequest
  ): Promise<ApiResponse<CampaignTaskResponse>> => {
    const routes = [`/campaigns/tasks/${campaignTaskId}`, `/api/campaigns/tasks/${campaignTaskId}`];

    for (const route of routes) {
      try {
        const response = await api.put<CampaignTaskResponse>(route, request);
        return {
          success: response.status >= 200 && response.status < 300,
          data: response.data,
          message: 'Cập nhật nhiệm vụ thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(error, 'Không thể cập nhật nhiệm vụ.'),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint campaign task.',
    };
  },

  changeCampaignTaskStatus: async (
    campaignTaskId: string,
    request: ChangeCampaignTaskStatusRequest
  ): Promise<ApiResponse<void>> => {
    const routes = [
      `/campaigns/tasks/${campaignTaskId}/status`,
      `/api/campaigns/tasks/${campaignTaskId}/status`,
    ];

    for (const route of routes) {
      try {
        const response = await api.patch<void>(route, request);
        return {
          success: response.status >= 200 && response.status < 300,
          data: null,
          message: 'Thay đổi trạng thái nhiệm vụ thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(error, 'Không thể thay đổi trạng thái nhiệm vụ.'),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint campaign task status.',
    };
  },

  deleteCampaignTask: async (campaignTaskId: string): Promise<ApiResponse<void>> => {
    const routes = [`/campaigns/tasks/${campaignTaskId}`, `/api/campaigns/tasks/${campaignTaskId}`];

    for (const route of routes) {
      try {
        const response = await api.delete<void>(route);
        return {
          success: response.status >= 200 && response.status < 300,
          data: null,
          message: 'Xóa nhiệm vụ thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(error, 'Không thể xóa nhiệm vụ.'),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint campaign task.',
    };
  },

  assignMemberTask: async (
    campaignTaskId: string,
    request: AssignMemberTaskRequest
  ): Promise<ApiResponse<void>> => {
    const routes = [
      `/campaigns/tasks/${campaignTaskId}/members`,
      `/api/campaigns/tasks/${campaignTaskId}/members`,
    ];

    for (const route of routes) {
      try {
        const response = await api.post<void>(route, request);
        return {
          success: response.status >= 200 && response.status < 300,
          data: null,
          message: 'Giao nhiệm vụ cho thành viên thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(error, 'Không thể giao nhiệm vụ cho thành viên.'),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint campaign task members.',
    };
  },
};