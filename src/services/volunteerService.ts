import type {
  CreateVolunteerRequest,
  ResubmitVolunteerProfileRequest,
  SkillResponse,
  VolunteerProfileResponse,
} from '../types/volunteer';
import { extractApiErrorMessage } from '../utils/apiError';
import api from './api';
import { uploadService } from './uploadService';

export type {
  CreateVolunteerCertificateRequest,
  CreateVolunteerRequest, ResubmitVolunteerProfileRequest, SkillResponse,
  VolunteerProfileResponse
} from '../types/volunteer';

export { TeamRolePreference } from '../types/volunteer';

const normalizeVerificationStatus = (raw: any) => {
  const normalized = String(raw ?? '')
    .trim()
    .toLowerCase();

  if (normalized === '1' || normalized === 'pending') return 'Pending';
  if (normalized === '2' || normalized === 'approved') return 'Approved';
  if (normalized === '3' || normalized === 'rejected') return 'Rejected';

  return 'Pending';
};

const normalizeVolunteerProfile = (raw: any): VolunteerProfileResponse => {
  const certificates = Array.isArray(raw?.certificates)
    ? raw.certificates.map((cert: any) => ({
        name: cert?.name || cert?.certificateName || '',
        issuedBy: cert?.issuedBy || cert?.issuer || '',
        issuedDate: cert?.issuedDate || cert?.dateIssued || '',
        expiryDate: cert?.expiryDate || cert?.expiredDate || null,
        fileUrl:
          cert?.fileUrl || cert?.url || cert?.imageUrl || cert?.fileURL || '',
      }))
    : [];

  const skills = Array.isArray(raw?.skills)
    ? raw.skills.map((skill: any) => {
        if (typeof skill === 'string') return skill;
        return skill?.skillId || skill?.id || skill?.name || skill?.code || '';
      })
    : [];

  return {
    volunteerProfileId: raw?.volunteerProfileId || raw?.id || '',
    campaignId: raw?.campaignId || raw?.campaign?.campaignId || null,
    campaignName: raw?.campaignName || raw?.campaign?.name || null,
    fullName: raw?.fullName || raw?.full_name || null,
    email: raw?.email || '',
    phoneNumber: raw?.phoneNumber || raw?.phone || null,
    descriptions: raw?.descriptions || raw?.description || '',
    verificationStatus: normalizeVerificationStatus(raw?.verificationStatus),
    volunteerStatus: raw?.volunteerStatus || null,
    reason: raw?.reason || raw?.rejectReason || null,
    yearsOfExperience: raw?.yearsOfExperience ?? raw?.experienceYears ?? null,
    preferredTeamRole:
      raw?.preferredTeamRole ??
      raw?.teamRolePreference ??
      raw?.preferredRole ??
      null,
    skills,
    certificates,
  };
};

