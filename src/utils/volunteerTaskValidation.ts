import { MemberTaskStatus, type MemberTaskResponse } from '@/src/types/leaderTask';
import { HouseholdFulfillmentStatus, type CampaignHouseholdResponse } from '@/src/types/reliefDistribution';
import { VolunteerTaskCategory, classifyVolunteerTask, getVolunteerTaskCategoryLabel } from './taskClassification';

export interface VolunteerTaskValidationItem {
  key: string;
  label: string;
  passed: boolean;
  detail?: string;
}

export interface VolunteerTaskValidationResult {
  isValid: boolean;
  category: VolunteerTaskCategory;
  categoryLabel: string;
  items: VolunteerTaskValidationItem[];
  errors: string[];
}

interface ValidateTaskCompletionParams {
  task?: MemberTaskResponse | null;
  targetStatus?: MemberTaskStatus | null;
  households?: CampaignHouseholdResponse[];
  proofImageUrls?: string[];
  hasHouseholdDeliveryIds?: boolean;
}

export const getHouseholdDeliveryIdFromHousehold = (household: CampaignHouseholdResponse) => {
  const raw = (household as any)?.householdDeliveryId ?? (household as any)?.deliveryId ?? (household as any)?.currentDelivery?.householdDeliveryId;
  return raw ? String(raw) : null;
};

export const validateVolunteerTaskCompletion = ({
  task,
  targetStatus,
  households = [],
  proofImageUrls = [],
  hasHouseholdDeliveryIds = false,
}: ValidateTaskCompletionParams): VolunteerTaskValidationResult => {
  const category = classifyVolunteerTask(task);
  const categoryLabel = getVolunteerTaskCategoryLabel(category);
  const proofCount = proofImageUrls.filter((item) => !!item?.trim()).length;

  if (!task || targetStatus !== MemberTaskStatus.Completed) {
    return {
      isValid: true,
      category,
      categoryLabel,
      items: [],
      errors: [],
    };
  }

  const items: VolunteerTaskValidationItem[] = [];

  if (category === VolunteerTaskCategory.Delivery) {
    const deliveredCount = households.filter(
      (household) => household.fulfillmentStatus === HouseholdFulfillmentStatus.Delivered,
    ).length;
    const pendingCount = households.length - deliveredCount;

    items.push({
      key: 'delivery-households',
      label: 'Đã phát xong các hộ được giao',
      passed: pendingCount === 0,
      detail: households.length > 0 ? `${deliveredCount}/${households.length} hộ đã phát` : 'Chưa có hộ dân nào được tải',
    });

    items.push({
      key: 'delivery-proof',
      label: 'Có ít nhất 1 ảnh minh chứng giao hàng',
      passed: proofCount > 0,
      detail: proofCount > 0 ? `${proofCount} ảnh sẵn sàng` : 'Chưa tải ảnh minh chứng',
    });

    items.push({
      key: 'delivery-id',
      label: 'Checklist hộ dân có householdDeliveryId để complete delivery',
      passed: hasHouseholdDeliveryIds,
      detail: hasHouseholdDeliveryIds ? 'Có thể gọi complete delivery' : 'Thiếu delivery id trong dữ liệu checklist',
    });
  }

  if (category === VolunteerTaskCategory.EvidenceRequired) {
    items.push({
      key: 'evidence-proof',
      label: 'Có ảnh minh chứng cho nhiệm vụ',
      passed: proofCount > 0,
      detail: proofCount > 0 ? `${proofCount} ảnh đã tải` : 'Chưa có ảnh minh chứng',
    });
  }

  const errors = items.filter((item) => !item.passed).map((item) => item.label);

  return {
    isValid: errors.length === 0,
    category,
    categoryLabel,
    items,
    errors,
  };
};
