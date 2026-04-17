import type {
  CreateStationJoinRequestPayload,
  StationJoinRequestItem,
  StationJoinRequestListResponse,
} from '../types/joinRequest';
import { extractApiErrorMessage } from '../utils/apiError';
import api from './api';

export type {
  CreateStationJoinRequestPayload,
  StationJoinRequestItem,
  StationJoinRequestListResponse
} from '../types/joinRequest';

function normalizeStationJoinRequest(raw: any): StationJoinRequestItem {
  return {
    stationJoinRequestId: raw?.stationJoinRequestId ?? raw?.id ?? '',
    reliefStationId: raw?.reliefStationId ?? raw?.stationId ?? '',
    reliefStationName:
      raw?.reliefStationName ??
      raw?.stationName ??
      raw?.reliefStation?.name ??
      null,
    teamId: raw?.teamId ?? null,
    teamName: raw?.teamName ?? raw?.team?.name ?? null,
    status: String(raw?.status ?? 'Pending'),
    note: raw?.note ?? raw?.reason ?? null,
    createdAt: raw?.createdAt ?? raw?.createdAtUtc ?? '',
    updatedAt: raw?.updatedAt ?? raw?.updatedAtUtc ?? null,
  };
}

function normalizeStationJoinRequestList(
  raw: any,
): StationJoinRequestListResponse {
  const items = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw)
        ? raw
        : [];

  return {
    data: items.map(normalizeStationJoinRequest),
    totalCount: raw?.totalCount ?? items.length,
    pageIndex: raw?.pageIndex ?? raw?.pageNumber ?? 1,
    pageSize: raw?.pageSize ?? items.length,
    totalPages: raw?.totalPages,
  };
}

export const stationJoinRequestService = {
  create: async (payload: CreateStationJoinRequestPayload) => {
    const routes = ['/StationJoinRequest', '/api/StationJoinRequest'];

    for (const route of routes) {
      try {
        const response = await api.post(route, payload);
        return {
          success: response.status === 200 || response.status === 201,
          data: normalizeStationJoinRequest(response.data),
          message: 'Tạo yêu cầu tham gia station thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tạo yêu cầu tham gia station.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint StationJoinRequest.',
    };
  },

  getMyRequests: async (params?: { pageIndex?: number; pageSize?: number }) => {
    const routes = [
      '/StationJoinRequest/my-requests',
      '/api/StationJoinRequest/my-requests',
    ];

    for (const route of routes) {
      try {
        const response = await api.get(route, { params });
        return {
          success: response.status === 200,
          data: normalizeStationJoinRequestList(response.data),
          message: 'Lấy danh sách yêu cầu tham gia station thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tải danh sách yêu cầu tham gia station.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint StationJoinRequest/my-requests.',
    };
  },

  cancel: async (requestId: string) => {
    const routes = [
      `/StationJoinRequest/${requestId}/cancel`,
      `/api/StationJoinRequest/${requestId}/cancel`,
    ];

    for (const route of routes) {
      try {
        const response = await api.patch(route);
        return {
          success: response.status >= 200 && response.status < 300,
          message: 'Hủy yêu cầu tham gia station thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể hủy yêu cầu tham gia station.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      status: 404,
      message: 'Không tìm thấy endpoint StationJoinRequest cancel.',
    };
  },
};
