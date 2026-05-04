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
  ReportNewReliefHouseholdRequest,
  CreateSupplyShortageRequestPayload,
  ReliefPackageDefinitionResponse,
  SupplyShortageRequestResponse,
  SupplyShortageRequestQueryRequest,
  CompleteHouseholdDeliveryRequest,
  HouseholdDeliveryResponse,
  CompleteHouseholdDeliveryBatchRequest,
  BatchCompleteHouseholdDeliveryResponse,
  ReliefCampaignPlanSummary,
  PaginatedResponse,
  TeamWorklistItemResponse,
  TeamWorklistQueryRequest,
  MemberTaskDeliveryResponse,
  MemberTaskDeliveryQueryRequest,
  CompleteMemberTaskDeliveryWithDeliveryRequest,
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

const toPascalCaseTeamWorklistParams = (query?: TeamWorklistQueryRequest) => {
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

const toPascalCaseMemberTaskDeliveryParams = (
  query?: MemberTaskDeliveryQueryRequest,
) => {
  if (!query) return undefined;

  return {
    ...(query.status !== undefined ? { Status: query.status } : {}),
    ...(query.deliveryMode !== undefined ? { DeliveryMode: query.deliveryMode } : {}),
    ...(query.distributionPointId ? { DistributionPointId: query.distributionPointId } : {}),
    ...(query.campaignTeamId ? { CampaignTeamId: query.campaignTeamId } : {}),
    ...(query.memberTaskId ? { MemberTaskId: query.memberTaskId } : {}),
    ...(query.campaignTaskId ? { CampaignTaskId: query.campaignTaskId } : {}),
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

const pickNestedCoordinateValue = (
  obj: Record<string, any>,
  parentKeys: string[],
  childKeys: string[],
) => {
  for (const parentKey of parentKeys) {
    const parent = obj?.[parentKey];
    if (!parent || typeof parent !== 'object') continue;

    const nested = pickFirstDefined(parent, childKeys);
    if (nested !== undefined && nested !== null) {
      return nested;
    }
  }

  return undefined;
};

const extractCoordinatesFromAreaName = (value: unknown) => {
  if (typeof value !== 'string') return null;

  const match = value.match(/\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\)/);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
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

const normalizePlanSummary = (payload: any): ReliefCampaignPlanSummary => ({
  campaignId: String(pickFirstDefined(payload, ['campaignId', 'CampaignId']) || ''),
  totalHouseholds: toNumberSafe(pickFirstDefined(payload, ['totalHouseholds', 'TotalHouseholds'])),
  isolatedHouseholds: toNumberSafe(pickFirstDefined(payload, ['isolatedHouseholds', 'IsolatedHouseholds'])),
  totalPopulation: toNumberSafe(pickFirstDefined(payload, ['totalPopulation', 'TotalPopulation'])),
  averagePopulationDensity: toNumberSafe(pickFirstDefined(payload, ['averagePopulationDensity', 'AveragePopulationDensity'])),
  highDensityAreaCount: toNumberSafe(pickFirstDefined(payload, ['highDensityAreaCount', 'HighDensityAreaCount'])),
  mobileTeamPriorityAreaCount: toNumberSafe(pickFirstDefined(payload, ['mobileTeamPriorityAreaCount', 'MobileTeamPriorityAreaCount'])),
  pickupPriorityAreaCount: toNumberSafe(pickFirstDefined(payload, ['pickupPriorityAreaCount', 'PickupPriorityAreaCount'])),
  distributionPointCount: toNumberSafe(pickFirstDefined(payload, ['distributionPointCount', 'DistributionPointCount'])),
  pendingHouseholds: toNumberSafe(pickFirstDefined(payload, ['pendingHouseholds', 'PendingHouseholds'])),
  suggestedTeamCount: toNumberSafe(pickFirstDefined(payload, ['suggestedTeamCount', 'SuggestedTeamCount'])),
  estimatedReliefPersonnel: toNumberSafe(pickFirstDefined(payload, ['estimatedReliefPersonnel', 'EstimatedReliefPersonnel'])),
  estimatedLocalVolunteers: toNumberSafe(pickFirstDefined(payload, ['estimatedLocalVolunteers', 'EstimatedLocalVolunteers'])),
  estimatedBoatCount: toNumberSafe(pickFirstDefined(payload, ['estimatedBoatCount', 'EstimatedBoatCount'])),
  estimatedLifeJacketCount: toNumberSafe(pickFirstDefined(payload, ['estimatedLifeJacketCount', 'EstimatedLifeJacketCount'])),
  areas: Array.isArray(pickFirstDefined(payload, ['areas', 'Areas']))
    ? pickFirstDefined(payload, ['areas', 'Areas']).map((item: any) => {
        const areaName = String(
          pickFirstDefined(item, ['areaName', 'AreaName']) || 'Chưa phân khu vực',
        );
        const parsedCoordinates = extractCoordinatesFromAreaName(areaName);
        const latitudeValue =
          pickFirstDefined(item, ['latitude', 'Latitude', 'lat', 'Lat', 'centerLatitude', 'CenterLatitude']) ??
          pickNestedCoordinateValue(item, ['coordinate', 'Coordinate', 'center', 'Center', 'location', 'Location', 'geo', 'Geo'], ['latitude', 'Latitude', 'lat', 'Lat']);
        const longitudeValue =
          pickFirstDefined(item, ['longitude', 'Longitude', 'lng', 'Lng', 'lon', 'Lon', 'centerLongitude', 'CenterLongitude']) ??
          pickNestedCoordinateValue(item, ['coordinate', 'Coordinate', 'center', 'Center', 'location', 'Location', 'geo', 'Geo'], ['longitude', 'Longitude', 'lng', 'Lng', 'lon', 'Lon']);

        return {
          areaName,
          locationId: pickFirstDefined(item, ['locationId', 'LocationId']) ? String(pickFirstDefined(item, ['locationId', 'LocationId'])) : null,
          latitude:
            latitudeValue == null
              ? (parsedCoordinates?.latitude ?? null)
              : toNumberSafe(latitudeValue),
          longitude:
            longitudeValue == null
              ? (parsedCoordinates?.longitude ?? null)
              : toNumberSafe(longitudeValue),
          populationDensity: toNumberSafe(pickFirstDefined(item, ['populationDensity', 'PopulationDensity'])),
          householdCount: toNumberSafe(pickFirstDefined(item, ['householdCount', 'HouseholdCount'])),
          isolatedHouseholdCount: toNumberSafe(pickFirstDefined(item, ['isolatedHouseholdCount', 'IsolatedHouseholdCount'])),
          population: toNumberSafe(pickFirstDefined(item, ['population', 'Population'])),
          averageHouseholdSize: toNumberSafe(pickFirstDefined(item, ['averageHouseholdSize', 'AverageHouseholdSize'])),
          pendingHouseholds: toNumberSafe(pickFirstDefined(item, ['pendingHouseholds', 'PendingHouseholds'])),
          estimatedCoverageRadiusKm: toNumberSafe(pickFirstDefined(item, ['estimatedCoverageRadiusKm', 'EstimatedCoverageRadiusKm'])),
          travelComplexityLabel: String(pickFirstDefined(item, ['travelComplexityLabel', 'TravelComplexityLabel']) || ''),
          recommendedOperationalMode: String(pickFirstDefined(item, ['recommendedOperationalMode', 'RecommendedOperationalMode']) || ''),
          recommendedDeliveryStrategy: String(pickFirstDefined(item, ['recommendedDeliveryStrategy', 'RecommendedDeliveryStrategy']) || ''),
          suggestedDistributionPointCount: toNumberSafe(pickFirstDefined(item, ['suggestedDistributionPointCount', 'SuggestedDistributionPointCount'])),
          suggestedMobileTeamCount: toNumberSafe(pickFirstDefined(item, ['suggestedMobileTeamCount', 'SuggestedMobileTeamCount'])),
          suggestedTeamCount: toNumberSafe(pickFirstDefined(item, ['suggestedTeamCount', 'SuggestedTeamCount'])),
          estimatedPackages: toNumberSafe(pickFirstDefined(item, ['estimatedPackages', 'EstimatedPackages'])),
          estimatedBoatCount: toNumberSafe(pickFirstDefined(item, ['estimatedBoatCount', 'EstimatedBoatCount'])),
          estimatedLifeJacketCount: toNumberSafe(pickFirstDefined(item, ['estimatedLifeJacketCount', 'EstimatedLifeJacketCount'])),
        };
      })
    : [],
  isolatedHouseholdItems: Array.isArray(pickFirstDefined(payload, ['isolatedHouseholdItems', 'IsolatedHouseholdItems']))
    ? pickFirstDefined(payload, ['isolatedHouseholdItems', 'IsolatedHouseholdItems']).map((item: any) => ({
        campaignHouseholdId: String(pickFirstDefined(item, ['campaignHouseholdId', 'CampaignHouseholdId']) || ''),
        householdCode: String(pickFirstDefined(item, ['householdCode', 'HouseholdCode']) || ''),
        headOfHouseholdName: String(pickFirstDefined(item, ['headOfHouseholdName', 'HeadOfHouseholdName']) || ''),
        address: pickFirstDefined(item, ['address', 'Address']) || null,
        locationId: pickFirstDefined(item, ['locationId', 'LocationId']) ? String(pickFirstDefined(item, ['locationId', 'LocationId'])) : null,
        latitude: (() => {
          const value =
            pickFirstDefined(item, ['latitude', 'Latitude', 'lat', 'Lat']) ??
            pickNestedCoordinateValue(item, ['coordinate', 'Coordinate', 'location', 'Location', 'geo', 'Geo'], ['latitude', 'Latitude', 'lat', 'Lat']);
          return value == null ? null : toNumberSafe(value);
        })(),
        longitude: (() => {
          const value =
            pickFirstDefined(item, ['longitude', 'Longitude', 'lng', 'Lng', 'lon', 'Lon']) ??
            pickNestedCoordinateValue(item, ['coordinate', 'Coordinate', 'location', 'Location', 'geo', 'Geo'], ['longitude', 'Longitude', 'lng', 'Lng', 'lon', 'Lon']);
          return value == null ? null : toNumberSafe(value);
        })(),
        householdSize: toNumberSafe(pickFirstDefined(item, ['householdSize', 'HouseholdSize'])),
        floodSeverityLevel: pickFirstDefined(item, ['floodSeverityLevel', 'FloodSeverityLevel']) ?? null,
        isolationSeverityLevel: pickFirstDefined(item, ['isolationSeverityLevel', 'IsolationSeverityLevel']) ?? null,
        requiresBoat: Boolean(pickFirstDefined(item, ['requiresBoat', 'RequiresBoat']) ?? false),
        requiresLocalGuide: Boolean(pickFirstDefined(item, ['requiresLocalGuide', 'RequiresLocalGuide']) ?? false),
        priorityLabel: String(pickFirstDefined(item, ['priorityLabel', 'PriorityLabel']) || 'Ưu tiên'),
        suggestedSupportMode: String(pickFirstDefined(item, ['suggestedSupportMode', 'SuggestedSupportMode']) || 'Giao tận nơi'),
        estimatedReliefPersonnel: toNumberSafe(pickFirstDefined(item, ['estimatedReliefPersonnel', 'EstimatedReliefPersonnel'])),
        estimatedBoatCount: toNumberSafe(pickFirstDefined(item, ['estimatedBoatCount', 'EstimatedBoatCount'])),
        estimatedLifeJacketCount: toNumberSafe(pickFirstDefined(item, ['estimatedLifeJacketCount', 'EstimatedLifeJacketCount'])),
        campaignTeamName: pickFirstDefined(item, ['campaignTeamName', 'CampaignTeamName']) || null,
      }))
    : [],
  distributionPoints: Array.isArray(pickFirstDefined(payload, ['distributionPoints', 'DistributionPoints']))
    ? pickFirstDefined(payload, ['distributionPoints', 'DistributionPoints']).map((item: any) => ({
        distributionPointId: String(pickFirstDefined(item, ['distributionPointId', 'DistributionPointId']) || ''),
        name: String(pickFirstDefined(item, ['name', 'Name']) || 'Điểm phát'),
        address: pickFirstDefined(item, ['address', 'Address']) || null,
        assignedHouseholdCount: toNumberSafe(pickFirstDefined(item, ['assignedHouseholdCount', 'AssignedHouseholdCount'])),
        pendingDeliveryCount: toNumberSafe(pickFirstDefined(item, ['pendingDeliveryCount', 'PendingDeliveryCount'])),
        suggestedPersonnelCount: toNumberSafe(pickFirstDefined(item, ['suggestedPersonnelCount', 'SuggestedPersonnelCount'])),
        suggestedLocalVolunteerCount: toNumberSafe(pickFirstDefined(item, ['suggestedLocalVolunteerCount', 'SuggestedLocalVolunteerCount'])),
      }))
    : [],
  resourceRequirements: Array.isArray(pickFirstDefined(payload, ['resourceRequirements', 'ResourceRequirements']))
    ? pickFirstDefined(payload, ['resourceRequirements', 'ResourceRequirements']).map((item: any) => ({
        resourceType: String(pickFirstDefined(item, ['resourceType', 'ResourceType']) || ''),
        resourceName: String(pickFirstDefined(item, ['resourceName', 'ResourceName']) || ''),
        estimatedQuantity: toNumberSafe(pickFirstDefined(item, ['estimatedQuantity', 'EstimatedQuantity'])),
        notes: pickFirstDefined(item, ['notes', 'Notes']) || null,
      }))
    : [],
});

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  status?: number;
}

const ENABLE_DEBUG_LOGS = false;

const debugLog = (label: string, payload?: unknown) => {
  if (__DEV__ && ENABLE_DEBUG_LOGS) {
    console.log(`[ReliefDistributionService] ${label}`, payload ?? '');
  }
};

const debugError = (label: string, error: any) => {
  if (__DEV__ && ENABLE_DEBUG_LOGS) {
    console.error(`[ReliefDistributionService] ${label}`, {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
  }
};

const debugPackageSnapshot = (label: string, payload: any) => {
  if (!__DEV__ || !ENABLE_DEBUG_LOGS) return;

  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : [];

  const snapshot = items.slice(0, 5).map((item: any, index: number) => ({
    index,
    householdCode: pickFirstDefined(item, ['householdCode', 'HouseholdCode']),
    householdDeliveryId: pickFirstDefined(item, [
      'householdDeliveryId',
      'HouseholdDeliveryId',
    ]),
    deliveryMode: pickFirstDefined(item, ['deliveryMode', 'DeliveryMode']),
    distributionPointId: pickFirstDefined(item, [
      'distributionPointId',
      'DistributionPointId',
    ]),
    reliefPackageDefinitionId: pickFirstDefined(item, [
      'reliefPackageDefinitionId',
      'ReliefPackageDefinitionId',
    ]),
    reliefPackageDefinitionName: pickFirstDefined(item, [
      'reliefPackageDefinitionName',
      'ReliefPackageDefinitionName',
      'packageName',
      'PackageName',
      'name',
      'Name',
    ]),
  }));

  console.log(`[ReliefDistributionService] ${label}`, snapshot);
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

  reportNewReliefHousehold: async (
    campaignId: string,
    request: ReportNewReliefHouseholdRequest,
  ): Promise<ApiResponse<CampaignHouseholdResponse>> => {
    const routes = [
      `/api/relief/campaigns/${campaignId}/households/report-new`,
      `/relief/campaigns/${campaignId}/households/report-new`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('reportNewReliefHousehold', { route, campaignId, request });
        const resp = await api.post<CampaignHouseholdResponse>(route, request);
        return resp.data;
      },
      'Không thể ghi nhận hộ dân cần cứu trợ mới.',
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
        debugPackageSnapshot('getChecklist:package-fields', resp.data);
        return resp.data;
      },
      'Không thể tải checklist phát hàng.',
    );
  },

  getTeamWorklist: async (
    campaignId: string,
    query?: TeamWorklistQueryRequest,
  ): Promise<ApiResponse<PaginatedResponse<TeamWorklistItemResponse>>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/team-worklist`,
      `/api/relief/campaigns/${campaignId}/team-worklist`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        const params = toPascalCaseTeamWorklistParams(query);
        debugLog('getTeamWorklist', { route, campaignId, query, params });
        const resp = await api.get<PaginatedResponse<TeamWorklistItemResponse>>(route, { params });
        debugPackageSnapshot('getTeamWorklist:package-fields', resp.data);
        return resp.data;
      },
      'Không thể tải worklist của đội.',
    );
  },

  getMyMemberTaskDeliveries: async (
    campaignId: string,
    query?: MemberTaskDeliveryQueryRequest,
  ): Promise<ApiResponse<PaginatedResponse<MemberTaskDeliveryResponse>>> => {
    const routes = [
      `/api/campaigns/${campaignId}/member-task-deliveries/me`,
      `/campaigns/${campaignId}/member-task-deliveries/me`,
    ];
    for (const route of routes) {
      try {
        const params = toPascalCaseMemberTaskDeliveryParams(query);
        debugLog('getMyMemberTaskDeliveries', { route, campaignId, query, params });
        const resp = await api.get<
          PaginatedResponse<MemberTaskDeliveryResponse> | MemberTaskDeliveryResponse[]
        >(route, { params });

        const payload = resp.data;
        debugPackageSnapshot('getMyMemberTaskDeliveries:package-fields', payload);
        if (Array.isArray(payload)) {
          return {
            success: true,
            data: {
              totalCount: payload.length,
              pageSize: payload.length || query?.pageSize || 0,
              currentPage: query?.pageIndex || 1,
              totalPages: 1,
              items: payload,
            },
            message: 'Lấy delivery được giao cho tôi thành công',
          };
        }

        return {
          success: true,
          data: payload,
          message: 'Lấy delivery được giao cho tôi thành công',
        };
      } catch (error: any) {
        if (error?.response?.status === 404) {
          continue;
        }
        debugError(`getMyMemberTaskDeliveriesFailed:${route}`, error);
        if (error?.response?.status === 403) {
          return {
            success: false,
            data: null,
            status: 403,
            message: 'Tài khoản hiện tại không được backend cho phép xem member-task-deliveries/me.',
          };
        }
        if (!error?.response) {
          continue;
        }
        return {
          success: false,
          data: null,
          status: error?.response?.status,
          message: extractApiErrorMessage(error, 'Không thể tải delivery được giao cho tôi.'),
        };
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint member-task-deliveries/me.',
    };
  },

  getCampaignPlanSummary: async (
    campaignId: string,
  ): Promise<ApiResponse<ReliefCampaignPlanSummary>> => {
    const routes = [
      `/relief/campaigns/${campaignId}/plan-summary`,
      `/api/relief/campaigns/${campaignId}/plan-summary`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('getCampaignPlanSummary', { route, campaignId });
        const resp = await api.get<any>(route);
        return normalizePlanSummary(resp.data);
      },
      'Không thể tải kế hoạch cứu trợ.',
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

  completeMemberTaskDeliveryWithDelivery: async (
    memberTaskDeliveryId: string,
    request: CompleteMemberTaskDeliveryWithDeliveryRequest,
  ): Promise<ApiResponse<MemberTaskDeliveryResponse>> => {
    const routes = [
      `/campaigns/member-task-deliveries/${memberTaskDeliveryId}/complete-with-delivery`,
      `/api/campaigns/member-task-deliveries/${memberTaskDeliveryId}/complete-with-delivery`,
    ];
    return tryRoutes(
      routes,
      async (route) => {
        debugLog('completeMemberTaskDeliveryWithDelivery', { route, memberTaskDeliveryId, request });
        const resp = await api.post<MemberTaskDeliveryResponse>(route, request);
        return resp.data;
      },
      'Không thể hoàn tất delivery theo flow mobile.',
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
