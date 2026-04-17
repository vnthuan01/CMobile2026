# Mobile Spec - Notification Realtime qua Centrifugo

Tài liệu này dành cho **Mobile App** để tích hợp notification realtime với backend hiện tại.

Mục tiêu chính:

1. **User gửi Rescue Request** → **Moderator mobile nhận notification realtime**, có **ảnh preview** nếu request có attachment.
2. **Moderator hoặc Team cập nhật request** → **User mobile nhận notification realtime**.

---

## 1. Tổng quan luồng nghiệp vụ trên mobile

### Luồng 1 - User tạo request

- Actor: User
- Backend gửi notification tới moderator
- Notification type: `RescueRequestCreated`
- Có thể kèm ảnh preview qua `thumbnailUrls`

### Luồng 2 - Moderator verify request

- Actor: Moderator / Manager / Admin
- Backend gửi notification tới user tạo request
- Notification type: `RescueRequestVerified`

### Luồng 3 - Moderator assign team

- Actor: Moderator / Manager / Admin
- Backend gửi notification tới:
  - user tạo request
  - team members
- Notification type: `RescueRequestAssigned`

### Luồng 4 - Team cập nhật EnRoute

- Actor: Volunteer / Moderator / Manager / Admin
- Backend gửi notification tới user tạo request
- Notification type: `RescueRequestInProgress`

---

## 2. Mobile cần làm gì sau khi login

Sau khi user login thành công và có app access token:

1. gọi `GET /api/realtime/token`
2. lấy `token`, `endpoint`, `channel`
3. connect Centrifugo websocket
4. subscribe channel cá nhân của user hiện tại

---

## 3. Endpoint lấy realtime token

```http
GET /api/realtime/token
Authorization: Bearer <app-access-token>
```

### Response mẫu

```json
{
  "token": "<centrifugo-connection-token>",
  "endpoint": "wss://realtime-staging.reliefhub.info.vn/connection/websocket",
  "channel": "notifications:user:USER_ID",
  "expiresAt": "2026-04-17T10:15:00Z"
}
```

### Ghi chú theo môi trường staging hiện tại

Theo setup deploy hiện tại:

- API staging: `https://staging.reliefhub.info.vn`
- Realtime public websocket: `wss://realtime-staging.reliefhub.info.vn/connection/websocket`
- Backend publish nội bộ tới Centrifugo bằng `http://centrifugo:8000`

Mobile app **không dùng** địa chỉ nội bộ `http://centrifugo:8000`.

Mobile phải:

1. gọi API staging để lấy realtime token
2. dùng field `endpoint` backend trả về

Ví dụ:

```http
GET https://staging.reliefhub.info.vn/api/realtime/token
Authorization: Bearer <app-access-token>
```

---

## 4. Channel notification của mobile

Format channel:

```text
notifications:user:{userId}
```

Mobile chỉ subscribe đúng channel backend cấp.

Không hardcode websocket URL trong app.

App chỉ dùng:

```text
wss://realtime-staging.reliefhub.info.vn/connection/websocket
```

khi backend trả đúng field `endpoint` như vậy.

---

## 5. Payload notification mobile nhận được

```json
{
  "notificationId": "uuid",
  "recipientId": "uuid",
  "type": "RescueRequestCreated",
  "title": "Có yêu cầu cứu hộ mới",
  "message": "Rescue request mới tại trạm của bạn: 123 ABC.",
  "referenceId": "uuid-request",
  "referenceType": "RescueRequest",
  "metadataJson": "{...}",
  "metadata": {
    "schemaVersion": 1,
    "schemaName": "rescue_request_v1",
    "attachmentCount": 2,
    "thumbnailUrls": ["https://image-1", "https://image-2"]
  },
  "attachmentCount": 2,
  "thumbnailUrls": ["https://image-1", "https://image-2"],
  "isRead": false,
  "createdAt": "2026-04-17T09:40:00Z",
  "readAt": null
}
```

---

## 6. Case 1 - User gửi Request thì Moderator Mobile phải làm gì

## 6.1 Tình huống

Người dân gửi rescue request mới.

Backend sẽ gửi realtime notification cho moderator của station liên quan.

## 6.2 Moderator mobile nhận gì

