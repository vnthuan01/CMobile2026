# Mobile Implementation Playbook

> Mục tiêu của file này: lần sau cần implement API/screen mới thì chỉ cần đọc **1 file** này là có thể bám đúng pattern hiện tại của project và làm nhanh, không lệch style.

---

## 1. Đọc file này khi nào

Dùng file này khi cần:

- thêm API mới
- implement service / hook / screen mới
- sửa flow submit / update / cancel
- hiển thị lỗi API đúng chuẩn project
- tạo màn mới đồng bộ UI/UX/theme/safe area
- refactor một màn đang làm sai pattern

Nếu cần tra **contract backend chi tiết**, đọc thêm:

- `mobile-api-guide.md`

File hiện tại tập trung vào:

- cách tổ chức code trong mobile
- flow call API chuẩn của repo này
- quy tắc hiển thị toast / dialog / error
- checklist khi tạo screen mới

---

## 2. Kiến trúc chuẩn của project

Flow chuẩn:

```text
Screen / Component
  -> Hook (React Query)
  -> Service
  -> src/services/api.ts
  -> Backend API
```

### Không làm

- không gọi `axios` trực tiếp trong screen
- không gọi `api.get/post/...` trực tiếp trong screen
- không dùng `Alert.alert()` hệ thống
- không hard-code màu nếu đã có `useTheme()`
- không bỏ qua safe area ở màn full-screen

### Luôn làm

- define type/interface trước
- service xử lý network + normalize response/error
- hook xử lý query/mutation/invalidate/toast chung
- screen chỉ lo UI, state form, điều hướng, dialog cục bộ

---

## 3. Các file nền tảng phải biết

### API client

- `src/services/api.ts`

Nơi này đã có sẵn:

- `baseURL = process.env.EXPO_PUBLIC_API_URL`
- auto gắn `Authorization`
- auto refresh token khi `401`
- retry request sau khi refresh thành công

=> Khi viết service mới, **chỉ import `api` dùng lại**, không tạo axios instance riêng.

### Theme

- `src/context/ThemeContext.tsx`

Dùng:

```ts
const { colors, isDark } = useTheme();
```

### Toast

- `src/utils/toast.ts`
- `src/components/common/AppToast.tsx`

Dùng:

```ts
showSuccessToast(title, message)
showErrorToast(title, message)
showInfoToast(title, message)
showWarningToast(title, message)
```

### API toast presenter chung

- `src/utils/apiToast.ts`

Dùng khi xử lý lỗi/thành công từ mutation/service:

```ts
showApiErrorToast(error, {
  errorTitle: 'Không thể cập nhật',
  errorMessage: 'Không thể cập nhật dữ liệu.',
});

showApiResultToast(result, {
  successTitle: 'Cập nhật thành công',
  errorTitle: 'Cập nhật thất bại',
});
```

### Dialog

- `src/components/common/AppDialog.tsx`

Dùng khi:

- cần user xác nhận hành động
- submit thành công và muốn hỏi user đi tiếp đâu
- cần modal message đẹp hơn toast

Có thể dùng hook:

```ts
const { dialogProps, showDialog, hideDialog } = useDialog();
```

Rồi render:

```tsx
<AppDialog {...dialogProps} />
```

---

## 4. Quy tắc call API chuẩn

## 4.1 Bước 1: tạo type

Tạo file type trong:

- `src/types/<domain>.ts`

Ví dụ:

```ts
export interface UpdateExamplePayload {
  name: string;
}

export interface ExampleResponse {
  id: string;
  name: string;
}
```

Nguyên tắc:

- bám đúng backend contract
- nếu backend trả enum/int/string thì map đúng thực tế
- nếu field có thể `null`, phải ghi rõ `| null`
- đừng “đoán” response

---

## 4.2 Bước 2: tạo service

Tạo file hoặc thêm function vào:

- `src/services/<domain>Service.ts`

Pattern chuẩn:

```ts
import api from './api';
import { extractApiErrorMessage } from '../utils/apiError';

export const exampleService = {
  update: async (payload: UpdateExamplePayload) => {
    try {
      const response = await api.put<ExampleResponse>('/Example', payload);

      return {
        success: true,
        data: response.data,
        message: 'Cập nhật thành công',
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: extractApiErrorMessage(error, 'Cập nhật thất bại'),
      };
    }
  },
};
```

### Rule service

- service chịu trách nhiệm network
- service map message lỗi bằng `extractApiErrorMessage`
- service có thể trả object dạng:

