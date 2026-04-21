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

// ─── Request Types ───────────────────────────────────────

export interface UpdateCampaignHouseholdStatusRequest {
  status: HouseholdFulfillmentStatus;
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
