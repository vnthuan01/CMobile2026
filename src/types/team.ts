import type { AssignedVehicle } from './vehicle';

// ── Team domain ───────────────────────────────────────────────────────────────

export interface TeamSkillResponse {
  skillId: string;
  code: string;
  name: string;
  description: string | null;
}

export interface TeamUserSummary {
  userId: string;
  displayName: string;
  email: string;
}

export interface TeamLeaderSummary extends TeamUserSummary {
  skills: TeamSkillResponse[];
}

export interface TeamMemberSummary extends TeamUserSummary {
  volunteerProfileId?: string | null;
  role: 'Leader' | 'Member' | string;
  skills: TeamSkillResponse[];
  joinedAt: string;
}

export type TeamMode = 'rescue' | 'relief';

export interface AssignedCampaignSummary {
  campaignId: string;
  campaignName?: string | null;
  campaignType?: string | number | null;
  role?: string | number | null;
  status?: string | number | null;
  campaignStatus?: string | number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface TeamDetailResponse {
  teamId: string;
  name: string;
  description: string | null;
  contactPhone: string | null;
  status: 'Draft' | 'Active' | 'Inactive' | string;
  teamType?: string | number | null;
  teamMode?: TeamMode;
  moderator: TeamUserSummary | null;
  leader: TeamLeaderSummary | null;
  members: TeamMemberSummary[];
  assignedCampaigns?: AssignedCampaignSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamTrackingHeartbeatRequest {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  speedKph?: number | null;
  headingDegree?: number | null;
  source?: number;
  capturedAtUtc?: string;
  rescueBatchId?: string | null;
  rescueOperationId?: string | null;
  note?: string | null;
}

export interface TeamTrackingHeartbeatResponse {
  teamTrackingPointId: string;
  teamId: string;
  rescueBatchId: string | null;
  rescueOperationId: string | null;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  speedKph: number | null;
  headingDegree: number | null;
  source: number;
  capturedAtUtc: string;
  createdAtUtc: string;
  note: string | null;
}

export type TeamTrackingPointResponse = TeamTrackingHeartbeatResponse;

// ── Rescue team / batch ───────────────────────────────────────────────────────

export interface RescueBatchItem {
  rescueBatchItemId: string;
  rescueRequestId: string;
  vehicleId?: string | null;
  vehicleName?: string | null;
  vehicleLicensePlate?: string | null;
  vehicles?: AssignedVehicle[] | null;
  disasterType: string;
  rescueRequestType: 'Normal' | 'Emergency' | string;
  priorityPoint?: number | null;
  priorityLevel?: number | string | null;
  rescueRequestStatus: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  reporterFullName: string;
  reporterPhone: string;
  sequenceOrder: number;
  isAutoAssigned: boolean;
  distanceKm: number | null;
  estimatedMinutes: number | null;
  status: 'Pending' | 'InProgress' | 'Done' | 'Cancelled' | string;
  createdAt: string;
}

export interface RescueActiveBatchResponse {
  rescueBatchId: string;
  teamId: string;
  isActive: boolean;
  status: string;
  routePolyline: string | null;
  totalDistanceKm: number | null;
  estimatedMinutes: number | null;
  createdAt: string;
  closedAt: string | null;
  items: RescueBatchItem[];
}

export interface RescueTeamHistoryRequestItem {
  requestId: string;
  vehicleId?: string | null;
  vehicleName?: string | null;
  vehicleLicensePlate?: string | null;
  vehicles?: AssignedVehicle[] | null;
  address: string;
  description?: string | null;
  note?: string | null;
  disasterType: string;
  rescueRequestType?: string | number | null;
  priority?: number | null;
  priorityPoint?: number | null;
  priorityLevel?: string | number | null;
  rescueRequestStatus: string;
  reporterFullName: string;
  reporterPhone: string;
  createdAt: string;
  updatedAt: string;
  sequenceOrder: number;
  batchItemStatus: string;
}

export interface RescueTeamHistoryBatch {
  rescueBatchId: string;
  createdAt: string;
  closedAt: string | null;
  totalRequests: number;
  completedRequests: number;
  requests: RescueTeamHistoryRequestItem[];
}

export interface RescueTeamHistoryResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  data: RescueTeamHistoryBatch[];
}
