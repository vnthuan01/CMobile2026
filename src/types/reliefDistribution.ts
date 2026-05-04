// ─── Enums ───────────────────────────────────────────────

export enum HouseholdFulfillmentStatus {
  Pending = 0,
  PartiallyDelivered = 1,
  Delivered = 2,
  Skipped = 3,
}

export enum DeliveryMode {
  DoorToDoor = 0,
  PickupAtPoint = 1,
}

export enum SupplyShortageRequestStatus {
  Pending = 0,
  Approved = 1,
  Fulfilled = 2,
  Rejected = 3,
  Cancelled = 4,
}

// ─── Label Mappings ──────────────────────────────────────

export const HouseholdFulfillmentStatusLabels: Record<HouseholdFulfillmentStatus, string> = {
  [HouseholdFulfillmentStatus.Pending]: 'Chờ phát',
  [HouseholdFulfillmentStatus.PartiallyDelivered]: 'Phát một phần',
  [HouseholdFulfillmentStatus.Delivered]: 'Đã phát',
  [HouseholdFulfillmentStatus.Skipped]: 'Bỏ qua',
};

export const DeliveryModeLabels: Record<DeliveryMode, string> = {
  [DeliveryMode.DoorToDoor]: 'Giao tận nhà',
  [DeliveryMode.PickupAtPoint]: 'Nhận tại điểm phát',
};

export const SupplyShortageRequestStatusLabels: Record<SupplyShortageRequestStatus, string> = {
  [SupplyShortageRequestStatus.Pending]: 'Chờ duyệt',
  [SupplyShortageRequestStatus.Approved]: 'Đã duyệt',
  [SupplyShortageRequestStatus.Fulfilled]: 'Đã cấp',
  [SupplyShortageRequestStatus.Rejected]: 'Từ chối',
  [SupplyShortageRequestStatus.Cancelled]: 'Đã hủy',
};

// ─── Response Types ──────────────────────────────────────

export interface CampaignHouseholdResponse {
  campaignHouseholdId: string;
  campaignId: string;
  locationId?: string;
  distributionPointId?: string;
  distributionPointName?: string;
  campaignTeamId?: string;
  campaignTeamName?: string;
  householdCode: string;
  headOfHouseholdName: string;
  contactPhone?: string;
  address?: string;
  latitude: number;
  longitude: number;
  householdSize: number;
  isIsolated: boolean;
  floodSeverityLevel?: number;
  isolationSeverityLevel?: number;
  requiresBoat?: boolean;
  requiresLocalGuide?: boolean;
  deliveryMode: DeliveryMode;
  fulfillmentStatus: HouseholdFulfillmentStatus;
  notes?: string;
  createdAt: string;
}

export interface DistributionPointResponse {
  distributionPointId: string;
  campaignId: string;
  reliefStationId: string;
  campaignTeamId?: string;
  campaignTeamName?: string;
  locationId?: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  deliveryMode: DeliveryMode;
  startsAt: string;
  endsAt?: string;
  isActive: boolean;
  assignedHouseholdCount: number;
  pendingDeliveryCount: number;
  totalDeliveryCount: number;
  assignedTeams: DistributionPointTeamSummaryResponse[];
}

export interface DistributionPointTeamSummaryResponse {
  campaignTeamId: string;
  campaignTeamName: string;
}

export interface HouseholdDeliveryResponse {
  householdDeliveryId: string;
  campaignId: string;
  campaignHouseholdId: string;
  distributionPointId?: string;
  distributionPointName?: string;
  campaignTeamId?: string;
  campaignTeamName?: string;
  reliefPackageDefinitionId: string;
  reliefPackageDefinitionName: string;
  deliveredByUserId?: string;
  deliveryMode: DeliveryMode;
  status: HouseholdFulfillmentStatus;
  cashSupportAmount: number;
  scheduledAt: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  proofs: HouseholdDeliveryProofResponse[];
}

export interface HouseholdChecklistItemResponse {
  householdDeliveryId: string;
  campaignId: string;
  campaignHouseholdId: string;
  householdCode: string;
  headOfHouseholdName: string;
  campaignTeamId?: string;
  campaignTeamName?: string;
  distributionPointId?: string;
  distributionPointName?: string;
  reliefPackageDefinitionId: string;
  reliefPackageDefinitionName: string;
  deliveryMode: DeliveryMode;
  status: HouseholdFulfillmentStatus;
  scheduledAt: string;
  deliveredAt?: string;
  notes?: string;
  proofCount: number;
}

export interface TeamWorklistItemResponse {
  householdDeliveryId: string;
  campaignId: string;
  campaignHouseholdId: string;
  householdCode: string;
  headOfHouseholdName: string;
  contactPhone?: string;
  address?: string;
  campaignTeamId?: string;
  campaignTeamName?: string;
  distributionPointId?: string;
  distributionPointName?: string;
  reliefPackageDefinitionId: string;
  reliefPackageDefinitionName: string;
  deliveryMode: DeliveryMode;
  status: HouseholdFulfillmentStatus;
  scheduledAt: string;
  deliveredAt?: string;
  notes?: string;
  proofCount: number;
  householdSize?: number;
  isIsolated?: boolean;
  floodSeverityLevel?: number;
  isolationSeverityLevel?: number;
  requiresBoat?: boolean;
  requiresLocalGuide?: boolean;
}