```ts
{ success: boolean; data?: T | null; message?: string | null }
```

- với endpoint chỉ `throw` lỗi tự nhiên cũng được, nhưng phải nhất quán với hook đang dùng

---

## 4.3 Bước 3: tạo hook

Tạo file:

- `src/hooks/use<Thing>.ts`

### Query pattern

```ts
export function useExamples(enabled = true) {
  return useQuery({
    queryKey: ['examples'],
    queryFn: () => exampleService.getAll(),
    enabled,
    select: (result) => ({
      items: result.success ? (result.data ?? []) : [],
      errorMessage: result.success ? null : (result.message ?? null),
    }),
  });
}
```

### Mutation pattern

```ts
export function useUpdateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateExamplePayload) => exampleService.update(payload),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ['examples'] });
      }

      showApiResultToast(result, {
        successTitle: 'Cập nhật thành công',
        errorTitle: 'Cập nhật thất bại',
      });
    },
    onError: (error) => {
      showApiErrorToast(error, {
        errorTitle: 'Cập nhật thất bại',
      });
    },
  });
}
```

### Rule hook

- hook quản lý cache/invalidate/refetch
- hook là nơi tốt nhất để toast hóa mutation chung
- screen không nên tự duplicate cùng một thông báo success/error nếu hook đã làm rồi

---

## 4.4 Bước 4: nối vào screen

Screen chỉ nên lo:

- form state
- local validation
- loading/disabled state
- dialog confirm/navigate
- render UI

Ví dụ:

```ts
const mutation = useUpdateExample();

const handleSubmit = () => {
  if (!name.trim()) {
    showWarningToast('Thiếu thông tin', 'Vui lòng nhập tên');
    return;
  }

  mutation.mutate({ name: name.trim() });
};
```

---

## 5. Quy tắc hiển thị lỗi/thành công

## 5.1 Khi nào dùng toast

Dùng **toast** cho:

- validation fail đơn giản
- lỗi API
- network timeout
- submit thành công nhưng không cần user quyết định gì thêm
- các thao tác ngắn: save, update, upload, cancel

Ví dụ:

- thiếu input
- upload ảnh thất bại
- cập nhật thành công
- không lấy được dữ liệu

## 5.2 Khi nào dùng AppDialog

Dùng **AppDialog** cho:

- cần xác nhận trước khi làm hành động quan trọng
- sau khi thành công, user cần chọn bước tiếp theo
- thông báo cần rõ ràng hơn toast

Ví dụ:

- xác nhận đổi mật khẩu
- đăng nhập thành công -> vào app?
- gửi OTP thành công -> sang màn nhập OTP?

## 5.3 Không dùng `Alert.alert`

Project này đã chuẩn hóa sang:

- `toast`
- `AppDialog`

=> Không dùng `Alert.alert()` nữa.

---

## 6. Quy tắc safe area

Hiện project đã có:

- `SafeAreaProvider` ở `app/_layout.tsx`
- `SafeAreaView` root cho `left/right`

### Khi tạo màn full-screen mới

Nếu là màn auth hoặc màn tràn full chiều dọc, bọc:

```tsx
<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
  ...
</SafeAreaView>
```

### Khi có footer/sticky button

Dùng:

```ts
const { bottom } = useSafeAreaInsets();
```

Rồi cộng vào `paddingBottom`.

### Khi có custom header

Ưu tiên dùng component chung:

- `src/components/common/ScreenHeader.tsx`

Vì component này đã xử lý safe area top.

---

## 7. Quy tắc UI đồng bộ project

### Luôn dùng theme

Không hard-code màu khi có thể dùng:

- `colors.primary`
- `colors.background`
- `colors.card`
- `colors.text`
- `colors.textSecondary`
- `colors.border`
- `colors.error`
- `colors.success`
- `colors.info`
- `colors.warning`

### Ưu tiên component chung nếu có

Tìm trước trong:

- `src/components/common/`

Ví dụ hiện có:

- `ScreenHeader`
- `AppDialog`
- `AppToast`
- `StickyFooterButton`
- `AppBottomSheet`

### NativeWind

Project đang dùng `className` kiểu tailwind qua NativeWind.

Rule thực tế:

- layout/spacing đơn giản -> dùng `className`
- màu động theo theme -> dùng `style`
- đừng cố nhồi mọi thứ vào `className` nếu màu/phần tử phụ thuộc `colors`

---

## 8. Checklist khi tạo API mới

