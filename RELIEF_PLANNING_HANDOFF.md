# Relief Planning Handoff - Mobile

## Mục tiêu nghiệp vụ
Thêm UI kế hoạch cứu trợ để nhóm trưởng và đội cứu trợ nhìn được:
- tổng quan chiến dịch cứu trợ
- khu vực cần hỗ trợ
- hộ bị cô lập
- điểm phát hàng
- nhân lực / vật lực / thiết bị dự kiến
- số đội cần
- sau đó điều hướng sang phân công và thực thi

---

## File hiện có quan trọng

### Team leader
- `src/components/teamleader/DashboardTeamLeaderScreen.tsx`
- `src/components/teamleader/AllocateTaskScreen.tsx`
- `src/components/teamleader/ReportProgressTeamLeaderScreen.tsx`

### Volunteer / relief
- `src/components/volunteer/ReliefTasksScreen.tsx`
- `src/components/volunteer/ProgressForReliefScreen.tsx`
- `src/components/volunteer/InventorySection.tsx`

---

## Hiện trạng UI

### Đã có
- chọn campaign
- xem task của team
- phân công task
- xem điểm phát
- phát hàng theo checklist
- inventory / shortage request

### Chưa có
- tab hoặc màn hình kế hoạch cứu trợ
- summary hộ cô lập
- dự báo theo khu vực
- nhu cầu nhân lực / vật lực / thiết bị
- deep link gán người / gán việc từ context kế hoạch

---

## Hướng làm phù hợp nhất

## Phase 1 - Thêm section/tab Kế hoạch trong relief flow hiện tại
Ưu tiên sửa:

### 1. `src/components/volunteer/ReliefTasksScreen.tsx`
Đây là hub tốt nhất vì đang có:
- tasks
- points
- inventory
- households

### Nên thêm
- tab mới: `plan`
- hoặc section `Kế hoạch cứu trợ`

### Tab plan nên hiển thị
- tổng số hộ
- số hộ cô lập
- số khu vực
- số điểm phát
- số đội gợi ý
- nhân lực dự kiến
- TNV địa phương dự kiến
- xuồng dự kiến
- áo phao dự kiến

### Ngoài ra nên có 3 block
1. `Hộ cô lập ưu tiên`
2. `Điểm phát hàng`
3. `Nhu cầu nguồn lực`

---

## Component mới nên tạo

### `src/components/volunteer/ReliefPlanSection.tsx`
Component chính để hiển thị plan summary.

### Props đề xuất
```ts
type ReliefPlanSectionProps = {
  summary?: ReliefCampaignPlanSummary | null;
  isLoading?: boolean;
  onOpenAllocateTask?: () => void;
  onOpenProgress?: (distributionPointId: string) => void;
};
```

### Bên trong gồm các phần nhỏ
- `PlanSummaryCards`
- `IsolatedHouseholdsList`
- `DistributionPointPlanList`
- `ResourceRequirementList`

Nếu muốn gọn hơn có thể gom tất cả vào 1 file trước.

---

## Type nên thêm
Trong `src/types/reliefDistribution.ts` thêm:

```ts
export interface ReliefPlanAreaSummary {
  areaName: string;
  locationId?: string | null;
  householdCount: number;
  isolatedHouseholdCount: number;
  population: number;
  pendingHouseholds: number;
  suggestedTeamCount: number;
  estimatedPackages: number;
  estimatedBoatCount: number;
  estimatedLifeJacketCount: number;
}

export interface IsolatedHouseholdPlanItem {
  campaignHouseholdId: string;
  householdCode: string;
  headOfHouseholdName: string;
  address?: string | null;
  locationId?: string | null;
  householdSize: number;
  priorityLabel: string;
  suggestedSupportMode: string;
  estimatedReliefPersonnel: number;
  estimatedBoatCount: number;
  estimatedLifeJacketCount: number;
  campaignTeamName?: string | null;
}

export interface DistributionPointPlanSummary {
  distributionPointId: string;
  name: string;
  address?: string | null;
  assignedHouseholdCount: number;
  pendingDeliveryCount: number;
  suggestedPersonnelCount: number;
  suggestedLocalVolunteerCount: number;
}

export interface ReliefResourceRequirement {
  resourceType: string;
  resourceName: string;
  estimatedQuantity: number;
  notes?: string | null;
}

export interface ReliefCampaignPlanSummary {
  campaignId: string;
  totalHouseholds: number;
  isolatedHouseholds: number;
  totalPopulation: number;
  distributionPointCount: number;
  pendingHouseholds: number;
  suggestedTeamCount: number;
  estimatedReliefPersonnel: number;
  estimatedLocalVolunteers: number;
  estimatedBoatCount: number;
  estimatedLifeJacketCount: number;
  areas: ReliefPlanAreaSummary[];
  isolatedHouseholdsList: IsolatedHouseholdPlanItem[];
  distributionPoints: DistributionPointPlanSummary[];
  resourceRequirements: ReliefResourceRequirement[];
}
```

