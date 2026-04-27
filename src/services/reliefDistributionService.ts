import api from './api';
import { extractApiErrorMessage } from '../utils/apiError';

import type {
  CampaignInventoryBalanceResponse,
  CampaignHouseholdResponse,
  CampaignPackageQueryRequest,
  DistributionPointResponse,
  HouseholdChecklistItemResponse,
  DistributionPointQueryRequest,
  DeliveryQueryRequest,
  HouseholdQueryRequest,
  UpdateCampaignHouseholdStatusRequest,
  CreateSupplyShortageRequestPayload,
  ReliefPackageDefinitionResponse,
  SupplyShortageRequestResponse,
  SupplyShortageRequestQueryRequest,
  CompleteHouseholdDeliveryRequest,
  HouseholdDeliveryResponse,
  CompleteHouseholdDeliveryBatchRequest,
  BatchCompleteHouseholdDeliveryResponse,
  PaginatedResponse,
} from '../types/reliefDistribution';

const toPascalCasePackageParams = (query?: CampaignPackageQueryRequest) => {
  if (!query) return undefined;

  return {
    ...(query.isActive !== undefined ? { IsActive: query.isActive } : {}),
    ...(query.isDefault !== undefined ? { IsDefault: query.isDefault } : {}),
    ...(query.pageIndex !== undefined ? { PageIndex: query.pageIndex } : {}),
    ...(query.pageSize !== undefined ? { PageSize: query.pageSize } : {}),
    ...(query.search ? { Search: query.search } : {}),
  };
};

const toPascalCaseShortageRequestParams = (
  query?: SupplyShortageRequestQueryRequest,
) => {
  if (!query) return undefined;

  return {
    ...(query.status !== undefined ? { Status: query.status } : {}),
    ...(query.distributionPointId
      ? { DistributionPointId: query.distributionPointId }
      : {}),
    ...(query.campaignTeamId ? { CampaignTeamId: query.campaignTeamId } : {}),
    ...(query.requestedByUserId
      ? { RequestedByUserId: query.requestedByUserId }
      : {}),
    ...(query.pageIndex !== undefined ? { PageIndex: query.pageIndex } : {}),
    ...(query.pageSize !== undefined ? { PageSize: query.pageSize } : {}),
    ...(query.search ? { Search: query.search } : {}),
  };
};

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

const pickFirstDefined = (obj: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }
  return undefined;
};

const toNumberSafe = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeInventoryBalanceItem = (raw: any) => {
  if (!raw || typeof raw !== 'object') return null;

  const supplyItemId = pickFirstDefined(raw, [
    'supplyItemId',
    'SupplyItemId',
    'itemId',
    'ItemId',
    'id',
    'Id',
  ]);

  if (!supplyItemId) return null;

  return {
    supplyItemId: String(supplyItemId),
    supplyItemName:
      pickFirstDefined(raw, [
        'supplyItemName',
        'SupplyItemName',
        'itemName',
        'ItemName',
        'name',
        'Name',
      ]) || 'Chưa rõ vật tư',
    unit: pickFirstDefined(raw, ['unit', 'Unit', 'uom', 'Uom']),
    availableQuantity: toNumberSafe(
      pickFirstDefined(raw, [
        'availableQuantity',
        'AvailableQuantity',
        'available',
        'Available',
        'quantity',
        'Quantity',
        'onHand',
        'OnHand',
        'stockQuantity',
        'StockQuantity',
      ]),
      0,
    ),
    reservedQuantity: toNumberSafe(
      pickFirstDefined(raw, ['reservedQuantity', 'ReservedQuantity']),
      0,
    ),
    incomingQuantity: toNumberSafe(
      pickFirstDefined(raw, ['incomingQuantity', 'IncomingQuantity']),
      0,
    ),
    totalQuantity: toNumberSafe(
      pickFirstDefined(raw, ['totalQuantity', 'TotalQuantity']),
      0,
    ),
    isLowStock: Boolean(
      pickFirstDefined(raw, ['isLowStock', 'IsLowStock']) ?? false,
    ),
    shortageThreshold: toNumberSafe(
      pickFirstDefined(raw, ['shortageThreshold', 'ShortageThreshold']),
      0,
    ),
  };
};

const extractInventoryBalanceItems = (payload: any) => {
  const candidates = [
    payload,
    payload?.items,
    payload?.data,
    payload?.data?.items,
    payload?.result,
    payload?.result?.items,
    payload?.value,
    payload?.value?.items,
  ];

  const matched = candidates.find((candidate) => Array.isArray(candidate));
  if (!Array.isArray(matched)) return [];

  return matched
    .map(normalizeInventoryBalanceItem)
    .filter(Boolean);
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

  getInventoryBalance: async (
    campaignId: string,
  ): Promise<ApiResponse<CampaignInventoryBalanceResponse>> => {
    const routes = [
      `/campaigns/${campaignId}/inventory-balance`,
      `/api/campaigns/${campaignId}/inventory-balance`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('getInventoryBalance', { route, campaignId });
        const resp = await api.get<CampaignInventoryBalanceResponse | any[]>(route);
        const items = extractInventoryBalanceItems(resp.data);

        return {
          campaignId,
          updatedAt: pickFirstDefined(resp.data ?? {}, ['updatedAt', 'UpdatedAt']),
          items,
        } as CampaignInventoryBalanceResponse;
      },
      'Không thể tải tồn kho chiến dịch.',
    );
  },

  getCampaignPackages: async (
    campaignId: string,
    query?: CampaignPackageQueryRequest,
  ): Promise<ApiResponse<PaginatedResponse<ReliefPackageDefinitionResponse>>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/packages`,
      `/api/relief/campaigns/${campaignId}/packages`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        const params = toPascalCasePackageParams(query);
        debugLog('getCampaignPackages', { route, campaignId, query, params });
        const resp = await api.get<PaginatedResponse<ReliefPackageDefinitionResponse>>(route, {
          params,
        });
        return resp.data;
      },
      'Không thể tải danh sách gói phát hàng của chiến dịch.',
    );
  },

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
        const params = toPascalCaseShortageRequestParams(query);
        debugLog('getShortageRequests', { route, campaignId, query, params });
        const resp = await api.get<PaginatedResponse<SupplyShortageRequestResponse>>(route, {
          params,
        });
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
