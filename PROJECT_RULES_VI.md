# Quy tắc dự án ReliefCare Mobile

## 1. Quy tắc ngôn ngữ bắt buộc

Từ thời điểm này, **toàn bộ project phải ưu tiên dùng tiếng Việt**.

Áp dụng cho:

- tên label hiển thị trên UI
- toast message
- dialog message
- empty state
- loading text
- error text
- placeholder text
- nội dung tài liệu `.md`
- comment giải thích nghiệp vụ trong code nếu cần viết comment
- commit/task note nội bộ liên quan đến project này

### Ngoại lệ được phép giữ tiếng Anh

Chỉ giữ tiếng Anh cho các phần sau:

- tên biến kỹ thuật chuẩn thư viện: `isLoading`, `queryKey`, `mutationFn`, ...
- enum / field / contract đến từ backend nếu backend định nghĩa sẵn bằng tiếng Anh
- tên API endpoint
- tên package / thư viện / framework
- tên type/interface khi cần bám backend hoặc pattern TypeScript hiện có
- các thuật ngữ kỹ thuật phổ biến không nên Việt hoá gượng ép như `hook`, `token`, `toast`, `dialog`, `map`, `route`, `query`, `mutation`

## 2. Quy tắc viết UI text

### Phải dùng tiếng Việt tự nhiên

Ví dụ đúng:

- `Không tải được dữ liệu`
- `Vui lòng thử lại`
- `Đăng nhập thành công`
- `Không thể gửi yêu cầu cứu hộ`

Ví dụ không nên dùng:

- `Error occurred`
- `Success`
- `Retry request failed`
- `Loading data...`

### Ưu tiên câu ngắn, rõ nghĩa

- ngắn
- dễ hiểu
- đúng ngữ cảnh nghiệp vụ
- tránh dịch word-by-word cứng nhắc

## 3. Quy tắc comment/code note

- Nếu comment về nghiệp vụ hoặc flow màn hình: viết **tiếng Việt**
- Nếu comment về chi tiết kỹ thuật ngắn, có thể dùng tiếng Anh khi đó là thuật ngữ chuẩn
- Hạn chế comment dư thừa; ưu tiên code rõ ràng

## 4. Quy tắc docs

Các file docs mới trong project nên viết bằng tiếng Việt:

- hướng dẫn setup
- playbook implement
- note kiến trúc
- quy ước code

Nếu cần giữ một phần tiếng Anh vì tài liệu gốc của thư viện, phải có phần giải thích tiếng Việt đi kèm.

## 5. Quy tắc cho thông báo runtime

Tất cả message trả về UI nên ưu tiên tiếng Việt:

- `showSuccessToast(...)`
- `showErrorToast(...)`
- `showInfoToast(...)`
- `showWarningToast(...)`
- `AppDialog`

Nếu backend trả message tiếng Anh, ở tầng mobile nên map về tiếng Việt khi phù hợp với UX.

## 6. Quy tắc khi thêm screen/hook/service mới

Khi làm mới:

1. Screen text phải là tiếng Việt
2. Validation message phải là tiếng Việt
3. Toast/dialog phải là tiếng Việt
4. Docs ghi lại phải là tiếng Việt
5. Không trộn nửa Việt nửa Anh trong cùng một luồng UI nếu không thật sự cần thiết

## 7. Quy tắc thực thi

Khi review hoặc sửa code cho project này:

- nếu thấy text tiếng Anh trong UI, ưu tiên đổi sang tiếng Việt
- nếu thấy docs tiếng Anh, ưu tiên Việt hoá
- nếu thấy thông báo lỗi chưa thân thiện, ưu tiên viết lại bằng tiếng Việt rõ nghĩa