1. Xác nhận endpoint/backend contract trong `mobile-api-guide.md`
2. Tạo/update type ở `src/types`
3. Tạo/update service ở `src/services`
4. Map lỗi bằng `extractApiErrorMessage`
5. Tạo hook query/mutation ở `src/hooks`
6. Nếu mutation -> thêm `onSuccess/onError`
7. Invalidate query liên quan
8. Screen chỉ consume hook, không gọi `api` trực tiếp
9. Validation lỗi -> `showWarningToast` / `showErrorToast`
10. Success -> toast hoặc AppDialog tùy flow
11. Kiểm tra safe area
12. Chạy type-check

Lệnh verify:

```bash
npx tsc --noEmit --skipLibCheck
```

---

## 9. Checklist khi tạo screen mới

1. Xác định màn này thuộc:
   - auth
   - tab screen
   - nested stack screen
2. Chọn wrapper phù hợp:
   - `SafeAreaView`
   - `ScreenHeader`
   - `ScrollView`
3. Lấy `colors` từ `useTheme()`
4. Nếu có submit -> dùng hook mutation
5. Nếu có action quan trọng -> dùng `AppDialog`
6. Nếu có validation/error -> dùng toast
7. Nếu có sticky footer -> cộng `bottom inset`
8. Nếu có loading -> disable button + ActivityIndicator
9. Nếu màn có map/upload/list dynamic -> handle empty/loading/error state rõ ràng
10. Chạy type-check

---

## 10. Pattern chuẩn cho một feature mới

Ví dụ thêm feature `example`:

```text
src/types/example.ts
src/services/exampleService.ts
src/hooks/useExample.ts
src/components/example/ExampleScreen.tsx
app/... route file nếu cần
```

### Trình tự làm nhanh

1. Đọc endpoint ở `mobile-api-guide.md`
2. Define type
3. Implement service
4. Implement hook
5. Implement screen
6. Gắn toast/dialog
7. Verify

---

## 11. Những lỗi dễ lặp lại cần tránh

### Sai

- dùng `Alert.alert`
- screen tự gọi `api.post()`
- mutation thành công nhưng không invalidate query
- bắt lỗi bằng `error.message || ...` ở mọi nơi, không qua helper
- hard-code màu đỏ/xanh thay vì `colors.error`, `colors.success`
- quên safe area top ở auth screen
- quên `paddingBottom` cho footer/sticky button

### Đúng

- dùng `showErrorToast`, `showWarningToast`, `showSuccessToast`
- dùng `showApiErrorToast`, `showApiResultToast` ở hook/service flow
- dùng `AppDialog` cho confirm/success-step
- bám `useTheme()`
- bám `ScreenHeader` / component chung nếu có

---

## 12. Quy ước áp dụng hiện tại của project

Sau đợt chuẩn hóa gần nhất, project đang theo quy ước:

- lỗi API/validation: **toast**, không alert hệ thống
- action thành công: **toast** hoặc **AppDialog** tùy ngữ cảnh
- auth screen chính: có **safe area top**
- layout root: có **safe area left/right**
- mutation phổ biến: đã bắt đầu chuẩn hóa qua `apiToast.ts`

=> Khi làm mới, **đừng quay lại pattern cũ**.

---

## 13. Nếu lần sau cần “quét docs 1 phát ăn ngay”

Thứ tự đọc tối ưu:

1. `MOBILE_IMPLEMENTATION_PLAYBOOK.md` ← đọc file này trước
2. `mobile-api-guide.md` ← khi cần endpoint/backend contract
3. Mở file cùng domain gần nhất để copy pattern

Ví dụ:

- auth -> xem `src/services/authService.ts` + `app/(auth)/*`
- volunteer -> xem `src/services/volunteerService.ts` + `src/components/profile/RegisterVolunteerScreen.tsx`
- rescue -> xem `src/services/rescueService.ts` + `src/components/user/RequestRescueScreen.tsx`
- mutation toast pattern -> xem `src/hooks/useUserProfile.ts`, `src/hooks/useStationJoinRequests.ts`

---

## 14. TL;DR cực ngắn

Nếu chỉ nhớ 8 dòng này:

1. Screen không gọi API trực tiếp
2. Dùng `type -> service -> hook -> screen`
3. Service dùng `api.ts`
4. Error message map qua `extractApiErrorMessage`
5. Error/validation dùng toast
6. Confirm/success-step dùng `AppDialog`
7. Màn mới phải kiểm tra safe area
8. Verify bằng `npx tsc --noEmit --skipLibCheck`
