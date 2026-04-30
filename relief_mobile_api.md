# Relief Mobile API - Team Leader & Volunteer Guide

## Mục tiêu
- Tài liệu riêng cho luồng Mobile của nghiệp vụ cứu trợ.
- Chỉ tập trung vào 2 role dùng mobile:
  - `Team Leader`
  - `Volunteer`
- Bám theo flow backend hiện tại trong:
  - `SEP490-ReliefCare-BE/ReliefManagementSystem.API/Controllers/ReliefDistributionController.cs`
  - `SEP490-ReliefCare-BE/ReliefManagementSystem.API/Controllers/CampaignTaskController.cs`
- Bám theo handoff mới từ web Coordinator:
  - Coordinator không chỉ quản lý household nữa
  - Coordinator tạo ra `household delivery`
  - Mobile nhận việc từ `team-worklist` và `member-task-delivery`

---

## 1. Tổng quan flow Mobile

## Flow tổng thể
Luồng cứu trợ hiện tại được chia thành 3 lớp nghiệp vụ chính:

### Lớp 1 - Điều phối trên web bởi Coordinator
Coordinator dùng web để:
- import household vào campaign cứu trợ
- tạo package và distribution point
- gán household thành `delivery assignment`
- chỉnh sửa delivery nếu cần
- hoàn tất hoặc duyệt shortage request ở cấp điều phối

Đầu ra của web Coordinator là:
- một danh sách `household delivery`
- mỗi delivery đã biết hoặc có thể biết:
  - thuộc campaign nào
  - thuộc team nào
  - dùng package nào
  - pickup tại point hay door-to-door
  - scheduled time là khi nào

### Lớp 2 - Điều hành trên mobile bởi Team Leader
Team Leader không làm việc trực tiếp từ danh sách household gốc.

Team Leader bắt đầu từ:
- `team-worklist`

Sau đó Team Leader:
- xem các delivery của team
- tạo `campaign task`
- chia thành `member task`
- gán delivery vào từng `member task`
- theo dõi tiến độ thực hiện

### Lớp 3 - Thực thi trên mobile bởi Volunteer
Volunteer không cần nhìn toàn bộ worklist của team.

Volunteer chỉ cần:
- xem task của chính mình
- xem delivery của chính mình
- cập nhật trạng thái khi đi giao
- complete giao hàng bằng endpoint mobile chuyên dụng

---

## 2. Role Mobile và phạm vi trách nhiệm

## Team Leader
Team Leader trên mobile chịu trách nhiệm:
- nhận danh sách delivery mà Coordinator đã điều phối cho team
- tổ chức chuyến đi hoặc ca làm việc thành các `campaign task`
- chia người thành `member task`
- phân delivery cho từng thành viên
- theo dõi ai đang cầm delivery nào
- cập nhật trạng thái công việc khi có thay đổi ngoài thực địa
- báo thiếu hàng bằng shortage request nếu cần bổ sung

## Volunteer
Volunteer trên mobile chịu trách nhiệm:
- nhận task đã được giao
- xem delivery cụ thể mình phải đi xử lý
- cập nhật trạng thái thực hiện
- xác nhận hoàn tất giao hàng kèm proof
- báo thiếu vật tư nếu đi giao mà phát sinh thiếu hụt

---

## 3. Entry point đúng cho Mobile

## Team Leader entry point

### Endpoint
`GET /api/relief/campaigns/{campaignId}/team-worklist`

### Controller
- `ReliefDistributionController.GetTeamWorklist(...)`

### Ý nghĩa
Đây là điểm bắt đầu đúng của mobile Team Leader trong flow mới.

Không đi từ household nữa vì:
- household chỉ là dữ liệu dân cư đầu vào
- thứ Team Leader cần thao tác là delivery đã được điều phối sẵn

### Team Leader dùng dữ liệu này để biết
- team đang được giao những delivery nào
- household nào đang chờ phát
- package nào phải mang theo
- delivery là `PickupAtPoint` hay `DoorToDoor`
- thời gian dự kiến thực hiện
- trạng thái hiện tại của từng delivery

### Ý nghĩa nghiệp vụ sâu hơn
`team-worklist` là lớp cầu nối giữa:
- coordinator planning
và
- field execution

