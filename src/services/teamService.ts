import api from './api';
import { extractApiErrorMessage } from '../utils/apiError';
import type {
  TeamDetailResponse,
  TeamTrackingHeartbeatRequest,
  TeamTrackingHeartbeatResponse,
  TeamTrackingPointResponse,
} from '../types/team';

export type {
  TeamSkillResponse,
  TeamUserSummary,
  TeamLeaderSummary,
  TeamMemberSummary,
  TeamDetailResponse,
  TeamTrackingHeartbeatRequest,
  TeamTrackingHeartbeatResponse,
  TeamTrackingPointResponse,
} from '../types/team';

export const teamService = {
  getMyTeam: async () => {
    const routes = ['/Team/my-team', '/api/Team/my-team'];

    for (const route of routes) {
      try {
        const response = await api.get<TeamDetailResponse>(route);
        return {
          success: response.status === 200,
          data: response.data,
          message: 'Lấy thông tin team thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tải thông tin team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint Team/my-team.',
    };
  },

  sendTrackingHeartbeat: async (
    teamId: string,
    payload: TeamTrackingHeartbeatRequest,
  ) => {
    const routes = [
      `/Team/${teamId}/tracking-heartbeat`,
      `/api/Team/${teamId}/tracking-heartbeat`,
    ];

    for (const route of routes) {
      try {
        const response = await api.post<TeamTrackingHeartbeatResponse>(
          route,
          payload,
        );
        return {
          success: response.status >= 200 && response.status < 300,
          data: response.data,
          message: 'Gửi vị trí team thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể gửi vị trí team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint Team tracking-heartbeat.',
    };
  },

  getLatestTracking: async (teamId: string, limit = 100) => {
    const routes = [
      `/Team/${teamId}/tracking/latest`,
      `/api/Team/${teamId}/tracking/latest`,
    ];

    for (const route of routes) {
      try {
        const response = await api.get<TeamTrackingPointResponse[]>(route, {
          params: { limit },
        });
        return {
          success: response.status === 200,
          data: Array.isArray(response.data) ? response.data : [],
          message: 'Lấy lịch sử tracking mới nhất thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tải lịch sử tracking team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint Team tracking/latest.',
    };
  },
};
