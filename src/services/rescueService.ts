import api from './api';
import type {
  RescueType,
  DisasterType,
  PriorityCriteria,
  RescueAttachment,
  NormalRescuePayload,
  EmergencyRescuePayload,
  LocationResult,
  MyRescueRequestItem,
  MyRescueRequestsResponse,
  RescueRequestDetailResponse,
  TeamLocationResponse,
  UpdateRescueOperationStatusPayload,
  CompleteRescueOperationPayload,
} from '../types/rescue';

export type {
  RescueType,
  DisasterType,
  PriorityCriteria,
  RescueAttachment,
  RescueVerification,
  AssignedRescueTeamInfo,
  MyRescueRequestItem,
  MyRescueRequestsResponse,
  RescueRequestDetailResponse,
  RescueAttachmentDetail,
  RescueOperationInfo,
  UpdateRescueOperationStatusPayload,
  CompleteRescueOperationPayload,
  TeamLocationResponse,
  NormalRescuePayload,
  EmergencyRescuePayload,
  LocationResult,
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
