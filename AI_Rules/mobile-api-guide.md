# Tài liệu tích hợp API cho Mobile

> Ghi chú: project này là **React Native/Expo app viết bằng TypeScript**.
>
> Dấu hiệu trực tiếp trong repo:
>
> - có `tsconfig.json`
> - có file `.ts`, `.tsx`
> - có `expo-env.d.ts`, `nativewind-env.d.ts`
> - code hiện tại dùng `interface`, `type`, generic như `api.get<T>()`
>
> Vì vậy phần tài liệu dùng `interface/type` là đang bám đúng codebase hiện tại, không phải tài liệu cho React web thuần.

## Phạm vi

Tài liệu này tổng hợp từ:

- Backend: `SEP490-ReliefCare-BE/ReliefManagementSystem.API`
- Mobile: `CMobile2026`

Mục tiêu:

- Map các API cần cho 3 role: `user`, `volunteer`, `team leader`
- Tổng hợp enum, request/response quan trọng, format JSON cần biết
- Hướng dẫn cách triển khai theo pattern hiện tại của mobile: `interface -> service -> hook -> screen`
- Chỉ ra các API còn thiếu/chưa map đủ ở mobile hiện tại

---

## 1. Pattern hiện tại của mobile

Codebase mobile đang đi theo flow:

1. `src/types/<domain>.ts`: định nghĩa interface/type
2. `src/services/<domain>Service.ts`: gọi API, normalize dữ liệu, xử lý lỗi
3. `src/hooks/use<Thing>.ts`: dùng React Query để query/mutation
4. `app/*` hoặc screen/component: consume hook

Các file gốc đang dùng:

- API client: `src/services/api.ts`
- Auth store: `src/store/authStore.ts`
- Auth workflow: `src/services/authService.ts`
- Rescue service: `src/services/rescueService.ts`
- Volunteer service: `src/services/volunteerService.ts`
- Query setup: `src/lib/queryClient.ts`

### Flow chuẩn nên dùng

```text
Screen / Feature
  -> Hook (React Query)
  -> Service
  -> api.ts (Axios + interceptor)
  -> Backend API
```

### Nguyên tắc triển khai

- **Interface** giữ contract request/response rõ ràng theo backend
- **Service** chỉ xử lý network, normalize data, map error message
- **Hook** quản lý cache/query/mutation/invalidate
- **Screen** không gọi `api` trực tiếp

---

## 2. Shared API client đang có

File: `Capstone_Mobile_SP_2025/src/services/api.ts`

Hiện đã có sẵn:

- `baseURL = process.env.EXPO_PUBLIC_API_URL`
- tự gắn `Authorization: Bearer <token>`
- interceptor refresh token khi gặp `401`
- retry request sau khi refresh thành công

### Cách dùng

Tất cả service nên import chung:

```ts
import api from './api';
```

Không tạo axios client riêng cho từng module.

---

## 3. Auth và session

Luồng auth hiện tại:

- `authStore.ts` giữ `accessToken`, `refreshToken`, `user`
- `authService.ts` xử lý login/logout/restore/refresh
- `api.ts` tự inject bearer token và auto refresh

### Kết luận triển khai

Khi thêm API mới có auth:

- chỉ cần gọi qua `api.get/post/put/patch/delete`
- không cần tự set bearer token ở từng service

---

## 4. Enum backend mobile cần biết

## 4.1 Rescue

### RescueRequestType

```ts
export enum RescueRequestType {
  Normal = 0,
  Emergency = 1,
}
```

### DisasterType

```ts
export enum DisasterType {
  Flood = 0,
  Landslide = 1,
  Earthquake = 2,
  Fire = 3,
  Storm = 4,
  Other = 5,
}
```

> Mobile hiện tại mới khai báo `0 | 1 | 2` trong `src/types/rescue.ts`, cần mở rộng đủ `Fire`, `Storm`, `Other`.

### RescueRequestStatus

```ts
export enum RescueRequestStatus {
  Pending = 0,
  Verified = 1,
  Assigned = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
}
```

### RescueOperationStatus

```ts
export enum RescueOperationStatus {
  Pending = 0,
  Assigned = 1,
  EnRoute = 2,
  Rescuing = 3,
  RescueCompleted = 4,
  Returning = 5,
  Closed = 6,
  Cancelled = 7,
}
```

### RescuePriorityLevel

```ts
export enum RescuePriorityLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}
```