Nó là nguồn dữ liệu để Team Leader quyết định:
- gom các delivery nào thành 1 task
- chia theo khu vực nào
- giao cho volunteer nào
- task nào cần xuồng, người dẫn đường, hoặc ưu tiên trước

## Volunteer entry point

Volunteer không nên vào từ `team-worklist` như Team Leader.

Volunteer bắt đầu từ 2 endpoint cá nhân:
- `GET /api/campaigns/{campaignId}/member-tasks/me`
- `GET /api/campaigns/{campaignId}/member-task-deliveries/me`

Ý nghĩa:
- chỉ thấy đúng phần việc của mình
- tránh phải xử lý toàn bộ delivery của team

---

## 4. Chi tiết flow Team Leader trên Mobile

## Bước 1 - Xem worklist của team

### Endpoint
`GET /api/relief/campaigns/{campaignId}/team-worklist`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Mobile nên dùng như thế nào
App mobile Team Leader nên có màn hình worklist để:
- lọc danh sách delivery theo ngày hoặc trạng thái
- nhóm theo khu vực hoặc điểm phát
- nhóm theo loại delivery:
  - `PickupAtPoint`
  - `DoorToDoor`

### Mục tiêu của bước này
Đây là bước Team Leader đọc tình hình triển khai thực tế trước khi chia việc.

Ví dụ Team Leader có thể nhìn ra:
- 20 delivery pickup tại điểm phát số 1
- 8 delivery door-to-door ở khu vực ngập sâu
- 5 hộ cần xử lý sớm vì lịch gần nhất

---

## Bước 2 - Tạo campaign task cho một đợt triển khai

### Endpoint
`POST /api/campaigns/{campaignId}/tasks`

### Controller
- `CampaignTaskController.Create(...)`

### Quyền backend
- `Manager,Moderator`

### Ý nghĩa nghiệp vụ
`campaign task` là task tổng của một đợt triển khai.

Nó có thể đại diện cho:
- một chuyến phát tại một khu vực
- một ca phát ở một distribution point
- một tổ cơ động vào vùng cô lập
- một đợt xử lý các delivery ưu tiên cao

### Team Leader nên tạo task khi nào
- khi muốn gom một nhóm delivery thành 1 đợt vận hành có tổ chức
- khi cần chia người rõ ràng
- khi muốn theo dõi tiến độ ở cấp nhóm thay vì chỉ nhìn từng delivery lẻ

### Gợi ý tổ chức task trên mobile
Một task nên có logic rõ ràng theo một trong các kiểu:
- theo khu vực
- theo khung giờ
- theo phương tiện
- theo loại delivery

Ví dụ:
- `Tổ phát điểm trường tiểu học An Phu - sáng 12/10`
- `Tổ xuồng khu ven sông - ca chiều`
- `Pickup point 03 - lượt 1`

---

## Bước 3 - Xem lại danh sách task của campaign

### Endpoint
`GET /api/campaigns/{campaignId}/tasks`

### Controller
- `CampaignTaskController.GetPaged(...)`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Ý nghĩa
Màn hình này hữu ích khi Team Leader:
- muốn xem task nào đã tồn tại
- tránh tạo trùng task
- mở lại task cũ để tiếp tục phân công hoặc theo dõi

### Cách dùng thực tế
Mobile có thể cho filter theo:
- status
- thời gian
- người phụ trách
- khu vực triển khai

---

## Bước 4 - Gán thành viên vào task

### Endpoint
- `POST /api/campaigns/tasks/{campaignTaskId}/members`
- `POST /api/campaigns/tasks/{campaignTaskId}/members/bulk`

### Controller
- `CampaignTaskController.AssignMember(...)`
- `CampaignTaskController.BulkAssignMembers(...)`

### Quyền backend
- `Manager,Moderator`

### Ý nghĩa nghiệp vụ
Sau khi có `campaign task`, Team Leader tạo ra `member task` cho từng thành viên.

`member task` là lớp trung gian để biểu diễn:
- ai chịu trách nhiệm phần việc nào
- trong task tổng đó mỗi người làm nhóm delivery nào

