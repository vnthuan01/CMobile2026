import {
  MemberTaskStatus,
  type MemberTaskResponse,
} from '@/src/types/leaderTask';
import {
  HouseholdFulfillmentStatus,
  type CampaignHouseholdResponse,
} from '@/src/types/reliefDistribution';
import {
  VolunteerTaskCategory,
  classifyVolunteerTask,
  getVolunteerTaskCategoryLabel,
} from './taskClassification';

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
  hasHouseholdDeliveryIds?: boolean;
}

export const getHouseholdDeliveryIdFromHousehold = (
  household: CampaignHouseholdResponse,
) => {
  const raw =
    (household as any)?.householdDeliveryId ??
    (household as any)?.deliveryId ??
    (household as any)?.currentDelivery?.householdDeliveryId;
  return raw ? String(raw) : null;
};

export const validateVolunteerTaskCompletion = ({
  task,
  targetStatus,
  households = [],
  hasHouseholdDeliveryIds = false,
}: ValidateTaskCompletionParams): VolunteerTaskValidationResult => {
  const category = classifyVolunteerTask(task);
  const categoryLabel = getVolunteerTaskCategoryLabel(category);

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
    const resolvedCount = households.filter(
      (household) =>
        household.fulfillmentStatus === HouseholdFulfillmentStatus.Delivered ||
        household.fulfillmentStatus === HouseholdFulfillmentStatus.Skipped,
    ).length;
    const pendingCount = households.length - resolvedCount;

    items.push({
      key: 'delivery-households',
      label: 'Đã xử lý xong các hộ được giao',
      passed: pendingCount === 0,
      detail:
        households.length > 0
          ? `${resolvedCount}/${households.length} hộ đã xử lý`
          : 'Chưa có hộ dân nào được tải',
    });

    // items.push({
    //   key: 'delivery-proof',
    //   label: 'Có ít nhất 1 ảnh minh chứng giao hàng',
    //   passed: proofCount > 0,
    //   detail: proofCount > 0 ? `${proofCount} ảnh sẵn sàng` : 'Chưa tải ảnh minh chứng',
    // });

    items.push({
      key: 'delivery-id',
      label: 'Danh sách phát hàng đã có hộ dân hoàn thành phát hàng',
      passed: hasHouseholdDeliveryIds,
      detail: hasHouseholdDeliveryIds
        ? 'Có thể hoàn thành giao hàng cho hộ dân'
        : 'Thiếu mã giao hàng trong dữ liệu giao hàng cho hộ dân',
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
