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

export interface VolunteerProfileResponse {
  volunteerProfileId: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  descriptions: string;
  verificationStatus: string | number;
  volunteerStatus?: string | null;
  reason?: string | null;
  yearsOfExperience?: number | null;
  preferredTeamRole?: TeamRolePreference | number | null;
  skills: Array<string | { skillId?: string; name?: string; code?: string }>;
  certificates: CreateVolunteerCertificateRequest[];
}

export interface ResubmitVolunteerProfileRequest {
  descriptions: string;
  yearsOfExperience?: number | null;
  preferredTeamRole: TeamRolePreference;
  skillIds: string[];
  certificates: CreateVolunteerCertificateRequest[];
}
