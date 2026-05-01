export interface AssignedVehicle {
  vehicleId: string;
  vehicleName?: string | null;
  vehicleLicensePlate?: string | null;
  isPrimary: boolean;
}

export enum VehicleStatus {
  Free = 0,
  Busy = 1,
  Maintenance = 2,
  Disabled = 3,
}

export enum VehicleAssignmentStatus {
  Pending = 0,
  Approved = 1,
  InTransit = 2,
  OnSite = 3,
  Returning = 4,
  Completed = 5,
  Cancelled = 6,
}

export interface CampaignAssignedVehicle {
  campaignVehicleId: string;
  vehicleId: string;
  licensePlate: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  campaignTeamId?: string | null;
  campaignTeamName?: string | null;
  assignedDriverId?: string | null;
  driverName?: string | null;
  reliefStationId?: string | null;
  currentVehicleStatus: VehicleStatus;
  status: VehicleAssignmentStatus;
  startDate: string;
  endDate?: string | null;
  note?: string | null;
}

export interface UpdateCampaignVehicleAssignmentRequest {
  campaignTeamId?: string;
  assignedDriverId?: string | null;
  startDate?: string;
  endDate?: string | null;
  status?: VehicleAssignmentStatus;
  note?: string | null;
}

export interface AssignCampaignVehicleDriverRequest {
  assignedDriverId: string;
  note?: string | null;
}

export interface ReleaseCampaignVehicleRequest {
  note?: string | null;
}

export interface HandoffCampaignVehicleRequest {
  toVolunteerProfileId: string;
  note?: string | null;
}

export interface ReturnCampaignVehicleToCoordinatorRequest {
  note?: string | null;
}

export const VehicleAssignmentStatusLabels: Record<
  VehicleAssignmentStatus,
  string
> = {
  [VehicleAssignmentStatus.Pending]: 'Chờ điều phối',
  [VehicleAssignmentStatus.Approved]: 'Sẵn sàng để điều phối',
  [VehicleAssignmentStatus.InTransit]: 'Đang di chuyển',
  [VehicleAssignmentStatus.OnSite]: 'Đang thực địa',
  [VehicleAssignmentStatus.Returning]: 'Đang quay về',
  [VehicleAssignmentStatus.Completed]: 'Đã trả điều phối',
  [VehicleAssignmentStatus.Cancelled]: 'Đã hủy',
};

export const VehicleStatusLabels: Record<VehicleStatus, string> = {
  [VehicleStatus.Free]: 'Rảnh',
  [VehicleStatus.Busy]: 'Đang bận',
  [VehicleStatus.Maintenance]: 'Bảo trì',
  [VehicleStatus.Disabled]: 'Ngưng sử dụng',
};
