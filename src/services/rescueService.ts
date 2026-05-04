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
    UpdateRescueOperationStatusPayload,
} from '../types/rescue';
import api from './api';

export type {
    AssignedRescueTeamInfo,
    CancelRescueRequestPayload,
    CompleteRescueOperationPayload,
    DisasterType,
    EmergencyRescuePayload,
    LocationResult,
    MyRescueRequestItem,
    MyRescueRequestsResponse,
    NormalRescuePayload,
    PriorityCriteria,
    RescueAttachment,
    RescueAttachmentDetail,
    RescueOperationInfo,
    RescueRequestDetailResponse,
    RescueType,
    RescueVerification,
    TeamLocationResponse,
    UpdateRescueOperationStatusPayload
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
  const normalizedReason = payload.reason.trim();
  const routes = [`/RescueRequest/${requestId}/cancel`];
  const methods: Array<'patch' | 'post'> = ['patch', 'post'];
  const payloadVariants = [
    { reason: normalizedReason },
    { reason: normalizedReason, note: normalizedReason },
  ];

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });

  const isCancelledStatus = (status?: string | null) => {
    const normalizedStatus = String(status ?? '')
      .trim()
      .toLowerCase();
    return normalizedStatus === 'cancelled' || normalizedStatus === 'canceled';
  };

  const verifyCancelledState = async () => {
    const delays = [0, 500, 1200];
    let latest: RescueRequestDetailResponse | null = null;

    for (const delay of delays) {
      if (delay > 0) {
        await wait(delay);
      }

      latest = await fetchRescueRequestDetail(requestId);
      if (isCancelledStatus(latest?.rescueRequestStatus)) {
        return latest;
      }
    }

    return latest;
  };

  let lastError: unknown = null;

  for (const route of routes) {
    for (const method of methods) {
      for (const body of payloadVariants) {
        try {
          if (__DEV__) {
            console.info('[CancelRequest] Trying request', {
              method,
              route,
              requestId,
              body,
            });
          }

          if (method === 'patch') {
            await api.patch(route, body);
          } else {
            await api.post(route, body);
          }

          const latest = await verifyCancelledState();
          if (isCancelledStatus(latest?.rescueRequestStatus)) {
            return latest as RescueRequestDetailResponse;
          }

          if (__DEV__) {
            console.warn(
              '[CancelRequest] Endpoint responded but status not cancelled yet',
              {
                method,
                route,
                requestId,
                latestStatus: latest?.rescueRequestStatus,
              },
            );
          }
        } catch (error) {
          const axiosError = error as any;
          const status = axiosError?.response?.status;

          if (__DEV__) {
            console.warn('[CancelRequest] Request failed', {
              method,
              route,
              requestId,
              body,
              status,
              data: axiosError?.response?.data,
              message: axiosError?.message,
            });
          }

          lastError = error;

          // Keep trying fallback combinations for common contract mismatches.
          if (![400, 404, 405, 415].includes(status)) {
            throw error;
          }
        }
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Không thể hủy yêu cầu trên hệ thống.');
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