## 4.2 Volunteer / Team

### VerificationStatus

```ts
export enum VerificationStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}
```

### TeamRolePreference

```ts
export enum TeamRolePreference {
  Member = 1,
  Leader = 2,
  Driver = 3,
}
```

### TeamRole

```ts
export enum TeamRole {
  Leader = 1,
  Member = 2,
}
```

### TeamStatus

```ts
export enum TeamStatus {
  Draft = 0,
  Active = 1,
  Inactive = 2,
  Suspended = 3,
  Archived = 4,
}
```

### TeamTrackingSource

```ts
export enum TeamTrackingSource {
  MobileGps = 1,
  DeviceNetwork = 2,
  Manual = 3,
  System = 4,
}
```

### TeamJoinRequestStatus

```ts
export enum TeamJoinRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
}
```

### StationJoinRequestStatus

```ts
export enum StationJoinRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
}
```

---

## 5. JSON/response pattern backend

## 5.1 AuthResponse

```json
{
  "userId": "guid",
  "accessToken": "jwt",
  "refreshToken": "refresh-token",
  "accessTokenExpires": "2026-04-06T12:00:00Z",
  "message": "optional",
  "resetToken": "optional"
}
```

## 5.2 UserProfileResponse

```json
{
  "id": "guid",
  "displayName": "Nguyen Van A",
  "email": "user@example.com",
  "phoneNumber": "0901234567",
  "address": "123 Street",
  "dateOfBirth": "2000-01-01T00:00:00",
  "gender": "Male",
  "pictureUrl": "https://...",
  "banReason": null,
  "isBanned": false,
  "lockoutEnd": null,
  "roles": ["User", "Volunteer"]
}
```

## 5.3 Paginated response mẫu cho rescue request

```json
{
  "data": [],
  "totalCount": 25,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 3,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

## 5.4 Error response thực tế

Backend đang không hoàn toàn đồng nhất. Có 2 kiểu chính:

### Kiểu 1

```json
{
  "statusCode": 400,
  "message": "...",
  "traceId": "..."
}
```

### Kiểu 2

```json
{
  "message": "..."
}
```

### Khuyến nghị mobile

Viết helper lấy message theo thứ tự:

1. `error.response?.data?.message`
2. `error.message`
3. fallback text cố định

---

## 6. Quy ước phân tầng code khi thêm API mới

Ví dụ thêm module `team join request`.

## 6.1 Interface

Tạo file hoặc bổ sung vào `src/types/team.ts`:

```ts
export interface CreateTeamJoinRequestPayload {
  teamId: string;
}

export interface TeamJoinRequestItem {
  teamJoinRequestId: string;
  teamId: string;
  teamName: string;
  status: string | number;
  createdAt: string;
}

