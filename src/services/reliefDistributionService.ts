import api from './api';
import { extractApiErrorMessage } from '../utils/apiError';

import type {
  CampaignHouseholdResponse,
  DistributionPointResponse,
  HouseholdChecklistItemResponse,
  DistributionPointQueryRequest,
  DeliveryQueryRequest,
  HouseholdQueryRequest,
  UpdateCampaignHouseholdStatusRequest,
  CreateSupplyShortageRequestPayload,
  SupplyShortageRequestResponse,
  SupplyShortageRequestQueryRequest,
  CompleteHouseholdDeliveryRequest,
  HouseholdDeliveryResponse,
  CompleteHouseholdDeliveryBatchRequest,
  BatchCompleteHouseholdDeliveryResponse,
  PaginatedResponse,
} from '../types/reliefDistribution';

const toPascalCaseHouseholdParams = (query?: HouseholdQueryRequest) => {
  if (!query) return undefined;

  return {
    ...(query.status !== undefined ? { Status: query.status } : {}),
    ...(query.deliveryMode !== undefined ? { DeliveryMode: query.deliveryMode } : {}),
    ...(query.distributionPointId ? { DistributionPointId: query.distributionPointId } : {}),
    ...(query.campaignTeamId ? { CampaignTeamId: query.campaignTeamId } : {}),
    ...(query.isIsolated !== undefined ? { IsIsolated: query.isIsolated } : {}),
    ...(query.pageIndex !== undefined ? { PageIndex: query.pageIndex } : {}),
    ...(query.pageSize !== undefined ? { PageSize: query.pageSize } : {}),
    ...(query.search ? { Search: query.search } : {}),
  };
};

const toPascalCaseDeliveryParams = (query?: DeliveryQueryRequest) => {
  if (!query) return undefined;

  return {
    ...(query.status !== undefined ? { Status: query.status } : {}),
    ...(query.deliveryMode !== undefined ? { DeliveryMode: query.deliveryMode } : {}),
    ...(query.distributionPointId ? { DistributionPointId: query.distributionPointId } : {}),
    ...(query.campaignTeamId ? { CampaignTeamId: query.campaignTeamId } : {}),
    ...(query.scheduledFrom ? { ScheduledFrom: query.scheduledFrom } : {}),
    ...(query.scheduledTo ? { ScheduledTo: query.scheduledTo } : {}),
    ...(query.pageIndex !== undefined ? { PageIndex: query.pageIndex } : {}),
    ...(query.pageSize !== undefined ? { PageSize: query.pageSize } : {}),
    ...(query.search ? { Search: query.search } : {}),
  };
};

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  status?: number;
}

const debugLog = (label: string, payload?: unknown) => {
  if (__DEV__) {
    console.log(`[ReliefDistributionService] ${label}`, payload ?? '');
  }
};