export interface MemberTaskDeliveryResponse {
  memberTaskDeliveryId: string;
  memberTaskId: string;
  campaignTaskId?: string;
  campaignId: string;
  householdDeliveryId: string;
  campaignHouseholdId?: string;
  householdCode?: string;
  headOfHouseholdName?: string;
  address?: string;
  contactPhone?: string;
  campaignTeamId?: string;
  campaignTeamName?: string;
  distributionPointId?: string;
  distributionPointName?: string;
  reliefPackageDefinitionId?: string;
  reliefPackageDefinitionName?: string;
  deliveryMode: DeliveryMode;
  status: HouseholdFulfillmentStatus;
  scheduledAt?: string;
  deliveredAt?: string;
  notes?: string;
  proofCount?: number;
  isIsolated?: boolean;
  requiresBoat?: boolean;
  requiresLocalGuide?: boolean;
  floodSeverityLevel?: number;
  isolationSeverityLevel?: number;
}

export interface HouseholdDeliveryProofResponse {
  householdDeliveryProofId: string;
  fileUrl: string;
  fileType?: string;
  note?: string;
  capturedAt: string;
  capturedByUserId?: string;
}

export interface SupplyShortageRequestResponse {
  supplyShortageRequestId: string;
  campaignId: string;
  distributionPointId?: string;
  distributionPointName?: string;
  campaignTeamId?: string;
  campaignTeamName?: string;
  requestedByUserId: string;
  requestedByUserName?: string;
  status: SupplyShortageRequestStatus;
  reason?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewNote?: string;
  items: SupplyShortageRequestItemResponse[];
}

export interface SupplyShortageRequestItemResponse {
  supplyShortageRequestItemId: string;
  supplyItemId: string;
  supplyItemName: string;
  quantityRequested: number;
  quantityApproved?: number;
  note?: string;
}

export interface ReliefPackageDefinitionResponse {
  reliefPackageDefinitionId: string;
  campaignId: string;
  outputSupplyItemId?: string;
  outputSupplyItemName?: string;
  outputUnit?: string;
  cashSupportAmount: number;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  items: ReliefPackageDefinitionItemResponse[];
}

export interface ReliefPackageDefinitionItemResponse {
  reliefPackageDefinitionItemId: string;
  supplyItemId: string;
  supplyItemName: string;
  quantity: number;
  unit?: string;
  estimatedStock?: number;
  estimatedStockUnit?: string;
}

export interface CampaignInventoryBalanceResponse {
  campaignId?: string;
  updatedAt?: string;
  items: CampaignInventoryBalanceItemResponse[];
}

export interface CampaignInventoryBalanceItemResponse {
  supplyItemId: string;
  supplyItemName: string;
  unit?: string;
  availableQuantity: number;
  reservedQuantity?: number;
  incomingQuantity?: number;
  totalQuantity?: number;
  isLowStock?: boolean;
  shortageThreshold?: number;
}

export interface BatchCompleteHouseholdDeliveryItemResponse {
  householdDeliveryId: string;
  isSuccess: boolean;
  error?: string;
  delivery?: HouseholdDeliveryResponse;
}

export interface BatchCompleteHouseholdDeliveryResponse {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  items: BatchCompleteHouseholdDeliveryItemResponse[];
}

export interface ReliefPlanAreaSummary {
  areaName: string;
  locationId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  populationDensity: number;
  householdCount: number;
  isolatedHouseholdCount: number;
  population: number;
  averageHouseholdSize: number;
  pendingHouseholds: number;
  estimatedCoverageRadiusKm: number;
  travelComplexityLabel: string;
  recommendedOperationalMode: string;
  recommendedDeliveryStrategy: string;
  suggestedDistributionPointCount: number;
  suggestedMobileTeamCount: number;
  suggestedTeamCount: number;
  estimatedPackages: number;
  estimatedBoatCount: number;
  estimatedLifeJacketCount: number;
}

export interface IsolatedHouseholdPlanItem {
  campaignHouseholdId: string;
  householdCode: string;
  headOfHouseholdName: string;
  address?: string | null;
  locationId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  householdSize: number;
  floodSeverityLevel?: number | null;
  isolationSeverityLevel?: number | null;
  requiresBoat?: boolean;
  requiresLocalGuide?: boolean;
  priorityLabel: string;
  suggestedSupportMode: string;
  estimatedReliefPersonnel: number;
  estimatedBoatCount: number;
  estimatedLifeJacketCount: number;
  campaignTeamName?: string | null;
}