export const volunteerService = {
  createVolunteerProfile: async (payload: CreateVolunteerRequest) => {
    const routes = ['/VolunteerProfile', '/api/VolunteerProfile'];

    for (const route of routes) {
      try {
        const response = await api.post<any>(route, payload);
        return {
          success: response.status === 200 || response.status === 201,
          data: normalizeVolunteerProfile(response.data),
          message: 'Đăng ký tình nguyện viên thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            message: extractApiErrorMessage(
              error,
              'Đăng ký tình nguyện viên thất bại',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      message:
        'Không tìm thấy endpoint VolunteerProfile. Kiểm tra lại route backend.',
    };
  },

  getAllSkills: async () => {
    const routes = [
      'Skill',
      'skill',
      '/api/Skill',
      '/api/skill',
      '/api/Skills',
      '/api/skills',
    ];

    let lastErrorMessage = 'Không thể lấy danh sách kỹ năng';

    for (const route of routes) {
      try {
        const response = await api.get<any>(route, {
          params: {
            PageIndex: 1,
            PageSize: 100,
          },
        });
        const raw = response.data;

        const rawItems = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.Items)
              ? raw.Items
            : Array.isArray(raw?.data)
              ? raw.data
              : Array.isArray(raw?.Data)
                ? raw.Data
              : Array.isArray(raw?.result?.items)
                ? raw.result.items
                : Array.isArray(raw?.Result?.items)
                  ? raw.Result.items
                : Array.isArray(raw?.result?.data)
                  ? raw.result.data
                  : Array.isArray(raw?.Result?.data)
                    ? raw.Result.data
                  : Array.isArray(raw?.result)
                    ? raw.result
                    : Array.isArray(raw?.Result)
                      ? raw.Result
                    : [];

        const normalized = rawItems
          .map((item: any) => ({
            skillId: item?.skillId ?? item?.SkillId ?? item?.id ?? item?.Id ?? '',
            code: item?.code ?? item?.Code ?? '',
            name:
              item?.name ??
              item?.Name ??
              item?.displayName ??
              item?.DisplayName ??
              item?.code ??
              item?.Code ??
              '',
            description:
              item?.description ??
              item?.Description ??
              null,
          }))
          .filter((item: SkillResponse) => Boolean(item.skillId && item.name));

        if (normalized.length === 0) {
          continue;
        }

        return {
          success: response.status === 200,
          data: normalized,
          message: 'Lấy danh sách kỹ năng thành công',
        };
      } catch (error: any) {
        if (__DEV__) {
          console.warn('[Skills] Request failed', {
            route,
            params: { PageIndex: 1, PageSize: 100 },
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
          });
        }

        lastErrorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Không thể lấy danh sách kỹ năng';
      }
    }

    return {
      success: false,
      data: [] as SkillResponse[],
      message:
        lastErrorMessage ||
        'Không thể lấy danh sách kỹ năng từ endpoint /api/Skill.',
    };
  },

  getMyVolunteerProfile: async () => {
    const routes = [
      '/VolunteerProfile/my-profile',
      '/api/VolunteerProfile/my-profile',
    ];

    for (const route of routes) {
      try {
        const response = await api.get<any>(route);
        return {
          success: response.status === 200,
          data: normalizeVolunteerProfile(response.data),
          message: 'Lấy hồ sơ volunteer thành công',
        };
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return {
            success: true,
            data: null,
            message: 'Bạn chưa có hồ sơ volunteer.',
          };
        }

        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            message: extractApiErrorMessage(
              error,
              'Không thể tải hồ sơ volunteer.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      message:
        'Không tìm thấy endpoint VolunteerProfile/my-profile. Kiểm tra lại route backend.',
    };
  },

  resubmitVolunteerProfile: async (
    payload: ResubmitVolunteerProfileRequest,
  ) => {
    const routes = [
      '/VolunteerProfile/my-profile/resubmit',
      '/api/VolunteerProfile/my-profile/resubmit',
    ];

    for (const route of routes) {
      try {
        const response = await api.put<any>(route, payload);
        return {
          success: response.status === 200,
          data: normalizeVolunteerProfile(response.data),
          message: 'Đã gửi lại hồ sơ volunteer',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            message: extractApiErrorMessage(
              error,
              'Không thể gửi lại hồ sơ volunteer.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      message:
        'Không tìm thấy endpoint VolunteerProfile/my-profile/resubmit. Kiểm tra lại route backend.',
    };
  },

  updateMyVolunteerProfile: async (
    payload: ResubmitVolunteerProfileRequest,
  ) => {
    const routes = [
      '/VolunteerProfile/my-profile',
      '/api/VolunteerProfile/my-profile',
      '/VolunteerProfile/my-profile/resubmit',
      '/api/VolunteerProfile/my-profile/resubmit',
    ];

    for (const route of routes) {
      try {
        const response = await api.put<any>(route, payload);
        return {
          success: response.status === 200,
          data: normalizeVolunteerProfile(response.data),
          message: 'Cập nhật hồ sơ volunteer thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            message: extractApiErrorMessage(
              error,
              'Không thể cập nhật hồ sơ volunteer.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      message:
        'Không tìm thấy endpoint cập nhật hồ sơ VolunteerProfile/my-profile.',
    };
  },

  uploadImageToCloudinary: uploadService.uploadImageToCloudinary,
};
