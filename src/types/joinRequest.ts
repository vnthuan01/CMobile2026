export interface TeamJoinRequestItem {
  teamJoinRequestId: string;
  teamId: string;
  teamName: string;
  volunteerProfileId?: string | null;
  status: string;
  note?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TeamJoinRequestListResponse {
  data: TeamJoinRequestItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages?: number;
}

export interface CreateTeamJoinRequestPayload {
  teamId: string;
}

export interface StationJoinRequestItem {
  stationJoinRequestId: string;
  reliefStationId: string;
  reliefStationName?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  status: string;
  note?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface StationJoinRequestListResponse {
  data: StationJoinRequestItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages?: number;
}

export interface CreateStationJoinRequestPayload {
  reliefStationId: string;
}
