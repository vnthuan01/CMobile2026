import type {
  CreateTeamJoinRequestPayload,
  TeamJoinRequestItem,
  TeamJoinRequestListResponse,
} from '../types/joinRequest';
import { extractApiErrorMessage } from '../utils/apiError';
import api from './api';

export type {
  CreateTeamJoinRequestPayload,
  TeamJoinRequestItem,
  TeamJoinRequestListResponse
} from '../types/joinRequest';

function normalizeTeamJoinRequest(raw: any): TeamJoinRequestItem {
  return {
    teamJoinRequestId: raw?.teamJoinRequestId ?? raw?.id ?? '',
    teamId: raw?.teamId ?? '',
    teamName: raw?.teamName ?? raw?.team?.name ?? '',
    volunteerProfileId: raw?.volunteerProfileId ?? null,
    status: String(raw?.status ?? 'Pending'),
    note: raw?.note ?? raw?.reason ?? null,
    createdAt: raw?.createdAt ?? raw?.createdAtUtc ?? '',
    updatedAt: raw?.updatedAt ?? raw?.updatedAtUtc ?? null,
  };
}

function normalizeTeamJoinRequestList(raw: any): TeamJoinRequestListResponse {
  const items = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw)
        ? raw
        : [];

  return {
    data: items.map(normalizeTeamJoinRequest),
    totalCount: raw?.totalCount ?? items.length,
    pageIndex: raw?.pageIndex ?? raw?.pageNumber ?? 1,
    pageSize: raw?.pageSize ?? items.length,
    totalPages: raw?.totalPages,
  };
}

export const teamJoinRequestService = {
  create: async (payload: CreateTeamJoinRequestPayload) => {
    const routes = ['/TeamJoinRequest', '/api/TeamJoinRequest'];

    for (const route of routes) {
      try {
        const response = await api.post(route, payload);
        return {
          success: response.status === 200 || response.status === 201,
          data: normalizeTeamJoinRequest(response.data),
          message: 'Tạo yêu cầu tham gia team thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tạo yêu cầu tham gia team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint TeamJoinRequest.',
    };
  },

  getMyRequests: async (params?: { pageIndex?: number; pageSize?: number }) => {
    const routes = [
      '/TeamJoinRequest/my-requests',
      '/api/TeamJoinRequest/my-requests',
    ];

    for (const route of routes) {
      try {
        const response = await api.get(route, { params });
        return {
          success: response.status === 200,
          data: normalizeTeamJoinRequestList(response.data),
          message: 'Lấy danh sách yêu cầu tham gia team thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tải danh sách yêu cầu tham gia team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint TeamJoinRequest/my-requests.',
    };
  },

  cancel: async (requestId: string) => {
    const routes = [
      `/TeamJoinRequest/${requestId}/cancel`,
      `/api/TeamJoinRequest/${requestId}/cancel`,
    ];

    for (const route of routes) {
      try {
        const response = await api.patch(route);
        return {
          success: response.status >= 200 && response.status < 300,
          message: 'Hủy yêu cầu tham gia team thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể hủy yêu cầu tham gia team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      status: 404,
      message: 'Không tìm thấy endpoint TeamJoinRequest cancel.',
    };
  },
};
