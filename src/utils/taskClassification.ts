import type { MemberTaskResponse } from '@/src/types/leaderTask';

export enum VolunteerTaskCategory {
  Delivery = 'delivery',
  General = 'general',
  EvidenceRequired = 'evidence-required',
  Rescue = 'rescue',
  Survey = 'survey',
}

const DELIVERY_KEYWORDS = ['phát hàng', 'giao hàng', 'delivery', 'deliver', 'phân phát', 'trao quà'];
const RESCUE_KEYWORDS = ['cứu hộ', 'cứu nạn', 'sos', 'khẩn cấp'];
const EVIDENCE_KEYWORDS = ['minh chứng', 'bằng chứng', 'chụp ảnh', 'hình ảnh'];
const SURVEY_KEYWORDS = ['khảo sát', 'xác minh', 'ghi nhận', 'đánh giá'];

const normalizeTaskText = (task?: MemberTaskResponse | null) =>
  `${task?.subTaskTitle || ''} ${task?.taskNote || ''}`.trim().toLowerCase();

const matchesAnyKeyword = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword));

export const classifyVolunteerTask = (task?: MemberTaskResponse | null): VolunteerTaskCategory => {
  const normalized = normalizeTaskText(task);

  if (matchesAnyKeyword(normalized, DELIVERY_KEYWORDS)) {
    return VolunteerTaskCategory.Delivery;
  }

  if (matchesAnyKeyword(normalized, RESCUE_KEYWORDS)) {
    return VolunteerTaskCategory.Rescue;
  }

  if (matchesAnyKeyword(normalized, EVIDENCE_KEYWORDS)) {
    return VolunteerTaskCategory.EvidenceRequired;
  }

  if (matchesAnyKeyword(normalized, SURVEY_KEYWORDS)) {
    return VolunteerTaskCategory.Survey;
  }

  return VolunteerTaskCategory.General;
};

export const getVolunteerTaskCategoryLabel = (category: VolunteerTaskCategory) => {
  switch (category) {
    case VolunteerTaskCategory.Delivery:
      return 'Phát hàng';
    case VolunteerTaskCategory.Rescue:
      return 'Cứu hộ';
    case VolunteerTaskCategory.EvidenceRequired:
      return 'Cần minh chứng';
    case VolunteerTaskCategory.Survey:
      return 'Khảo sát';
    default:
      return 'Nhiệm vụ chung';
  }
};

export const isDeliveryTask = (task?: MemberTaskResponse | null) =>
  classifyVolunteerTask(task) === VolunteerTaskCategory.Delivery;