export interface TeamJoinRequestListResponse {
  data: TeamJoinRequestItem[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
```

## 6.2 Service

Tạo hoặc bổ sung vào `src/services/teamService.ts`:

```ts
import api from './api';
import type {
  CreateTeamJoinRequestPayload,
  TeamJoinRequestListResponse,
} from '../types/team';

export const teamService = {
  createJoinRequest: async (payload: CreateTeamJoinRequestPayload) => {
    const res = await api.post('/TeamJoinRequest', payload);
    return res.data;
  },

  getMyJoinRequests: async (params?: {
    pageIndex?: number;
    pageSize?: number;
  }) => {
    const res = await api.get<TeamJoinRequestListResponse>(
      '/TeamJoinRequest/my-requests',
      { params },
    );
    return res.data;
  },
};
```

## 6.3 Hook query

Tạo `src/hooks/useMyTeamJoinRequests.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';

export const teamJoinRequestKeys = {
  all: ['teamJoinRequests'] as const,
  myList: (pageIndex: number, pageSize: number) =>
    [...teamJoinRequestKeys.all, 'myList', { pageIndex, pageSize }] as const,
};

export function useMyTeamJoinRequests(pageIndex = 1, pageSize = 10) {
  return useQuery({
    queryKey: teamJoinRequestKeys.myList(pageIndex, pageSize),
    queryFn: () => teamService.getMyJoinRequests({ pageIndex, pageSize }),
  });
}
```

## 6.4 Hook mutation

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/teamService';

export function useCreateTeamJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teamService.createJoinRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamJoinRequests'] });
    },
  });
}
```

## 6.5 Screen consume hook

```ts
const { data, isLoading, refetch } = useMyTeamJoinRequests();
const createMutation = useCreateTeamJoinRequest();
```

---

## 7. API ưu tiên cho role User

## 7.1 Auth / hồ sơ

### 1. Login

- `POST /api/auth/login`
- Auth: public

Request:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response: `AuthResponse`

### 2. Refresh token

- `POST /api/auth/refresh-token`
- Auth: public

### 3. Get profile

- `GET /api/user/profile`
- Auth: required

### 4. Update profile

- `PUT /api/user/profile`
- Auth: required
- Binding backend: `FromForm`

Payload thực tế hiện tại nên gửi dạng field text:

```ts
export interface UpdateUserProfilePayload {
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  pictureUrl?: string;
  picturePublicId?: string;
}
```

> Lưu ý: backend đang dùng `[FromForm]` nhưng DTO chưa có `IFormFile`, tức là mobile hiện nên upload ảnh lên nơi khác trước rồi gửi `pictureUrl`.

## 7.2 Rescue request

### 5. Tạo rescue request

- `POST /api/rescueRequest`
- Auth: public hoặc có token đều gọi được

Request mẫu:

```json
{
  "rescueType": 1,
  "disasterType": 0,
  "description": "Family trapped on second floor",
  "latitude": 10.123,
  "longitude": 106.456,
  "accuracy": 15.5,
  "address": "123 Riverside",
  "note": "Need boat access",
  "reporterFullName": "Nguyen A",
  "reporterPhone": "0901234567",
  "attachments": [
    {
      "fileUrl": "https://cdn.example.com/rescue/1.jpg",
      "contentType": "image/jpeg"
    }
  ],
  "selectedPriorityCriteriaIds": ["guid"]
}
```

### 6. Danh sách rescue request của tôi

- `GET /api/rescueRequest/my-requests`
- Query:
  - `pageNumber`
  - `pageSize`
  - `statusFilter`

### 7. Chi tiết rescue request

- `GET /api/rescueRequest/{id}`

### 8. Hủy rescue request

- `PATCH /api/rescueRequest/{id}/cancel`

Request:

```json
{
  "reason": "Issue resolved already"
}
```

### 9. Xem vị trí team đang cứu hộ

- `GET /api/rescueRequest/{id}/team-location`

Response mẫu:

```json
{
  "teamId": "guid",
  "teamName": "Team Alpha",
  "operationStatus": "EnRoute",
  "currentLatitude": 10.12,
  "currentLongitude": 106.45,
  "lastTrackedAt": "2026-04-06T12:00:00Z",
  "estimatedMinutesToArrival": 8,
  "distanceKmToVictim": 2.1
}
```

## 7.3 Common data

### 10. Location

- `GET /api/location/regions`
- `GET /api/location/provinces`
- `GET /api/location/communes`
- `GET /api/location/regions/{regionId}/provinces`
- `GET /api/location/provinces/{provinceId}/communes`
- `GET /api/location/tree`
- `GET /api/location/search?path=...`

### 11. Skills

- `GET /api/skill`
- `GET /api/skill/{id}`

---

## 8. API ưu tiên cho role Volunteer

## 8.1 Volunteer profile

### 1. Tạo volunteer profile

- `POST /api/volunteerProfile`

Payload chính:

```ts
export interface CreateVolunteerRequest {
  skillIds: string[];
  descriptions: string;
  yearsOfExperience: number;
  preferredTeamRole: number;
  certificates: {
    name: string;
    issuedBy: string;
    issuedDate: string;
    expiryDate?: string | null;
    fileUrl: string;
  }[];
}
```

### 2. Lấy hồ sơ volunteer của tôi

- `GET /api/volunteerProfile/my-profile`

### 3. Resubmit hồ sơ bị reject

- `PUT /api/volunteerProfile/my-profile/resubmit`

### 4. Danh sách skills

- `GET /api/volunteerProfile/skills`
- `POST /api/volunteerProfile/skills`
- `DELETE /api/volunteerProfile/skills`

## 8.2 Team / join team

### 5. Lấy team của tôi

- `GET /api/team/my-team`
- Auth role: `Volunteer`

### 6. Tạo request join team

- `POST /api/teamJoinRequest`

### 7. Danh sách request join team của tôi

- `GET /api/teamJoinRequest/my-requests`
- Query:
  - `pageIndex`
  - `pageSize`

### 8. Hủy request join team

- `PATCH /api/teamJoinRequest/{id}/cancel`

## 8.3 Rescue operation

### 9. Lấy active batch của team

- `GET /api/rescueRequest/teams/{teamId}/active-batch`

### 10. Cập nhật trạng thái operation

- `PATCH /api/rescueRequest/{id}/operations/{operationId}/status`

Request:

```json
{
  "status": 2,
  "note": "On the way"
}
```

### 11. Hoàn tất operation

- `POST /api/rescueRequest/{id}/operations/{operationId}/complete`

Request:

```json
{
  "attachments": [
    {
      "fileUrl": "https://cdn.example.com/complete/1.jpg",
      "contentType": "image/jpeg"
    }
  ],
  "note": "Victim transferred successfully"
}
```

### 12. Gửi tracking heartbeat

- `POST /api/team/{id}/tracking-heartbeat`

Request:

```json
{
  "latitude": 10.12,
  "longitude": 106.45,
  "accuracyMeters": 10,
  "speedKph": 24,
  "headingDegree": 120,
  "source": 1,
  "capturedAtUtc": "2026-04-06T12:00:00Z",
  "rescueBatchId": "guid",
  "rescueOperationId": "guid",
  "note": "moving to victim"
}
```

### 13. Lấy tracking mới nhất

- `GET /api/team/{id}/tracking/latest?limit=100`

---

## 9. API ưu tiên cho role Team Leader

Trong backend hiện tại, `team leader` chưa là role auth riêng; thường vẫn auth bằng `Volunteer`, còn phân quyền leader nằm ở domain/team role.

## 9.1 Các API cần dùng

### 1. Lấy team của tôi

- `GET /api/team/my-team`

### 2. Gửi tracking team

- `POST /api/team/{id}/tracking-heartbeat`

### 3. Lấy active batch

- `GET /api/rescueRequest/teams/{teamId}/active-batch`

### 4. Update operation status

- `PATCH /api/rescueRequest/{id}/operations/{operationId}/status`

### 5. Complete operation

- `POST /api/rescueRequest/{id}/operations/{operationId}/complete`

### 6. Tạo request join station

- `POST /api/stationJoinRequest`

### 7. Danh sách request join station của tôi

- `GET /api/stationJoinRequest/my-requests`
- Query:
  - `pageIndex`
  - `pageSize`

### 8. Hủy request join station

- `PATCH /api/stationJoinRequest/{id}/cancel`

### 9. Lịch sử rescue của team

- `GET /api/rescueRequest/teams/{teamId}/history`

---

## 10. Các API mobile hiện đang có tương đối đầy đủ

Từ code mobile hiện tại:

### Đã có service/hook hoặc đã map phần lớn

- Auth cơ bản
- Submit rescue request
- My rescue requests
- Rescue request detail
- Team location for rescue request
- My volunteer profile
- My team
- Active batch
- Upload ảnh qua Cloudinary trước khi gửi URL lên backend

---

## 11. Các API còn thiếu hoặc nên bổ sung ở mobile

## 11.1 User

- `GET /api/user/profile`
- `PUT /api/user/profile`
- `PATCH /api/rescueRequest/{id}/cancel`
- `GET /api/location/*`
- `GET /api/skill`

## 11.2 Volunteer

- `POST /api/volunteerProfile`
- `PUT /api/volunteerProfile/my-profile/resubmit`
- `POST /api/volunteerProfile/skills`
- `DELETE /api/volunteerProfile/skills`
- `POST /api/teamJoinRequest`
- `GET /api/teamJoinRequest/my-requests`
- `PATCH /api/teamJoinRequest/{id}/cancel`
- `POST /api/team/{id}/tracking-heartbeat`
- `GET /api/team/{id}/tracking/latest`
- `PATCH /api/rescueRequest/{id}/operations/{operationId}/status`
- `POST /api/rescueRequest/{id}/operations/{operationId}/complete`
- `GET /api/rescueRequest/teams/{teamId}/history`

## 11.3 Team leader

- `POST /api/stationJoinRequest`
- `GET /api/stationJoinRequest/my-requests`
- `PATCH /api/stationJoinRequest/{id}/cancel`

---

## 12. Các lưu ý quan trọng khi call API

## 12.1 Route casing

Backend dùng ASP.NET route theo controller token, ví dụ:

- `/api/Auth/login`
- `/api/VolunteerProfile/my-profile`
- `/api/RescueRequest/my-requests`

Nhưng route thực tế không phân biệt hoa thường. Mobile nên thống nhất 1 kiểu, ví dụ:

- `/Auth/login`
- `/VolunteerProfile/my-profile`
- `/RescueRequest/my-requests`

hoặc full `/api/...` nếu `EXPO_PUBLIC_API_URL` không bao gồm prefix `api`.

> Quan trọng: kiểm tra `EXPO_PUBLIC_API_URL` đang là base nào để tránh lặp `/api/api/...`.

## 12.2 Pagination không đồng nhất

Có endpoint dùng:

- `pageNumber`, `pageSize`

Có endpoint dùng:

- `pageIndex`, `pageSize`

Không nên viết một type pagination duy nhất rồi áp cứng cho mọi API.

## 12.3 Upload file

Các flow rescue hiện tại **không upload file trực tiếp vào backend**.

Flow đúng:

1. Upload ảnh/video lên Cloudinary hoặc storage khác
2. Lấy `fileUrl`
3. Gửi `fileUrl + contentType` lên backend

Áp dụng cho:

- tạo rescue request
- complete rescue operation
- volunteer certificates
- update user profile avatar qua `pictureUrl`

## 12.4 Error normalize

Nên có helper dùng chung kiểu:

```ts
export function extractApiErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback;
}
```

## 12.5 Team leader không phải auth role riêng

UI của team leader nên dựa vào:

- role `Volunteer`
- cộng thêm dữ liệu `teamRole = Leader`

Không nên assume backend có `[Authorize(Roles = "TeamLeader")]`.

---

## 13. Đề xuất cấu trúc file khi bổ sung API còn thiếu

```text
src/
  hooks/
    useUserProfile.ts
    useUpdateUserProfile.ts
    useMyTeamJoinRequests.ts
    useCreateTeamJoinRequest.ts
    useStationJoinRequests.ts
    useTeamTracking.ts
    useRescueOperation.ts

  services/
    userService.ts
    teamJoinRequestService.ts
    stationJoinRequestService.ts
    trackingService.ts

  types/
    user.ts
    teamJoinRequest.ts
    stationJoinRequest.ts
    tracking.ts
```

---

## 14. Mẫu chuẩn để thêm một API mới

## Bước 1: define interface

```ts
export interface CancelRescueRequestPayload {
  reason: string;
}
```

## Bước 2: add service

```ts
export async function cancelRescueRequest(
  requestId: string,
  payload: CancelRescueRequestPayload,
) {
  const res = await api.patch(`/RescueRequest/${requestId}/cancel`, payload);
  return res.data;
}
```

## Bước 3: add hook mutation

```ts
export function useCancelRescueRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: CancelRescueRequestPayload;
    }) => cancelRescueRequest(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescueRequests'] });
    },
  });
}
```

## Bước 4: consume trong screen

```ts
const cancelMutation = useCancelRescueRequest();

cancelMutation.mutate({
  requestId,
  payload: { reason: 'Issue resolved already' },
});
```

---

## 15. Checklist khi implement API mới

- [ ] Xác nhận đúng route với `EXPO_PUBLIC_API_URL`
- [ ] Xác nhận endpoint dùng `pageNumber` hay `pageIndex`
- [ ] Xác nhận request là JSON, form-data hay query
- [ ] Tạo interface request/response riêng
- [ ] Service chỉ gọi API và normalize
- [ ] Hook quản lý cache/invalidate
- [ ] Screen không gọi `api` trực tiếp
- [ ] Nếu có media: upload trước, gửi URL sau
- [ ] Bọc message lỗi bằng helper thống nhất

---

## 16. Gợi ý ưu tiên implement tiếp

Ưu tiên cao nhất nên làm tiếp ở mobile:

1. `userService` + hook cho `profile`
2. cancel rescue request
3. location/skill master data
4. team join request flow
5. station join request flow cho leader
6. tracking heartbeat + tracking latest
7. complete rescue operation + update operation status

---

## 17. Ghi chú cuối

- Backend có SignalR endpoint: `/hubs/notifications` nhưng hub hiện chưa thấy contract event rõ ràng cho mobile.
- Một số service mobile hiện đang thử nhiều route fallback (`/X` và `/api/X`). Nếu backend đã ổn định, nên chuẩn hóa còn 1 route style duy nhất.
- `src/types/rescue.ts` hiện chưa map đủ enum backend, đặc biệt `DisasterType`.