### Dùng endpoint nào
- dùng endpoint đơn khi gán từng người một
- dùng endpoint bulk khi chốt cả đội cùng lúc

### Kết quả
Sau bước này mobile đã có danh sách `member task` để:
- giao tiếp cho volunteer
- gắn delivery cụ thể vào từng người

---

## Bước 5 - Tạo member task từ household nếu muốn chia theo cụm dân

### Endpoint
`POST /api/campaigns/tasks/{campaignTaskId}/members/from-households`

### Controller
- `CampaignTaskController.CreateMemberTasksFromHouseholds(...)`

### Quyền backend
- `Manager,Moderator`

### Ý nghĩa nghiệp vụ
Backend hỗ trợ tạo `member task` dựa trên danh sách household.

Flow này phù hợp khi Team Leader muốn chia việc theo cụm dân cư hoặc tuyến hộ trước,
rồi mới gắn deliveries chi tiết sau.

### Khi nào nên dùng
- khu vực door-to-door có cụm hộ gần nhau
- muốn chia volunteer theo tuyến đường thực địa
- muốn gom hộ thành từng cụm vận hành trước khi hoàn thiện mapping delivery

### Lưu ý
Flow này là lựa chọn hỗ trợ thêm.

Trong flow vận hành chuẩn theo delivery mới, Team Leader vẫn nên coi:
- `team-worklist`
và
- `member-task-delivery`
là lớp dữ liệu execution chính.

---

## Bước 6 - Gán deliveries vào từng member task

### Endpoint cấp task
`POST /api/campaigns/tasks/{campaignTaskId}/members/batch-from-deliveries`

### Endpoint cấp member task
`POST /api/campaigns/member-tasks/{memberTaskId}/deliveries`

### Controller
- `CampaignTaskController.BulkAssignDeliveriesToMembers(...)`
- `CampaignTaskController.AssignDeliveriesToMemberTask(...)`

### Quyền backend
- `Manager,Moderator`

### Đây là bước quan trọng nhất của flow mobile
Ở bước này Team Leader nối dữ liệu từ lớp điều phối sang lớp thực thi:

- Coordinator đã tạo `household delivery`
- Team Leader lấy các delivery đó từ `team-worklist`
- Team Leader gắn từng delivery vào `member task` của volunteer

### Ý nghĩa nghiệp vụ
Sau khi mapping xong:
- biết chính xác volunteer nào đi giao cho household nào
- biết delivery nào thuộc về task nào
- có thể theo dõi trạng thái theo từng người

### Hai cách gán

#### Cách 1 - batch từ deliveries
Phù hợp khi:
- Team Leader muốn chia nhiều delivery một lần
- hệ thống đã biết sẵn danh sách volunteer / member task nhận phần việc

#### Cách 2 - gán vào một member task cụ thể
Phù hợp khi:
- Team Leader mở chi tiết một volunteer
- muốn thêm / đổi delivery cho riêng người đó

### Gợi ý UI mobile
Màn hình này nên cho phép:
- chọn nhiều delivery từ `team-worklist`
- xem nhanh địa chỉ, loại phát, package, lịch
- gán sang một member task cụ thể
- tránh gán trùng delivery nếu backend không cho phép

---

## Bước 7 - Xem chi tiết task và delivery mapping

### Endpoint
- `GET /api/campaigns/tasks/{campaignTaskId}`
- `GET /api/campaigns/member-tasks/{memberTaskId}/deliveries`

### Controller
- `CampaignTaskController.GetById(...)`
- `CampaignTaskController.GetMemberTaskDeliveries(...)`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Ý nghĩa
Team Leader dùng để kiểm tra:
- một task hiện có những member task nào
- mỗi member task đang giữ những delivery nào
- delivery nào đã xong, delivery nào đang chờ

### Tình huống dùng thực tế
- cần xem một volunteer còn bao nhiêu điểm chưa đi
- cần điều phối lại vì một người bận hoặc bị kẹt đường
- cần rà soát delivery nào chưa có ai nhận

---

## Bước 8 - Cập nhật trạng thái trong quá trình điều hành

### Endpoint
- `PATCH /api/campaigns/member-tasks/{memberTaskId}/status`
- `PATCH /api/campaigns/member-task-deliveries/{memberTaskDeliveryId}/status`

