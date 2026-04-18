import type {
    CancelRescueRequestPayload,
    CompleteRescueOperationPayload,
    DisasterType,
    EmergencyRescuePayload,
    MyRescueRequestsResponse,
    NormalRescuePayload,
    PriorityCriteria,
    RescueRequestDetailResponse,
    TeamLocationResponse,
    UpdateRescueOperationStatusPayload
} from '../types/rescue';
import api from './api';

export type {
    AssignedRescueTeamInfo, CancelRescueRequestPayload, CompleteRescueOperationPayload, DisasterType, EmergencyRescuePayload,
    LocationResult, MyRescueRequestItem,
    MyRescueRequestsResponse, NormalRescuePayload, PriorityCriteria,
    RescueAttachment, RescueAttachmentDetail,
    RescueOperationInfo, RescueRequestDetailResponse, RescueType, RescueVerification, TeamLocationResponse, UpdateRescueOperationStatusPayload
} from '../types/rescue';

export { getCurrentLocation } from '../utils/location';

// ── Priority Criteria ─────────────────────────────────────────────────────────

export async function fetchPriorityCriteria(
  disasterType: DisasterType,
): Promise<PriorityCriteria[]> {
  const res = await api.get<{ items: PriorityCriteria[] }>(
    '/priority-criteria',
    {
      params: { pageSize: 100 },
    },
  );
  return (res.data.items ?? []).filter(
    (c) => c.disasterType === disasterType && c.status === 'Active',
  );
}

// ── Submit ────────────────────────────────────────────────────────────────────

export async function submitRescueRequest(
  payload: NormalRescuePayload | EmergencyRescuePayload,
): Promise<void> {
  await api.post('/RescueRequest', payload);
}

export async function fetchMyRescueRequests(params?: {
  pageNumber?: number;
  pageSize?: number;
  statusFilter?: string;
}): Promise<MyRescueRequestsResponse> {
  const res = await api.get<MyRescueRequestsResponse>(
    '/RescueRequest/my-requests',
    {
      params,
    },
  );
  return res.data;
}

export async function fetchRescueRequestDetail(
  requestId: string,
): Promise<RescueRequestDetailResponse> {
  const res = await api.get<RescueRequestDetailResponse>(
    `/RescueRequest/${requestId}`,
  );
  return res.data;
}

export async function fetchRescueTeamLocation(
  requestId: string,
): Promise<TeamLocationResponse> {
  const res = await api.get<TeamLocationResponse>(
    `/RescueRequest/${requestId}/team-location`,
  );
  return res.data;
}

export async function cancelRescueRequest(
  requestId: string,
  payload: CancelRescueRequestPayload,
): Promise<RescueRequestDetailResponse> {
  const body = { reason: payload.reason };
  const routes = [
    `RescueRequest/${requestId}/cancel`,
    `/api/RescueRequest/${requestId}/cancel`,
    `/RescueRequest/${requestId}/cancel`,
  ];

  let lastError: unknown = null;

  for (const route of routes) {
    try {
      if (__DEV__) {
        console.info('[CancelRequest] Trying PATCH', {
          route,
          requestId,
          body,
        });
      }

      const res = await api.patch<RescueRequestDetailResponse>(route, body);
      return res.data;
    } catch (error) {
      const axiosError = error as any;
      const status = axiosError?.response?.status;

      if (__DEV__) {
        console.warn('[CancelRequest] PATCH failed', {
          route,
          requestId,
          body,
          status,
          data: axiosError?.response?.data,
          message: axiosError?.message,
        });
      }

      lastError = error;
      if (status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function updateRescueOperationStatus(
  requestId: string,
  operationId: string,
  payload: UpdateRescueOperationStatusPayload,
): Promise<RescueRequestDetailResponse> {
  const res = await api.patch<RescueRequestDetailResponse>(
    `/RescueRequest/${requestId}/operations/${operationId}/status`,
    payload,
  );
  return res.data;
}

export async function completeRescueOperation(
  requestId: string,
  operationId: string,
  payload: CompleteRescueOperationPayload,
): Promise<RescueRequestDetailResponse> {
  const res = await api.post<RescueRequestDetailResponse>(
    `/RescueRequest/${requestId}/operations/${operationId}/complete`,
    payload,
  );
  return res.data;
}
