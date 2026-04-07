# README FIRST — ReliefCare UI Color Rules

> Mục tiêu: đảm bảo **nhất quán màu sắc** cho toàn bộ thiết kế và triển khai UI ReliefCare.
>
> Nguyên tắc sản phẩm: **Calm in crisis – Clear in chaos**.

---

## 1) Nguyên tắc bắt buộc (Non-negotiable)

1. **Không dùng gradient** ở bất kỳ màn nào.
2. **Màu đỏ chỉ dùng cho tình huống khẩn cấp/critical** (SOS, Emergency Alert, mức độ nghiêm trọng cao).
3. Dùng **màu theo semantic** (ý nghĩa) thay vì trang trí.
4. Ưu tiên nền trung tính (trắng/tối) + phân cấp bằng khoảng cách, typography, icon.
5. Light mode là mặc định. Dark mode phải giữ semantic colors không đổi.

---

## 2) Color Tokens Chuẩn

## 2.1 Light Theme (Default)

### Background
- `--bg-app`: `#FFFFFF`
- `--bg-secondary`: `#F9FAFB`
- `--bg-card`: `#FFFFFF`
- `--border`: `#E5E7EB`

### Text
- `--text-primary`: `#111827`
- `--text-secondary`: `#6B7280`
- `--text-disabled`: `#9CA3AF`

---

## 2.2 Semantic Colors

### Primary (Normal actions)
- `--primary`: `#2563EB`
- `--primary-dark`: `#1E3A8A`

### Emergency (Critical only)
- `--emergency`: `#DC2626`
- `--emergency-light`: `#EF4444`

### Warning
- `--warning`: `#F59E0B`

### Success
- `--success`: `#16A34A`

---

## 2.3 Dark Theme

### Background
- `--bg-app`: `#0F172A`
- `--bg-card`: `#1E293B`
- `--border`: `#334155`

### Text
- `--text-primary`: `#F1F5F9`
- `--text-secondary`: `#94A3B8`
- `--text-disabled`: `#64748B`

### Rule quan trọng
- **Giữ nguyên semantic colors** giữa Light/Dark:
  - `--primary`: `#2563EB`
  - `--emergency`: `#DC2626`
  - `--warning`: `#F59E0B`
  - `--success`: `#16A34A`

---

## 3) Functional Color Mapping (Bắt buộc)

| Feature / Trạng thái | Màu bắt buộc |
|---|---|
| SOS | Red (`#DC2626`) |
| Emergency | Red (`#DC2626`) |
| Relief Request | Amber (`#F59E0B`) |
| Volunteer Task / Normal Actions | Blue (`#2563EB`) |
| Completed | Green (`#16A34A`) |
| Safe Area | Green (`#16A34A`) |

> Không đổi mapping theo màn hình. Cùng ý nghĩa = cùng màu.

---

## 4) Component Color Rules

## Buttons
- Border radius: `12px`
- Primary button: nền `--primary`, chữ trắng
- SOS button: nền `--emergency`, kích thước lớn, luôn dễ thấy

## Cards
- Light: nền `--bg-card`
- Dark: nền `#1E293B`
- Border: `--border`
- Shadow nhẹ, không dùng màu rực để trang trí card

## Status/Badge
- Dùng đúng semantic:
  - Critical/Emergency: đỏ
  - Warning/Pending: amber
  - Success/Done/Safe: xanh lá
  - Neutral/Info: text-secondary hoặc border neutral

---

## 5) Các điều cấm

- ❌ Không dùng gradient (`LinearGradient`, gradient tokens, background blend).
- ❌ Không dùng màu ngoài token (hardcoded hex) cho UI chính.
- ❌ Không dùng đỏ cho hành động thường.
- ❌ Không đổi màu semantic giữa Light và Dark mode.

---

## 6) Quy trình kiểm tra trước merge

1. Đối chiếu tất cả màu mới với token trong file này.
2. Kiểm tra màn SOS và cảnh báo có đúng đỏ.
3. Kiểm tra dark mode vẫn giữ semantic colors.
4. Tìm và loại bỏ hardcoded hex không nằm trong token.
5. Xác nhận không có gradient.

---

## 7) Ghi chú triển khai cho Design/Dev

- Design team: chỉ dùng palette trong file này khi tạo Figma/components.
- Dev team: map token 1-1 vào theme constants + tailwind config.
- Nếu cần thêm màu mới: phải thêm vào tài liệu này trước, có lý do semantic rõ ràng.

---

**Owner:** Product/UI Lead  
**Applies to:** toàn bộ màn hình ReliefCare Mobile  
**Priority:** Bắt buộc tuân thủ