### Controller
- `CampaignTaskController.ChangeMemberTaskStatus(...)`
- `CampaignTaskController.ChangeMemberTaskDeliveryStatus(...)`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Ý nghĩa nghiệp vụ
Team Leader có thể cập nhật hoặc theo dõi tiến độ ở 2 lớp:

#### Lớp member task
Phản ánh trạng thái phần việc của một người, ví dụ:
- chưa bắt đầu
- đang thực hiện
- đã hoàn tất
- tạm hoãn

#### Lớp member-task-delivery
Phản ánh trạng thái của từng delivery được giao cho người đó.

### Tại sao cần cả 2 lớp trạng thái
- một volunteer có thể có nhiều delivery trong cùng một member task
- không phải mọi delivery đều hoàn thành cùng lúc
- cần tách trạng thái tổng của người làm với trạng thái chi tiết của từng delivery

---

## Bước 9 - Tạo shortage request khi thiếu hàng ngoài hiện trường

### Endpoint
`POST /api/relief/campaigns/{campaignId}/shortage-requests`

### Controller
- `ReliefDistributionController.CreateShortageRequest(...)`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Ý nghĩa nghiệp vụ
Trong quá trình triển khai thực tế, Team Leader có thể báo thiếu:
- package
- vật tư
- thực phẩm
- nước uống
- tiền mặt hỗ trợ
- hoặc vật phẩm chuyên dụng khác

### Vai trò của shortage request trong mobile flow
Đây là đường ngược từ execution quay về coordination:
- mobile phát hiện thiếu
- gửi request về campaign relief
- coordinator hoặc người điều phối duyệt / từ chối ở web

---

## 5. Chi tiết flow Volunteer trên Mobile

## Bước 1 - Xem task của chính mình

### Endpoint
`GET /api/campaigns/{campaignId}/member-tasks/me`

### Controller
- `CampaignTaskController.GetMyMemberTasks(...)`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Ý nghĩa
Volunteer chỉ cần nhìn danh sách phần việc mình được giao.

### Màn hình nên hiển thị
- tên task
- mô tả phần việc
- thời gian
- trạng thái
- số delivery đã gán cho task đó

### Lợi ích
- giảm nhiễu thông tin
- volunteer không phải biết toàn bộ cấu trúc điều phối của cả team

---

## Bước 2 - Xem deliveries của chính mình

### Endpoint
`GET /api/campaigns/{campaignId}/member-task-deliveries/me`

### Controller
- `CampaignTaskController.GetMyMemberTaskDeliveries(...)`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Ý nghĩa
Đây là danh sách công việc thực địa cụ thể nhất của volunteer.

Mỗi item ở đây nên giúp volunteer biết:
- giao cho household nào
- tên chủ hộ là ai
- địa chỉ hoặc điểm phát ở đâu
- package nào cần giao
- lịch dự kiến
- trạng thái hiện tại
- có yêu cầu ghi chú hay chứng từ gì không

### Đây là nguồn dữ liệu execution chính của Volunteer
Nếu Team Leader làm ở cấp phân công,
thì Volunteer làm ở cấp xử lý delivery cụ thể.

---

## Bước 3 - Cập nhật trạng thái trong khi đang đi giao

### Endpoint
- `PATCH /api/campaigns/member-tasks/{memberTaskId}/status`
- `PATCH /api/campaigns/member-task-deliveries/{memberTaskDeliveryId}/status`

### Controller
- `CampaignTaskController.ChangeMemberTaskStatus(...)`
- `CampaignTaskController.ChangeMemberTaskDeliveryStatus(...)`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Volunteer sẽ dùng khi nào
- đã bắt đầu ca giao hàng
- đang đến khu vực phát
- chưa thể giao vì hộ vắng nhà
- có trở ngại thực địa
- đã xử lý xong một delivery nhưng chưa complete toàn bộ task

### Ý nghĩa
Cho phép hệ thống phản ánh trạng thái vận hành theo thời gian thực,
thay vì chỉ nhảy thẳng từ chưa làm sang hoàn tất.

---

