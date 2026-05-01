import api from './api';
import { extractApiErrorMessage } from '../utils/apiError';
import type {
  AssignCampaignVehicleDriverRequest,
  CampaignAssignedVehicle,
  HandoffCampaignVehicleRequest,
  ReturnCampaignVehicleToCoordinatorRequest,
  ReleaseCampaignVehicleRequest,
  UpdateCampaignVehicleAssignmentRequest,
} from '../types/vehicle';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  status?: number;
}

const tryRoutes = async <T>(
  routes: string[],
  requestFn: (route: string) => Promise<T>,
  fallbackMessage: string,
): Promise<ApiResponse<T>> => {
  for (const route of routes) {
    try {
      const data = await requestFn(route);
      return { success: true, data, message: 'OK' };
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        return {
          success: false,
          data: null,
          status: error?.response?.status,
          message: extractApiErrorMessage(error, fallbackMessage),
        };
      }
    }
  }

  return { success: false, data: null, status: 404, message: fallbackMessage };
};

export const campaignVehicleService = {
  getCampaignVehicles: async (
    campaignId: string,
    campaignTeamId?: string | null,
  ): Promise<ApiResponse<CampaignAssignedVehicle[]>> => {
    const routes = [`/campaigns/${campaignId}/vehicles`, `/api/campaigns/${campaignId}/vehicles`];

    return tryRoutes(
      routes,
      async (route) => {
        const response = await api.get<CampaignAssignedVehicle[]>(route, {
          params: campaignTeamId ? { campaignTeamId } : undefined,
        });
        return Array.isArray(response.data) ? response.data : [];
      },
      'Không thể tải danh sách phương tiện chiến dịch.',
    );
  },

  getMyVehicleAssignment: async (
    campaignId: string,
  ): Promise<ApiResponse<CampaignAssignedVehicle | null>> => {
    const routes = [
      `/campaigns/${campaignId}/vehicles/my-assignment`,
      `/api/campaigns/${campaignId}/vehicles/my-assignment`,
    ];

    for (const route of routes) {
      try {
        const response = await api.get<CampaignAssignedVehicle | null>(route);
        return {
          success: true,
          data: response.data,
          message: 'OK',
        };
      } catch (error: any) {
        if (error?.response?.status === 404) {
          continue;
        }

        return {
          success: false,
          data: null,
          status: error?.response?.status,
          message: extractApiErrorMessage(error, 'Không thể tải phương tiện đang được giao.'),
        };
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint phương tiện đang được giao.',
    };
  },

  updateCampaignVehicle: async (
    campaignId: string,
    campaignVehicleId: string,
    request: UpdateCampaignVehicleAssignmentRequest,
  ): Promise<ApiResponse<CampaignAssignedVehicle>> => {
    const routes = [
      `/campaigns/${campaignId}/vehicles/${campaignVehicleId}`,
      `/api/campaigns/${campaignId}/vehicles/${campaignVehicleId}`,
    ];

    return tryRoutes(
      routes,
      async (route) => {
        const response = await api.patch<CampaignAssignedVehicle>(route, request);
        return response.data;
      },
      'Không thể cập nhật điều phối phương tiện.',
    );
  },

  assignDriver: async (
    campaignId: string,
    campaignVehicleId: string,
    request: AssignCampaignVehicleDriverRequest,
  ): Promise<ApiResponse<CampaignAssignedVehicle>> => {
    const routes = [
      `/campaigns/${campaignId}/vehicles/${campaignVehicleId}/assign-driver`,
      `/api/campaigns/${campaignId}/vehicles/${campaignVehicleId}/assign-driver`,
    ];

    return tryRoutes(
      routes,
      async (route) => {
        const response = await api.patch<CampaignAssignedVehicle>(route, request);
        return response.data;
      },
      'Không thể chỉ định người lái cho phương tiện.',
    );
  },

  releaseVehicle: async (
    campaignId: string,
    campaignVehicleId: string,
    request: ReleaseCampaignVehicleRequest,
  ): Promise<ApiResponse<CampaignAssignedVehicle>> => {
    const routes = [
      `/campaigns/${campaignId}/vehicles/${campaignVehicleId}/release`,
      `/api/campaigns/${campaignId}/vehicles/${campaignVehicleId}/release`,
    ];

    return tryRoutes(
      routes,
      async (route) => {
        const response = await api.patch<CampaignAssignedVehicle>(route, request);
        return response.data;
      },
      'Không thể trả phương tiện về đội.',
    );
  },

  handoffVehicle: async (
    campaignId: string,
    campaignVehicleId: string,
    request: HandoffCampaignVehicleRequest,
  ): Promise<ApiResponse<CampaignAssignedVehicle>> => {
    const routes = [
      `/campaigns/${campaignId}/vehicles/${campaignVehicleId}/handoff`,
      `/api/campaigns/${campaignId}/vehicles/${campaignVehicleId}/handoff`,
    ];

    return tryRoutes(
      routes,
      async (route) => {
        const response = await api.patch<CampaignAssignedVehicle>(route, request);
        return response.data;
      },
      'Không thể bàn giao phương tiện cho thành viên khác.',
    );
  },

  returnVehicleToCoordinator: async (
    campaignId: string,
    campaignVehicleId: string,
    request: ReturnCampaignVehicleToCoordinatorRequest,
  ): Promise<ApiResponse<CampaignAssignedVehicle>> => {
    const routes = [
      `/campaigns/${campaignId}/vehicles/${campaignVehicleId}/return-to-coordinator`,
      `/api/campaigns/${campaignId}/vehicles/${campaignVehicleId}/return-to-coordinator`,
    ];

    return tryRoutes(
      routes,
      async (route) => {
        const response = await api.patch<CampaignAssignedVehicle>(route, request);
        return response.data;
      },
      'Không thể trả hẳn phương tiện về điều phối trung tâm.',
    );
  },
};