const debugError = (label: string, error: any) => {
  if (__DEV__) {
    console.error(`[ReliefDistributionService] ${label}`, {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
  }
};

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
      debugError(`requestFailed:${route}`, error);
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

export const reliefDistributionService = {
  // ─── Distribution Points ────────────────────────────────

  getDistributionPoints: async (
    campaignId: string,
    query?: DistributionPointQueryRequest,
  ): Promise<ApiResponse<PaginatedResponse<DistributionPointResponse>>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/distribution-points`,
      `/api/relief/campaigns/${campaignId}/distribution-points`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('getDistributionPoints', { route, campaignId, query });
        const resp = await api.get<PaginatedResponse<DistributionPointResponse>>(route, { params: query });
        return resp.data;
      },
      'Không thể tải danh sách điểm phát.',
    );
  },

  // ─── Households ─────────────────────────────────────────

  getCampaignHouseholds: async (
    campaignId: string,
    query?: HouseholdQueryRequest,
  ): Promise<ApiResponse<PaginatedResponse<CampaignHouseholdResponse>>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/households`,
      `/api/relief/campaigns/${campaignId}/households`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        const params = toPascalCaseHouseholdParams(query);
        debugLog('getCampaignHouseholds', { route, campaignId, query, params });
        const resp = await api.get<PaginatedResponse<CampaignHouseholdResponse>>(route, { params });
        return resp.data;
      },
      'Không thể tải danh sách hộ gia đình.',
    );
  },

  getChecklist: async (
    campaignId: string,
    query?: DeliveryQueryRequest,
  ): Promise<ApiResponse<PaginatedResponse<HouseholdChecklistItemResponse>>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/checklist`,
      `/api/relief/campaigns/${campaignId}/checklist`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        const params = toPascalCaseDeliveryParams(query);
        debugLog('getChecklist', { route, campaignId, query, params });
        const resp = await api.get<PaginatedResponse<HouseholdChecklistItemResponse>>(route, { params });
        return resp.data;
      },
      'Không thể tải checklist phát hàng.',
    );
  },

  updateHouseholdStatus: async (
    campaignId: string,
    campaignHouseholdId: string,
    request: UpdateCampaignHouseholdStatusRequest,
  ): Promise<ApiResponse<void>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/households/${campaignHouseholdId}/status`,
      `/api/relief/campaigns/${campaignId}/households/${campaignHouseholdId}/status`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('updateHouseholdStatus', { route, campaignId, campaignHouseholdId, request });
        await api.patch(route, request);
      },
      'Không thể cập nhật trạng thái hộ gia đình.',
    );
  },

  // ─── Shortage Requests ──────────────────────────────────

  createShortageRequest: async (
    campaignId: string,
    request: CreateSupplyShortageRequestPayload,
  ): Promise<ApiResponse<SupplyShortageRequestResponse>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/shortage-requests`,
      `/api/relief/campaigns/${campaignId}/shortage-requests`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('createShortageRequest', { route, campaignId, request });
        const resp = await api.post<SupplyShortageRequestResponse>(route, request);
        return resp.data;
      },
      'Không thể tạo yêu cầu bổ sung vật tư.',
    );
  },

  getShortageRequests: async (
    campaignId: string,
    query?: SupplyShortageRequestQueryRequest,
  ): Promise<ApiResponse<PaginatedResponse<SupplyShortageRequestResponse>>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/shortage-requests`,
      `/api/relief/campaigns/${campaignId}/shortage-requests`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('getShortageRequests', { route, campaignId, query });
        const resp = await api.get<PaginatedResponse<SupplyShortageRequestResponse>>(route, { params: query });
        return resp.data;
      },
      'Không thể tải danh sách yêu cầu bổ sung.',
    );
  },

  // ─── Deliveries ─────────────────────────────────────────

  completeDelivery: async (
    campaignId: string,
    householdDeliveryId: string,
    request: CompleteHouseholdDeliveryRequest,
  ): Promise<ApiResponse<HouseholdDeliveryResponse>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/deliveries/${householdDeliveryId}/complete`,
      `/api/relief/campaigns/${campaignId}/deliveries/${householdDeliveryId}/complete`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('completeDelivery', { route, campaignId, householdDeliveryId, request });
        try {
          const resp = await api.post<HouseholdDeliveryResponse>(route, request);
          return resp.data;
        } catch (error: any) {
          debugError('completeDeliveryFailed', {
            route,
            campaignId,
            householdDeliveryId,
            request,
            responseStatus: error?.response?.status,
            responseData: error?.response?.data,
            responseHeaders: error?.response?.headers,
            message: error?.message,
          });
          throw error;
        }
      },
      'Không thể hoàn thành phát hàng.',
    );
  },

  completeDeliveryBatch: async (
    campaignId: string,
    request: CompleteHouseholdDeliveryBatchRequest,
  ): Promise<ApiResponse<BatchCompleteHouseholdDeliveryResponse>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/deliveries/complete-batch`,
      `/api/relief/campaigns/${campaignId}/deliveries/complete-batch`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('completeDeliveryBatch', { route, campaignId, request });
        try {
          const resp = await api.post<BatchCompleteHouseholdDeliveryResponse>(route, request);
          return resp.data;
        } catch (error: any) {
          debugError('completeDeliveryBatchFailed', {
            route,
            campaignId,
            request,
            responseStatus: error?.response?.status,
            responseData: error?.response?.data,
            responseHeaders: error?.response?.headers,
            message: error?.message,
          });
          throw error;
        }
      },
      'Không thể hoàn thành phát hàng hàng loạt.',
    );
  },

  getDeliveryById: async (
    campaignId: string,
    householdDeliveryId: string,
  ): Promise<ApiResponse<HouseholdDeliveryResponse>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/deliveries/${householdDeliveryId}`,
      `/api/relief/campaigns/${campaignId}/deliveries/${householdDeliveryId}`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('getDeliveryById', { route, campaignId, householdDeliveryId });
        const resp = await api.get<HouseholdDeliveryResponse>(route);
        return resp.data;
      },
      'Không thể tải chi tiết phát hàng.',
    );
  },
};