export interface DistributionPointPlanSummary {
  distributionPointId: string;
  name: string;
  address?: string | null;
  assignedHouseholdCount: number;
  pendingDeliveryCount: number;
  suggestedPersonnelCount: number;
  suggestedLocalVolunteerCount: number;
}

export interface ReliefResourceRequirement {
  resourceType: string;
  resourceName: string;
  estimatedQuantity: number;
  notes?: string | null;
}

export interface ReliefCampaignPlanSummary {
  campaignId: string;
  totalHouseholds: number;
  isolatedHouseholds: number;
  totalPopulation: number;
  averagePopulationDensity: number;
  highDensityAreaCount: number;
  mobileTeamPriorityAreaCount: number;
  pickupPriorityAreaCount: number;
  distributionPointCount: number;
  pendingHouseholds: number;
  suggestedTeamCount: number;
  estimatedReliefPersonnel: number;
  estimatedLocalVolunteers: number;
  estimatedBoatCount: number;
  estimatedLifeJacketCount: number;
  areas: ReliefPlanAreaSummary[];
  isolatedHouseholdItems: IsolatedHouseholdPlanItem[];
  distributionPoints: DistributionPointPlanSummary[];
  resourceRequirements: ReliefResourceRequirement[];
}

// ─── Request Types ───────────────────────────────────────

export interface UpdateCampaignHouseholdStatusRequest {
  status: HouseholdFulfillmentStatus;
  notes?: string;
}

export interface ReportNewReliefHouseholdRequest {
  householdCode: string;
  headOfHouseholdName: string;
  contactPhone?: string;
  address?: string;
  latitude: number;
  longitude: number;
  locationId?: string;
  householdSize: number;
  isIsolated: boolean;
  floodSeverityLevel?: number;
  isolationSeverityLevel?: number;
  requiresBoat: boolean;
  requiresLocalGuide: boolean;
  notes?: string;
}

export interface CompleteHouseholdDeliveryRequest {
  reliefPackageDefinitionId?: string;
  campaignTeamId?: string;
  cashSupportAmount?: number;
  notes?: string;
  proofNote?: string;
  proofFileUrl: string;
  proofContentType?: string;
}

export interface CompleteHouseholdDeliveryProofRequest {
  fileUrl: string;
  fileType?: string;
  note?: string;
}

export interface CompleteHouseholdDeliveryBatchItemRequest {
  householdDeliveryId: string;
  reliefPackageDefinitionId?: string;
  campaignTeamId?: string;
  cashSupportAmount?: number;
  notes?: string;
  proofs: CompleteHouseholdDeliveryProofRequest[];
}

export interface CompleteHouseholdDeliveryBatchRequest {
  items: CompleteHouseholdDeliveryBatchItemRequest[];
}

export interface CompleteMemberTaskDeliveryWithDeliveryRequest {
  campaignId?: string;
  notes?: string;
  proofNote?: string;
  proofFileUrl?: string;
  proofContentType?: string;
  cashSupportAmount?: number;
}

export interface CreateSupplyShortageRequestPayload {
  distributionPointId?: string;
  campaignTeamId?: string;
  reason?: string;
  items: SupplyShortageItemRequest[];
}

export interface SupplyShortageItemRequest {
  supplyItemId: string;
  quantityRequested: number;
  note?: string;
}

// ─── Query Types ─────────────────────────────────────────

export interface HouseholdQueryRequest {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: HouseholdFulfillmentStatus;
  deliveryMode?: DeliveryMode;
  distributionPointId?: string;
  campaignTeamId?: string;
  isIsolated?: boolean;
  isAssigned?: boolean;
}

export interface DistributionPointQueryRequest {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  reliefStationId?: string;
  campaignTeamId?: string;
  isActive?: boolean;
  deliveryMode?: DeliveryMode;
}

export interface CampaignPackageQueryRequest {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface DeliveryQueryRequest {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: HouseholdFulfillmentStatus;
  campaignTeamId?: string;
  distributionPointId?: string;
  deliveryMode?: DeliveryMode;
  scheduledFrom?: string;
  scheduledTo?: string;
}

export interface TeamWorklistQueryRequest {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: HouseholdFulfillmentStatus;
  campaignTeamId?: string;
  distributionPointId?: string;
  deliveryMode?: DeliveryMode;
  scheduledFrom?: string;
  scheduledTo?: string;
}

export interface MemberTaskDeliveryQueryRequest {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: HouseholdFulfillmentStatus;
  campaignTeamId?: string;
  memberTaskId?: string;
  campaignTaskId?: string;
  distributionPointId?: string;
  deliveryMode?: DeliveryMode;
}

export interface SupplyShortageRequestQueryRequest {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  status?: SupplyShortageRequestStatus;
  distributionPointId?: string;
  campaignTeamId?: string;
  requestedByUserId?: string;
}

// ─── Paginated Response ──────────────────────────────────

export interface PaginatedResponse<T> {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  items: T[];
}