## Bước 4 - Hoàn tất giao hàng kèm proof bằng flow mobile chuẩn

### Endpoint
`POST /api/campaigns/member-task-deliveries/{memberTaskDeliveryId}/complete-with-delivery`

### Controller
- `CampaignTaskController.CompleteMemberTaskDeliveryWithDelivery(...)`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Đây là endpoint complete quan trọng nhất cho mobile
Volunteer không nên complete bằng endpoint web của Coordinator nếu app đang đi theo flow task.

Endpoint đúng cho mobile là `complete-with-delivery` vì nó xử lý đồng thời:
- lớp `member-task-delivery`
- lớp `household delivery` gốc của campaign

### Ý nghĩa nghiệp vụ
Khi volunteer complete ở đây:
- nhiệm vụ delivery của volunteer được chốt hoàn tất
- delivery gốc của campaign cũng được complete đồng bộ
- proof giao hàng được ghi nhận trong cùng action

### Lợi ích
- tránh lệch trạng thái giữa mobile task và relief delivery
- tránh trường hợp volunteer báo xong nhưng campaign delivery chưa xong
- tập trung toàn bộ evidence hoàn tất vào một flow chuẩn

### Dữ liệu thường gắn với complete
Tuỳ request DTO thực tế của backend, mobile thường sẽ cần hỗ trợ:
- ghi chú hoàn tất
- proof file hoặc proof url
- proof content type
- thông tin hỗ trợ tiền mặt nếu có

### Khác biệt với web Coordinator

#### Web Coordinator
Thường dùng:
- `POST /api/relief/campaigns/{campaignId}/deliveries/{householdDeliveryId}/complete`

#### Mobile Volunteer
Thường dùng:
- `POST /api/campaigns/member-task-deliveries/{memberTaskDeliveryId}/complete-with-delivery`

### Lý do tách 2 flow complete
- web Coordinator làm việc ở lớp điều phối campaign
- mobile Volunteer làm việc ở lớp task execution cá nhân
- mobile cần đảm bảo complete xong thì task con và delivery gốc đồng bộ với nhau

---

## Bước 5 - Báo thiếu hàng nếu đang thực thi mà phát sinh thiếu hụt

### Endpoint
`POST /api/relief/campaigns/{campaignId}/shortage-requests`

### Controller
- `ReliefDistributionController.CreateShortageRequest(...)`

### Quyền backend
- `Manager,Moderator,Volunteer`

### Volunteer dùng khi nào
- đến nơi mới phát hiện số lượng hàng không đủ
- package thực tế thiếu thành phần
- thiếu tiền hỗ trợ đi kèm
- cần báo ngay cho Leader/Coordinator để xử lý bổ sung

### Giá trị của flow này
Volunteer không cần tự giải quyết mọi thiếu hụt tại hiện trường.
App mobile chỉ cần ghi nhận chuẩn shortage request để hệ thống điều phối xử lý tiếp.

---

## 6. Mapping giữa các thực thể trong flow Mobile

## Household
- là dữ liệu dân cư ban đầu
- được Coordinator import và quản lý chủ yếu trên web

## Household Delivery
- là đơn vị delivery vận hành sau khi Coordinator assign
- đây là đối tượng mà `team-worklist` và checklist bám vào

## Campaign Task
- là task tổng cho một đợt triển khai của team
- thường do Team Leader tạo để gom một nhóm delivery

## Member Task
- là phần việc giao cho một thành viên cụ thể
- giúp biết ai chịu trách nhiệm một phần delivery nào

## Member Task Delivery
- là mapping cụ thể giữa member task và delivery
- đây là đối tượng thực thi gần nhất với Volunteer

## Proof / Completion
- được ghi nhận khi volunteer hoặc người điều phối complete giao hàng
- với mobile, flow chuẩn là `complete-with-delivery`

---

## 7. Mapping flow Web -> Mobile chi tiết

## Giai đoạn A - Coordinator chuẩn bị trên web
- import household
- tạo distribution point nếu là pickup
- tạo package
- assign household sang team
- sinh ra `household delivery`

Kết quả của giai đoạn này:
- campaign đã có dữ liệu delivery sẵn cho mobile nhận việc