Lưu ý: nếu backend trả key `isolatedHouseholds` cho count thì tránh trùng tên với list. Có thể map ở layer hook sang `isolatedHouseholdsList`.

---

## Hook nên thêm
Trong `src/hooks/useReliefDistribution.ts` thêm hook:

```ts
export function useCampaignPlanSummary(campaignId?: string | null) {
  // GET /api/relief/campaigns/{campaignId}/plan-summary
}
```

### Nếu backend chưa xong
Cho phép fallback:
- nếu API fail thì trả `null`
- UI vẫn render section ở trạng thái “chưa có dữ liệu kế hoạch”

---

## Sửa `ReliefTasksScreen.tsx`

### Hiện tại
`activeTab` là:

```ts
'tasks' | 'points' | 'inventory'
```

### Nên đổi thành
```ts
'tasks' | 'plan' | 'points' | 'inventory'
```

### Thêm dữ liệu
- gọi `useCampaignPlanSummary(campaignId)` khi `teamMode === 'relief'`

### Quick stats nên ưu tiên hiển thị thêm
- hộ cô lập
- số đội gợi ý
- xuồng cần
- áo phao cần

### Nút hành động
- `Phân công từ kế hoạch`
- `Xem tiến độ điểm phát`

---

## Sửa `AllocateTaskScreen.tsx`
Mục tiêu: nhận context từ kế hoạch.

### Nên hỗ trợ params
- `campaignId`
- `areaName`
- `distributionPointId`
- `distributionPointName`
- `source=relief-plan`

### Ứng dụng
- tự điền title gợi ý
- tự điền description gợi ý

Ví dụ title:
- `Hỗ trợ hộ cô lập - Khu vực A`
- `Điều phối phát hàng - Điểm phát P1`

Không cần sửa quá lớn, chỉ cần prefill form là đủ tốt cho Phase 1.

---

## Sửa `ProgressForReliefScreen.tsx`
Nên thêm context plan ở đầu màn:
- điểm phát đang xử lý
- số hộ kế hoạch
- số hộ còn lại
- nhân lực dự kiến
- thiếu nguồn lực gì

Mục tiêu là nối `plan -> execution`.

---

## Sửa `DashboardTeamLeaderScreen.tsx`
Nên thêm card:
- `Kế hoạch cứu trợ`

Hiển thị nhanh:
- hộ cô lập
- số đội cần
- số điểm phát
- số khu vực

CTA:
- `Mở kế hoạch`

---

## Nếu muốn tạo màn riêng cho leader
Có thể tạo thêm:

### `src/components/teamleader/ReliefPlanScreen.tsx`
Nhưng đây là bước sau.

Phase 1 nên ưu tiên nhúng vào `ReliefTasksScreen.tsx` để đi nhanh hơn.

---

## UI blocks đề xuất cho tab kế hoạch

## 1. Summary cards
- Tổng hộ
- Hộ cô lập
- Điểm phát
- Số đội gợi ý
- Nhân lực dự kiến
- Xuồng / áo phao

## 2. Danh sách khu vực
Mỗi item:
- tên khu vực
- số hộ
- số hộ cô lập
- dân số
- số đội gợi ý

## 3. Danh sách hộ cô lập
Mỗi item:
- mã hộ / chủ hộ
- địa chỉ
- số người
- mức ưu tiên
- cách hỗ trợ gợi ý
- đội đang phụ trách

## 4. Danh sách điểm phát
Mỗi item:
- tên điểm
- số hộ được gán
- số hộ chưa phát
- nhân sự gợi ý
- nút mở tiến độ

## 5. Nhu cầu nguồn lực
Mỗi item:
- loại nguồn lực
- tên
- số lượng ước tính

---

## Fallback nếu backend chưa xong
Nếu endpoint `plan-summary` chưa có:
- render box thông báo: `Chưa có dữ liệu kế hoạch cứu trợ`
- vẫn cho người dùng vào tab `tasks`, `points`, `inventory`
- có thể tính nhanh local từ households/distributionPoints nếu cần

Ví dụ fallback local:
- tổng hộ = households.length
- hộ cô lập = households.filter(x => x.isIsolated).length
- số điểm phát = distributionPoints.length
- số đội gợi ý = Math.ceil(households.length / 50)

---

## Thứ tự làm nên ưu tiên khi quay lại
1. Thêm type `ReliefCampaignPlanSummary`
2. Thêm hook `useCampaignPlanSummary`
3. Tạo `ReliefPlanSection.tsx`
4. Cắm tab `plan` vào `ReliefTasksScreen.tsx`
5. Prefill `AllocateTaskScreen.tsx` từ context kế hoạch
6. Nếu còn thời gian mới thêm leader dashboard card

---

## Kết quả tối thiểu mong muốn của mobile
Người dùng vào flow cứu trợ sẽ nhìn thấy:
- số hộ cần hỗ trợ
- bao nhiêu hộ cô lập
- khu vực nào nặng nhất
- cần bao nhiêu đội / xuồng / áo phao
- điểm phát nào đang phải xử lý
- từ đó bấm sang phân công hoặc tiến độ
