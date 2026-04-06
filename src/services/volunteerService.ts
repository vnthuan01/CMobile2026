import api from './api';
import { extractApiErrorMessage } from '../utils/apiError';
import { uploadService } from './uploadService';
import type {
  CreateVolunteerRequest,
  SkillResponse,
  VolunteerProfileResponse,
  ResubmitVolunteerProfileRequest,
} from '../types/volunteer';
import { TeamRolePreference } from '../types/volunteer';

export type {
  CreateVolunteerCertificateRequest,
  CreateVolunteerRequest,
  SkillResponse,
  VolunteerProfileResponse,
  ResubmitVolunteerProfileRequest,
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
          console.error('Create volunteer profile error:', error);
          console.error(
            'Create volunteer profile response data:',
            error?.response?.data,
          );
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
    const routes = ['/Skill', '/Skills', '/api/Skill', '/api/Skills'];

    for (const route of routes) {
      try {
        const response = await api.get(route);
        const raw = response.data;
        const normalized = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.data)
              ? raw.data
              : [];

        return {
          success: response.status === 200,
          data: normalized as SkillResponse[],
          message: 'Lấy danh sách kỹ năng thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          console.error('Get skills error:', error);
          return {
            success: false,
            data: [] as SkillResponse[],
            message:
              error.response?.data?.message ||
              error.message ||
              'Không thể lấy danh sách kỹ năng',
          };
        }
      }
    }

    return {
      success: false,
      data: [] as SkillResponse[],
      message:
        'Không tìm thấy endpoint Skills. Kiểm tra lại route backend (ví dụ: /api/Skill).',
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
  uploadImageToCloudinary: uploadService.uploadImageToCloudinary,
};
