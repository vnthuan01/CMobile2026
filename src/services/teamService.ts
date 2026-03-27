import api from './api';

export interface TeamSkillResponse {
  skillId: string;
  code: string;
  name: string;
  description: string | null;
}

export interface TeamUserSummary {
  userId: string;
  displayName: string;
  email: string;
}

export interface TeamLeaderSummary extends TeamUserSummary {
  skills: TeamSkillResponse[];
}

export interface TeamMemberSummary extends TeamUserSummary {
  role: 'Leader' | 'Member' | string;
  skills: TeamSkillResponse[];
  joinedAt: string;
}

export interface TeamDetailResponse {
  teamId: string;
  name: string;
  description: string | null;
  contactPhone: string | null;
  status: 'Draft' | 'Active' | 'Inactive' | string;
  moderator: TeamUserSummary | null;
  leader: TeamLeaderSummary | null;
  members: TeamMemberSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamTrackingHeartbeatRequest {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  speedKph?: number | null;
  headingDegree?: number | null;
  source?: number;
  capturedAtUtc?: string;
  rescueBatchId?: string | null;
  rescueOperationId?: string | null;
  note?: string | null;
}

export interface TeamTrackingHeartbeatResponse {
  teamTrackingPointId: string;
  teamId: string;
  rescueBatchId: string | null;
  rescueOperationId: string | null;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  speedKph: number | null;
  headingDegree: number | null;
  source: number;
  capturedAtUtc: string;
  createdAtUtc: string;
  note: string | null;
}

const extractApiErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === 'string') return data;
  return (
    data.message || data.detail || data.title || error?.message || fallback
  );
};

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
};