## Giai đoạn B - Team Leader điều hành trên mobile
- lấy `team-worklist`
- tạo `campaign task`
- tạo hoặc gán `member task`
- phân `household delivery` vào từng người qua `member-task-delivery`

Kết quả của giai đoạn này:
- mỗi volunteer biết mình cầm delivery nào

## Giai đoạn C - Volunteer thực thi trên mobile
- lấy `member-tasks/me`
- lấy `member-task-deliveries/me`
- cập nhật trạng thái khi thực hiện
- complete bằng `complete-with-delivery`

Kết quả của giai đoạn này:
- trạng thái delivery của campaign được đồng bộ hoàn tất
- proof được lưu đúng flow mobile

## Giai đoạn D - Phản hồi ngược về điều phối
- nếu thiếu hàng thì tạo `shortage request`
- request quay lại luồng review của coordinator / moderator trên web

---

## 8. Danh sách endpoint nên ưu tiên cho Team Leader Mobile

### Relief execution entry
- `GET /api/relief/campaigns/{campaignId}/team-worklist`
- `POST /api/relief/campaigns/{campaignId}/shortage-requests`

### Campaign task
- `POST /api/campaigns/{campaignId}/tasks`
- `GET /api/campaigns/{campaignId}/tasks`
- `GET /api/campaigns/tasks/{campaignTaskId}`

### Member task
- `POST /api/campaigns/tasks/{campaignTaskId}/members`
- `POST /api/campaigns/tasks/{campaignTaskId}/members/bulk`
- `POST /api/campaigns/tasks/{campaignTaskId}/members/from-households`
- `PATCH /api/campaigns/member-tasks/{memberTaskId}/status`

### Delivery mapping
- `POST /api/campaigns/tasks/{campaignTaskId}/members/batch-from-deliveries`
- `POST /api/campaigns/member-tasks/{memberTaskId}/deliveries`
- `GET /api/campaigns/member-tasks/{memberTaskId}/deliveries`
- `PATCH /api/campaigns/member-task-deliveries/{memberTaskDeliveryId}/status`

---

## 9. Danh sách endpoint nên ưu tiên cho Volunteer Mobile

### My work
- `GET /api/campaigns/{campaignId}/member-tasks/me`
- `GET /api/campaigns/{campaignId}/member-task-deliveries/me`

### Status update
- `PATCH /api/campaigns/member-tasks/{memberTaskId}/status`
- `PATCH /api/campaigns/member-task-deliveries/{memberTaskDeliveryId}/status`

### Completion
- `POST /api/campaigns/member-task-deliveries/{memberTaskDeliveryId}/complete-with-delivery`

### Shortage
- `POST /api/relief/campaigns/{campaignId}/shortage-requests`

---

## 10. Những điểm cần nhớ khi làm Mobile

## Với Team Leader
- điểm bắt đầu đúng là `team-worklist`
- không nên coi household là đơn vị execution chính
- task chỉ là lớp tổ chức công việc cho delivery
- mục tiêu cuối là mapping delivery sang đúng volunteer

## Với Volunteer
- chỉ cần nhìn dữ liệu `me`
- đơn vị làm việc gần nhất là `member-task-delivery`
- complete chuẩn phải đi qua `complete-with-delivery`

## Với cả 2 role mobile
- `shortage request` là flow phản hồi hiện trường về trung tâm điều phối
- các status update nên dùng để phản ánh tiến độ thời gian thực
- mọi thứ nên bám vào `delivery` thay vì quay lại xử lý household gốc

---

## 11. Kết luận

Flow mobile mới của cứu trợ không còn là:
- lấy household
- tự chia household
- tự complete delivery rời rạc

Flow đúng hiện tại là:
- Coordinator tạo `household delivery`
- Team Leader nhận việc từ `team-worklist`
- Team Leader tổ chức bằng `campaign task` và `member task`
- Volunteer thực thi ở lớp `member-task-delivery`
- Volunteer complete bằng `complete-with-delivery`
- shortage request quay ngược lại để web điều phối xử lý

Nói ngắn gọn:
- web lo điều phối campaign
- mobile lo tổ chức và thực thi delivery
- `delivery` là trung tâm của flow mới
