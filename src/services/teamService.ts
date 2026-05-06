import api from './api';
import { extractApiErrorMessage } from '../utils/apiError';
import type {
  AssignedCampaignSummary,
  TeamDetailResponse,
  TeamMemberSummary,
  TeamMode,
  TeamTrackingHeartbeatRequest,
  TeamTrackingHeartbeatResponse,
  TeamTrackingPointResponse,
} from '../types/team';

const normalizeTeamMode = (team: any): TeamMode => {
  const rawTeamType = String(team?.teamType ?? team?.type ?? '').trim().toLowerCase();
  const assignedCampaignSources = [
    ...(Array.isArray(team?.assignedCampaigns) ? team.assignedCampaigns : []),
    ...(Array.isArray(team?.campaignTeams) ? team.campaignTeams : []),
    ...(Array.isArray(team?.teamCampaigns) ? team.teamCampaigns : []),
  ];

  const campaignTypes = assignedCampaignSources.length
    ? assignedCampaignSources.map((campaign: any) =>
        String(campaign?.campaignType ?? campaign?.type ?? '').trim().toLowerCase(),
      )
    : [];

  if (
    rawTeamType.includes('relief') ||
    rawTeamType.includes('cứu trợ') ||
    rawTeamType === '1' ||
    campaignTypes.some((type: string) => type.includes('relief') || type === '1')
  ) {
    return 'relief';
  }

  return 'rescue';
};

const normalizeAssignedCampaigns = (team: any): AssignedCampaignSummary[] => {
  const sources = [
    ...(Array.isArray(team?.assignedCampaigns) ? team.assignedCampaigns : []),
    ...(Array.isArray(team?.campaignTeams) ? team.campaignTeams : []),
    ...(Array.isArray(team?.teamCampaigns) ? team.teamCampaigns : []),
  ];

  if (sources.length === 0) return [];

  const normalized = sources.map((campaign: any) => ({
    campaignId: String(
      campaign?.campaignId ??
        campaign?.id ??
        campaign?.campaign?.campaignId ??
        campaign?.campaign?.id ??
        campaign?.campaignTeam?.campaignId ??
        campaign?.campaignTeam?.campaign?.campaignId ??
        '',
    ),
    campaignName:
      campaign?.campaignName ??
      campaign?.name ??
      campaign?.campaign?.campaignName ??
      campaign?.campaign?.name ??
      campaign?.campaignTeam?.campaignName ??
      campaign?.campaignTeam?.campaign?.campaignName ??
      null,
    campaignType:
      campaign?.campaignType ??
      campaign?.type ??
      campaign?.campaign?.campaignType ??
      campaign?.campaign?.type ??
      campaign?.campaignTeam?.campaignType ??
      campaign?.campaignTeam?.campaign?.campaignType ??
      null,
    role: campaign?.role ?? campaign?.teamRole ?? campaign?.campaignTeam?.role ?? null,
    status:
      campaign?.campaignStatus ??
      campaign?.campaign?.status ??
      campaign?.campaignTeam?.status ??
      campaign?.campaignTeam?.campaign?.status ??
      campaign?.status ??
      null,
    campaignStatus:
      campaign?.campaignStatus ??
      campaign?.campaign?.status ??
      campaign?.campaignTeam?.campaign?.status ??
      null,
    startDate:
      campaign?.startDate ??
      campaign?.campaign?.startDate ??
      campaign?.campaignTeam?.startDate ??
      campaign?.campaignTeam?.campaign?.startDate ??
      null,
    endDate:
      campaign?.endDate ??
      campaign?.campaign?.endDate ??
      campaign?.campaignTeam?.endDate ??
      campaign?.campaignTeam?.campaign?.endDate ??
      null,
  }));

  return normalized
    .filter((campaign) => campaign.campaignId)
    .reduce<AssignedCampaignSummary[]>((acc, campaign) => {
      if (acc.some((item) => item.campaignId === campaign.campaignId)) return acc;
      acc.push(campaign);
      return acc;
    }, []);
};