- `type = RescueRequestCreated`
- `title = "Có yêu cầu cứu hộ mới"`
- `message = "Rescue request mới tại trạm của bạn: ..."`
- `referenceId = requestId`
- `thumbnailUrls` có thể chứa ảnh preview

## 6.3 Moderator mobile nên làm gì khi nhận notification

1. tăng badge unread
2. thêm notification vào list local
3. nếu app đang foreground → hiện in-app banner/toast
4. hiển thị preview ảnh nếu có `thumbnailUrls`
5. khi user tap notification → mở màn hình chi tiết rescue request theo `referenceId`

## 6.4 UI card đề xuất cho moderator mobile

- title
- message ngắn
- timestamp
- 1-3 thumbnail preview
- badge “mới” hoặc unread dot

---

## 7. Case 2 - Moderator cập nhật request thì User Mobile phải làm gì

Các luồng cập nhật hiện có cho user:

### A. Verify request

- notification type: `RescueRequestVerified`

### B. Assign team

- notification type: `RescueRequestAssigned`

## 7.1 Khi user mobile nhận `RescueRequestVerified`

Mobile nên:

1. thêm notification vào state
2. tăng unread count
3. hiện banner/toast nếu app đang mở
4. refresh màn hình request detail nếu user đang ở đúng request đó
5. update status trong màn hình lịch sử request

## 7.2 Khi user mobile nhận `RescueRequestAssigned`

Mobile nên:

1. thông báo cho user biết đã có đội được điều phối
2. cập nhật request timeline
3. nếu đang xem request detail → refetch hoặc patch local state ngay

---

## 8. Case 3 - Team cập nhật request thì User Mobile phải làm gì

Luồng realtime hiện tại rõ nhất là khi operation status chuyển sang `EnRoute`.

Notification user nhận:

- `type = RescueRequestInProgress`
- `title = "Đội cứu hộ đang di chuyển"`
- `message = "Đội cứu hộ đang trên đường đến vị trí của bạn."`

## 8.1 User mobile nên xử lý thế nào

1. show thông báo mức ưu tiên cao hơn bình thường
2. cập nhật màn hình detail/timeline
3. nếu có màn hình tracking, chuyển sang trạng thái “đang tới”
4. nếu app foreground, có thể mở bottom sheet/banner nổi bật

---

## 9. Mobile không được dùng notification realtime để xác nhận create request thành công

Khi user bấm gửi request:

- mobile phải dựa vào response API create request để xác nhận thành công
- không chờ notification realtime để biết request đã tạo xong

Realtime chỉ là kênh cập nhật trạng thái cho các bên liên quan.

---

## 10. Hành vi reconnect trên mobile

Mobile cần chú ý:

- app vào foreground → đảm bảo websocket còn sống
- nếu token realtime hết hạn → gọi lại `/api/realtime/token`
- nếu mất mạng → reconnect khi online trở lại

Ở staging, endpoint kỳ vọng là:

```text
wss://realtime-staging.reliefhub.info.vn/connection/websocket
```

Nếu app offline một thời gian, khi mở lại nên sync bằng API:

- `GET /api/notifications`
- `GET /api/notifications/unread-count`

---

## 11. Dữ liệu ảnh preview mà mobile cần xử lý

Nếu notification có ảnh đính kèm, backend sẽ trả:

- `attachmentCount`
- `thumbnailUrls`
- `metadata.thumbnailUrls`

Khuyến nghị cho mobile:

- dùng `thumbnailUrls` để hiển thị preview nhanh
- chỉ render tối đa 3 ảnh nhỏ
- khi user mở request detail thì mới load full gallery nếu cần

---

## 12. Checklist cho team Mobile

- [ ] Sau login, gọi `/api/realtime/token`
- [ ] Dùng `endpoint` backend trả về để connect websocket
- [ ] Subscribe channel cá nhân
- [ ] Khi moderator nhận `RescueRequestCreated`, render được preview ảnh
- [ ] Khi user nhận `RescueRequestVerified`, cập nhật state request
- [ ] Khi user nhận `RescueRequestAssigned`, cập nhật timeline assign team
- [ ] Khi user nhận `RescueRequestInProgress`, hiển thị trạng thái đội đang đến
- [ ] Support reconnect khi app foreground/background/network change
- [ ] Dùng API notifications để đồng bộ unread/list/read state
