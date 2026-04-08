# Design System - ReliefCare UI Color Rules

> Muc tieu: dam bao nhat quan mau sac cho toan bo thiet ke va trien khai UI ReliefCare.
>
> Nguyen tac san pham: Calm in crisis - Clear in chaos.

---

## 1) Nguyen tac bat buoc (Non-negotiable)

1. Khong dung gradient o bat ky man nao.
2. Mau do chi dung cho tinh huong khan cap/critical (SOS, Emergency Alert, muc do nghiem trong cao).
3. Dung mau theo semantic (y nghia) thay vi trang tri.
4. Uu tien nen trung tinh (trang/toi) + phan cap bang khoang cach, typography, icon.
5. Light mode la mac dinh. Dark mode phai giu semantic colors khong doi.

---

## 2) Color Tokens Chuan

## 2.1 Light Theme (Default)

### Background

- --bg-app: #FFFFFF
- --bg-secondary: #F9FAFB
- --bg-card: #FFFFFF
- --border: #E5E7EB

### Text

- --text-primary: #111827
- --text-secondary: #6B7280
- --text-disabled: #9CA3AF

---

## 2.2 Semantic Colors

### Primary (Normal actions)

- --primary: #2563EB
- --primary-dark: #1E3A8A

### Emergency (Critical only)

- --emergency: #DC2626
- --emergency-light: #EF4444

### Warning

- --warning: #F59E0B

### Success

- --success: #16A34A

---

## 2.3 Dark Theme

### Background

- --bg-app: #0F172A
- --bg-card: #1E293B
- --border: #334155

### Text

- --text-primary: #F1F5F9
- --text-secondary: #94A3B8
- --text-disabled: #64748B

### Rule quan trong

- Giu nguyen semantic colors giua Light/Dark:
  - --primary: #2563EB
  - --emergency: #DC2626
  - --warning: #F59E0B
  - --success: #16A34A

---

## 3) Functional Color Mapping (Bat buoc)

| Feature / Trang thai            | Mau bat buoc    |
| ------------------------------- | --------------- |
| SOS                             | Red (#DC2626)   |
| Emergency                       | Red (#DC2626)   |
| Relief Request                  | Amber (#F59E0B) |
| Volunteer Task / Normal Actions | Blue (#2563EB)  |
| Completed                       | Green (#16A34A) |
| Safe Area                       | Green (#16A34A) |

Khong doi mapping theo man hinh. Cung y nghia = cung mau.

---

## 4) Component Color Rules

## Buttons

- Border radius: 12px
- Primary button: nen --primary, chu trang
- SOS button: nen --emergency, kich thuoc lon, luon de thay

## Cards

- Light: nen --bg-card
- Dark: nen #1E293B
- Border: --border
- Shadow nhe, khong dung mau ruc de trang tri card

## Status/Badge

- Dung dung semantic:
  - Critical/Emergency: do
  - Warning/Pending: amber
  - Success/Done/Safe: xanh la
  - Neutral/Info: text-secondary hoac border neutral

---

## 5) Cac dieu cam

- Khong dung gradient (LinearGradient, gradient tokens, background blend).
- Khong dung mau ngoai token (hardcoded hex) cho UI chinh.
- Khong dung do cho hanh dong thuong.
- Khong doi mau semantic giua Light va Dark mode.

---

## 6) Quy trinh kiem tra truoc merge

1. Doi chieu tat ca mau moi voi token trong file nay.
2. Kiem tra man SOS va canh bao co dung do.
3. Kiem tra dark mode van giu semantic colors.
4. Tim va loai bo hardcoded hex khong nam trong token.
5. Xac nhan khong co gradient.

---

## 7) Ghi chu trien khai cho Design/Dev

- Design team: chi dung palette trong file nay khi tao Figma/components.
- Dev team: map token 1-1 vao theme constants + tailwind config.
- Neu can them mau moi: phai them vao tai lieu nay truoc, co ly do semantic ro rang.

---

Owner: Product/UI Lead
Applies to: toan bo man hinh ReliefCare Mobile
Priority: Bat buoc tuan thu
