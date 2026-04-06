// ── Enums / value types ────────────────────────────────────────────────────────
export type RescueType = 0 | 1;        // 0 = Normal, 1 = Emergency
export type DisasterType = 0 | 1 | 2;  // 0 = Flood, 1 = Landslide, 2 = Earthquake

// ── Shared domain interfaces ──────────────────────────────────────────────────
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

// ── App-level helper ──────────────────────────────────────────────────────────
export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  displayLabel: string;
}