const normalizeTeamMembers = (team: any): TeamMemberSummary[] => {
  const sources = Array.isArray(team?.members)
    ? team.members
    : Array.isArray(team?.teamMembers)
      ? team.teamMembers
      : Array.isArray(team?.users)
        ? team.users
        : [];

  return sources
    .map((member: any) => {
      const rawUser = member?.user ?? member?.member ?? member?.profile ?? null;

      const userId = String(
        member?.userId ??
          member?.id ??
          member?.memberId ??
          member?.accountId ??
          rawUser?.userId ??
          rawUser?.id ??
          '',
      );

      const displayName =
        member?.displayName ??
        member?.fullName ??
        member?.name ??
        rawUser?.displayName ??
        rawUser?.fullName ??
        rawUser?.name ??
        'Thành viên';

      const volunteerProfileId =
        member?.volunteerProfileId ??
        member?.volunteerId ??
        member?.profileId ??
        member?.volunteerProfile?.volunteerProfileId ??
        member?.volunteerProfile?.id ??
        rawUser?.volunteerProfileId ??
        rawUser?.volunteerProfile?.volunteerProfileId ??
        rawUser?.volunteerProfile?.id ??
        null;

      return {
        userId,
        displayName,
        email: member?.email ?? rawUser?.email ?? '',
        volunteerProfileId: volunteerProfileId ? String(volunteerProfileId) : null,
        role: member?.role ?? member?.teamRole ?? rawUser?.role ?? 'Member',
        skills: Array.isArray(member?.skills)
          ? member.skills
          : Array.isArray(rawUser?.skills)
            ? rawUser.skills
            : [],
        joinedAt:
          member?.joinedAt ??
          member?.createdAt ??
          member?.joinedDate ??
          rawUser?.joinedAt ??
          new Date(0).toISOString(),
      } satisfies TeamMemberSummary;
    })
    .filter((member) => member.userId || member.volunteerProfileId || member.displayName);
};

const normalizeTeam = (team: TeamDetailResponse | null): TeamDetailResponse | null => {
  if (!team) return null;
  const normalized = team as TeamDetailResponse & Record<string, any>;
  return {
    ...normalized,
    members: normalizeTeamMembers(normalized),
    assignedCampaigns: normalizeAssignedCampaigns(normalized),
    teamMode: normalizeTeamMode(normalized),
  };
};

export type {
  TeamSkillResponse,
  TeamUserSummary,
  TeamLeaderSummary,
  TeamMemberSummary,
  TeamDetailResponse,
  TeamTrackingHeartbeatRequest,
  TeamTrackingHeartbeatResponse,
  TeamTrackingPointResponse,
} from '../types/team';

export const teamService = {
  getMyTeam: async () => {
    const routes = ['/Team/my-team', '/api/Team/my-team'];

    for (const route of routes) {
      try {
        const response = await api.get<TeamDetailResponse>(route);
        return {
          success: response.status === 200,
          data: normalizeTeam(response.data),
          message: 'Lấy thông tin team thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tải thông tin team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint Team/my-team.',
    };
  },

  sendTrackingHeartbeat: async (
    teamId: string,
    payload: TeamTrackingHeartbeatRequest,
  ) => {
    const routes = [
      `/Team/${teamId}/tracking-heartbeat`,
      `/api/Team/${teamId}/tracking-heartbeat`,
    ];

    for (const route of routes) {
      try {
        const response = await api.post<TeamTrackingHeartbeatResponse>(
          route,
          payload,
        );
        return {
          success: response.status >= 200 && response.status < 300,
          data: response.data,
          message: 'Gửi vị trí team thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể gửi vị trí team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint Team tracking-heartbeat.',
    };
  },

  getLatestTracking: async (teamId: string, limit = 100) => {
    const routes = [
      `/Team/${teamId}/tracking/latest`,
      `/api/Team/${teamId}/tracking/latest`,
    ];

    for (const route of routes) {
      try {
        const response = await api.get<TeamTrackingPointResponse[]>(route, {
          params: { limit },
        });
        return {
          success: response.status === 200,
          data: Array.isArray(response.data) ? response.data : [],
          message: 'Lấy lịch sử tracking mới nhất thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tải lịch sử tracking team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint Team tracking/latest.',
    };
  },

  getAssignedCampaigns: async (teamId: string) => {
    const routes = [
      `/Team/${teamId}/assigned-campaigns`,
      `/api/Team/${teamId}/assigned-campaigns`,
    ];

    for (const route of routes) {
      try {
        const response = await api.get<AssignedCampaignSummary[]>(route);
        const assignedCampaigns = Array.isArray(response.data)
          ? normalizeAssignedCampaigns({ assignedCampaigns: response.data })
          : [];
        return {
          success: response.status === 200,
          data: assignedCampaigns,
          message: 'Lấy danh sách chiến dịch được gán thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: [] as AssignedCampaignSummary[],
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tải danh sách chiến dịch được gán của team.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: [] as AssignedCampaignSummary[],
      status: 404,
      message: 'Không tìm thấy endpoint Team assigned-campaigns.',
    };
  },
};
