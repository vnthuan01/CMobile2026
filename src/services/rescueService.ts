import * as Location from 'expo-location';
import api from './api';

// ── Goong Maps ────────────────────────────────────────────────────────────────
// Set EXPO_PUBLIC_GOONG_API_KEY in your .env file
const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY ?? '';
const GOONG_REVERSE_GEOCODE = 'https://rsapi.goong.io/Geocode';

// ── Types ─────────────────────────────────────────────────────────────────────
export type RescueType = 0 | 1; // 0 = Normal, 1 = Emergency
export type DisasterType = 0 | 1 | 2; // 0 = Flood, 1 = Landslide, 2 = Earthquake

export interface PriorityCriteria {
  priorityCriteriaId: string;
  name: string;
  point: number;
  disasterType: number;
  code: string;
  description: string;
  status: string;
}

export interface RescueAttachment {
  fileUrl: string;
  contentType: string;
}

export interface RescueVerification {
  status: string;
  reason: string | null;
  note: string | null;
  verifiedAt: string | null;
}

export interface AssignedRescueTeamInfo {
  teamId: string;
  teamName: string;
  operationStatus: string;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastTrackedAt: string | null;
  estimatedMinutesToArrival: number | null;
  distanceKmToVictim: number | null;
  routePolyline: string | null;
  totalDistanceKm: number | null;
  totalEstimatedMinutes: number | null;
}

export interface MyRescueRequestItem {
  requestId: string;
  rescueRequestStatus: string;
  disasterType: string | number;
  rescueRequestType: string | number;
  description: string;
  address: string;
  priority: string | null;
  createdAt: string;
  updatedAt: string;
  assignedRescueTeam: AssignedRescueTeamInfo | null;
  verifications: RescueVerification[];
}

export interface MyRescueRequestsResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: MyRescueRequestItem[];
}

export interface RescueRequestDetailResponse {
  requestId: string;
  rescueRequestStatus: string;
  disasterType: string | number;
  rescueRequestType: string | number;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  priority: string | null;
  createdAt: string;
  updatedAt: string;
  assignedRescueTeam: AssignedRescueTeamInfo | null;
  verifications: RescueVerification[];
  attachments?: RescueAttachmentDetail[];
  rescueOperations?: RescueOperationInfo[];
}

export interface RescueAttachmentDetail {
  attachmentId?: string;
  fileUrl: string;
  contentType: string;
  uploadedAt?: string;
}

export interface RescueOperationInfo {
  rescueOperationId: string;
  teamId: string;
  teamName?: string;
  stationName?: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
}

export interface UpdateRescueOperationStatusPayload {
  status: number;
  note?: string | null;
}

export interface CompleteRescueOperationPayload {
  attachments: RescueAttachment[];
  note?: string | null;
}

export interface TeamLocationResponse {
  teamId: string;
  teamName: string;
  operationStatus: string;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastTrackedAt: string | null;
  estimatedMinutesToArrival: number | null;
  distanceKmToVictim: number | null;
  routePolyline: string | null;
  totalDistanceKm: number | null;
  totalEstimatedMinutes: number | null;
}

export interface NormalRescuePayload {
  rescueType: 0;
  disasterType: DisasterType;
  description: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  note: string;
  reporterFullName: string;
  reporterPhone: string;
  attachments: RescueAttachment[];
  selectedPriorityCriteriaIds: string[];
}

export interface EmergencyRescuePayload {
  rescueType: 1;
  disasterType: DisasterType;
  description: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  note: string;
  reporterFullName: string;
  reporterPhone: string;
  attachments: RescueAttachment[];
  selectedPriorityCriteriaIds: string[];
}

// ── Location helpers ──────────────────────────────────────────────────────────

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  displayLabel: string;
}

/**
 * Requests permission and gets the current GPS location, then reverse-geocodes
 * the coordinates using Goong Maps API (preferred) or expo-location fallback.
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Không có quyền truy cập vị trí.');
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const { latitude, longitude } = loc.coords;
  const accuracy = Math.round(loc.coords.accuracy ?? 0);

  // ── Try Goong Maps first ──────────────────────────────────────────────────
  if (GOONG_API_KEY) {
    try {
      const url = `${GOONG_REVERSE_GEOCODE}?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`;
      const resp = await fetch(url);
      const json = await resp.json();
      const result = json?.results?.[0];
      if (result) {
        const address: string = result.formatted_address ?? '';
        return {
          latitude,
          longitude,
          accuracy,
          address,
          displayLabel: `${address} (±${accuracy}m)`,
        };
      }
    } catch {
      // fall through to expo-location
    }
  }

  // ── Fallback: expo-location reverse geocode ───────────────────────────────
  const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
  if (geo.length > 0) {
    const g = geo[0];
    const parts = [g.street, g.district, g.city].filter(Boolean);
    const address = parts.join(', ');
    return {
      latitude,
      longitude,
      accuracy,
      address,
      displayLabel: `${address} (±${accuracy}m)`,
    };
  }

  return {
    latitude,
    longitude,
    accuracy,
    address: '',
    displayLabel: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
  };
}

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
