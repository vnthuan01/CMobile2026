import api from './api';
import { uploadService } from './uploadService';

export interface CreateVolunteerCertificateRequest {
  name: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string | null;
  fileUrl: string;
}

export interface CreateVolunteerRequest {
  skillIds: string[];
  descriptions: string;
  teamRolePreference: TeamRolePreference;
  yearsOfExperience?: number | null;
  certificates: CreateVolunteerCertificateRequest[];
}

export enum TeamRolePreference {
  Member = 1,
  Leader = 2,
  Driver = 3,
}

export interface SkillResponse {
  skillId: string;
  code: string;
  name: string;
  description: string | null;
}

interface CreateVolunteerProfileResponse {
  volunteerProfileId: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  descriptions: string;
  verificationStatus: string;
  yearsOfExperience?: number | null;
  skills: string[];
  certificates: CreateVolunteerCertificateRequest[];
}

const extractApiErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;

  if (!data) return error?.message || fallback;
  if (typeof data === 'string') return data;

  const detail = data.detail || data.title || data.message;
  if (detail) return detail;

  if (data.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    const firstValue = firstKey ? data.errors[firstKey] : null;
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return firstValue[0];
    }
  }

  return error?.message || fallback;
};

export const volunteerService = {
  createVolunteerProfile: async (payload: CreateVolunteerRequest) => {
    const routes = ['/VolunteerProfile', '/api/VolunteerProfile'];

    for (const route of routes) {
      try {
        const response = await api.post<CreateVolunteerProfileResponse>(
          route,
          payload,
        );
        return {
          success: response.status === 200 || response.status === 201,
          data: response.data,
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
        const response = await api.get<SkillResponse[]>(route);
        return {
          success: response.status === 200,
          data: response.data,
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
  uploadImageToCloudinary: uploadService.uploadImageToCloudinary,
};
