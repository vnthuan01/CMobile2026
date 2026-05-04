// Campaign Task Status enum (matches backend)
export enum CampaignTaskStatus {
  Planned = 0,
  InProgress = 1,
  Blocked = 2,
  Completed = 3,
  Cancelled = 4,
}

// Task Priority enum (matches backend)
export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

// Member Task Status enum (matches backend)
export enum MemberTaskStatus {
  Assigned = 0,
  InProgress = 1,
  Completed = 2,
  Failed = 3,
  Cancelled = 4,
}

// Request DTOs
export interface CreateCampaignTaskRequest {
  campaignTeamId: string;
  title: string;
  description?: string;
  startDate: string;
  dueDate?: string;
  priority: TaskPriority;
}

export interface UpdateCampaignTaskRequest {
  title: string;
  description?: string;
  startDate: string;
  dueDate?: string;
  priority: TaskPriority;
}

export interface ChangeCampaignTaskStatusRequest {
  status: CampaignTaskStatus;
}

export interface AssignMemberTaskRequest {
  volunteerProfileId: string;
  subTaskTitle: string;
  taskNote?: string;
}

export interface BulkAssignMembersTaskRequest {
  members: AssignMemberTaskRequest[];
}

export interface ChangeMemberTaskStatusRequest {
  status: MemberTaskStatus;
}

// Response DTOs
export interface CampaignTaskResponse {
  campaignTaskId: string;
  campaignId: string;
  campaignTeamId: string;
  campaignTeamName: string;
  title: string;
  description?: string;
  startDate: string;
  dueDate?: string;
  status: CampaignTaskStatus;
  priority: TaskPriority;
  createdBy: string;
  createdAt: string;
}

export interface MemberTaskResponse {
  memberTaskId: string;
  campaignTaskId: string;
  volunteerProfileId: string;
  volunteerName: string;
  subTaskTitle: string;
  taskNote?: string;
  assignedAt: string;
  completedAt?: string;
  status: MemberTaskStatus;
}

export interface CampaignTaskDetailResponse extends CampaignTaskResponse {
  memberTaskCount: number;
  completedMemberTaskCount: number;
  memberTasks: MemberTaskResponse[];
}

// Campaign Team Response (for campaignTeamId lookup)
export interface CampaignTeamResponse {
  campaignTeamId: string;
  teamId: string;
  teamName: string;
  campaignId: string;
  campaignName: string;
  teamRole: string;
  status: number;
}

// Helper types for query parameters
export interface GetCampaignTasksQuery {
  pageIndex?: number;
  pageSize?: number;
  status?: CampaignTaskStatus;
  campaignTeamId?: string;
}

export interface GetMyMemberTasksQuery {
  pageIndex?: number;
  pageSize?: number;
  status?: MemberTaskStatus;
  campaignTeamId?: string;
}

export interface MyMemberTaskResponse {
  memberTaskId: string;
  campaignTaskId: string;
  campaignId: string;
  campaignTeamId: string;
  campaignTeamName: string;
  campaignTaskTitle: string;
  campaignTaskDescription?: string;
  startDate: string;
  dueDate?: string;
  campaignTaskStatus: CampaignTaskStatus;
  priority: TaskPriority;
  volunteerProfileId: string;
  volunteerName: string;
  subTaskTitle: string;
  taskNote?: string;
  assignedAt: string;
  completedAt?: string;
  status: MemberTaskStatus;
  deliveries?: {
    memberTaskDeliveryId: string;
    memberTaskId: string;
    householdDeliveryId: string;
    campaignHouseholdId: string;
    householdCode: string;
    headOfHouseholdName: string;
    address?: string;
    assignedVolunteerProfileId?: string;
    assignedVolunteerName?: string;
    status: MemberTaskStatus;
    deliveryStatus: number;
    scheduledAt: string;
    completedAt?: string;
    note?: string;
  }[];
}

// Status label mapping
export const CampaignTaskStatusLabels: Record<CampaignTaskStatus, string> = {
  [CampaignTaskStatus.Planned]: 'Kế hoạch',
  [CampaignTaskStatus.InProgress]: 'Đang thực hiện',
  [CampaignTaskStatus.Blocked]: 'Bị chặn',
  [CampaignTaskStatus.Completed]: 'Hoàn thành',
  [CampaignTaskStatus.Cancelled]: 'Đã hủy',
};

export const TaskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'Thấp',
  [TaskPriority.Medium]: 'Trung bình',
  [TaskPriority.High]: 'Cao',
  [TaskPriority.Critical]: 'Khẩn cấp',
};

export const MemberTaskStatusLabels: Record<MemberTaskStatus, string> = {
  [MemberTaskStatus.Assigned]: 'Đã giao',
  [MemberTaskStatus.InProgress]: 'Đang làm',
  [MemberTaskStatus.Completed]: 'Hoàn thành',
  [MemberTaskStatus.Failed]: 'Thất bại',
  [MemberTaskStatus.Cancelled]: 'Đã hủy',
};
