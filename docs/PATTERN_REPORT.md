# Báo cáo phân tích ticket — Tuần 5 (Ngày 1–2)

**Dữ liệu xem:** Ticket Odoo tuần 4 + 6 tình huống luyện tập tuần 4  
**Mục đích:** Tìm vấn đề hay gặp lại, chọn một loại để làm tool tự động hóa

---

## Kết luận ngắn

Sau khi xem lại các ticket tuần 4, **vấn đề không đăng nhập được LMS** là loại hay gặp nhất và mỗi lần xử lý gần như giống nhau.

Vì vậy em chọn làm tool tự động cho **tình huống đăng nhập** (Scenario 1). Code nằm trong repo `login-ticket-automation`.

---

## Em đã xem dữ liệu gì?

- Ticket đã tạo trên Odoo Helpdesk khi làm tuần 4
- 6 tình huống tuần 4: đăng nhập, LMS chậm, lỗi hệ thống, yêu cầu tính năng, nhiều người dùng, gia hạn deadline
- Email và ghi chú xử lý trong từng tình huống

**Cách em nhóm ticket:**

- Đọc tiêu đề, mô tả và tag trên Odoo
- Gom theo loại vấn đề
- Với mỗi loại: ước lượng hay gặp bao nhiêu, mất bao lâu để xử lý, có nên làm tool tự động không

---

## Các loại vấn đề hay gặp

**1. Không đăng nhập được / quên mật khẩu LMS** — khoảng 35% tổng ticket, cao nhất  
- Mất khoảng 5–10 phút mỗi ticket  
- **Đã làm tool tự động**

**2. LMS chậm, không tải được trang** — khoảng 20%  
- Mất khoảng 15–30 phút  
- Cần team Dev kiểm tra, không tự động hóa được hết

**3. Hệ thống lỗi (không nộp bài, sập hệ thống)** — khoảng 15%  
- Ít hơn nhưng ảnh hưởng nhiều người  
- Phải báo Dev xử lý gấp

**4. Yêu cầu tính năng mới** — khoảng 15%  
- Thời gian không cố định  
- Không phù hợp làm tool tự động

**5. Nhiều người / nhiều lớp cùng lúc** — khoảng 10%  
- Mỗi case khác nhau  
- Xử lý tay từng case

**6. Xin gia hạn deadline** — khoảng 5%  
- Cần người có quyền duyệt  
- Không phù hợp tự động hóa

---

## Chi tiết về vấn đề đăng nhập (loại em chọn)

**Khách thường phàn nàn:**

- Báo sai mật khẩu dù chắc mình nhập đúng
- Không vào được LMS trước giờ dạy hoặc học
- Tài khoản bị khóa vì lâu không đăng nhập

**Support hiện làm thủ công từng bước:**

- Tạo ticket, xác nhận email khách
- Hỏi HR: người này còn làm việc không?
- Hỏi LMS: tài khoản đang hoạt động hay bị khóa?
- Đặt lại mật khẩu, hoặc mở khóa rồi đặt mật khẩu mới
- Gửi email hướng dẫn, ghi chú trên ticket, đóng ticket

**Vì sao hay gặp lại:**

- Hệ thống tự khóa tài khoản nếu 30 ngày không đăng nhập
- Giáo viên không vào LMS thường xuyên nên cứ gặp lại mỗi kỳ
- Các bước xử lý giống nhau hơn 80% trường hợp

---

## Làm tool tự động thì có lợi gì?

Giả sử mỗi tháng có 10 ticket đăng nhập:

- Xử lý tay: khoảng 8 phút/ticket → tổng ~80 phút/tháng
- Có tool: support chỉ cần xem lại tag trên Odoo, khoảng 1 phút/ticket → tổng ~10 phút/tháng
- Tiết kiệm khoảng 70 phút/tháng

**Lợi ích khác:**

- Khách nhận mail nhanh hơn, không phải chờ support rảnh
- Ít sót bước (ví dụ quên kiểm tra HR trước khi mở khóa tài khoản)
- Support có thời gian xử lý các ticket khẩn hơn
- Trường hợp đặc biệt (đã nghỉ việc, email sai) vẫn được đánh dấu để xem tay

---

## Vì sao chọn đăng nhập, không chọn loại khác?

**Đăng nhập phù hợp vì:**

- Hay gặp lại
- Quy trình xử lý gần như cố định
- Đã có thể kiểm tra qua hệ thống HR và LMS
- Tool xử lý được phần lớn trường hợp

**Các loại khác không phù hợp bằng:**

- LMS chậm: cần Dev tìm nguyên nhân kỹ thuật
- Lỗi hệ thống: cần xử lý gấp, không theo quy trình cố định
- Yêu cầu tính năng: cần product xem xét

**Tự động hóa hay sửa code gốc LMS?**

- Làm tool: vài ngày, giảm tải support ngay
- Sửa rule “30 ngày không login thì khóa”: cần product đồng ý, mất vài tuần

Rule 30 ngày là quy định có chủ đích của hệ thống. Trong lúc chờ product quyết định có đổi hay không, tool tự động xử lý các case hợp lệ (người còn làm việc nhưng tài khoản bị khóa) là hướng hợp lý — đúng tinh thần Operating Engineer: giải quyết nhanh bằng quy trình, không nhất thiết sửa code gốc ngay.

---

## Em đã làm gì ở tuần 5 (ngày 3–4)?

Repo: `login-ticket-automation`

**Luồng hoạt động:**

- Support tạo ticket trên Odoo, kiểm tra xong thì chuyển sang giai đoạn “Đang xử lý”
- Odoo gửi tín hiệu cho tool
- Tool nhận biết ticket đăng nhập, kiểm tra HR và LMS
- Mở khóa hoặc đặt mật khẩu mới, gửi email, ghi chú và gắn tag trên Odoo

**Một số điểm em chú ý khi làm:**

- Chỉ chạy khi ticket sang “Đang xử lý”, tránh Odoo tự lưu nháp khi đang soạn ticket
- Khi bật lại server, tool tự quét ticket còn sót
- Case cần xem tay được gắn tag `manual-review`
- Ticket đã xử lý rồi thì không chạy lại

Chi tiết cách cài và chạy: xem `README.md`.

---

## Đề xuất giảm số ticket về sau

**Đã / đang làm:**

- Tool tự động xử lý ticket đăng nhập
- Gắn tag rõ ràng trên Odoo để support lọc nhanh
- Email mẫu tiếng Việt thống nhất

**Nên làm thêm (đề xuất):**

- Gửi email nhắc trước khi tài khoản sắp bị khóa (ngày 25–29)
- Viết bài hướng dẫn “Không đăng nhập được — tự kiểm tra trước”
- Theo dõi số ticket đăng nhập mỗi tuần trên Odoo

**Cần team khác:**

- Xem lại rule khóa tài khoản 30 ngày có phù hợp với giáo viên không
- LMS chậm: Dev kiểm tra hiệu năng
- Hệ thống nộp bài lỗi: có quy trình báo Dev và theo dõi

---

## Báo cáo trên Odoo em đã xem

- Danh sách ticket theo giai đoạn — xem ticket đang kẹt ở đâu
- Lọc theo tag — nhóm ticket login, LMS, bug
- Xem ticket theo thời gian — biết tuần nào nhiều ticket hơn


---

## Tóm lại

- Ticket đăng nhập hay gặp lại nhất, xử lý lặp đi lặp lại — phù hợp làm tool.
- Tool không thay được việc đổi quy định 30 ngày của hệ thống, nhưng giúp support đỡ tải ngay.
- Các loại khác (LMS chậm, sập hệ thống, xin tính năng) cần Dev hoặc người duyệt — không nên automate ở giai đoạn này.
- Tool đã làm xong, test qua Odoo thật và ngrok.

---

## Phụ lục: 6 tình huống tuần 4

- **01 — Đăng nhập:** Đã làm tool tự động
- **02 — LMS chậm:** Cần Dev kiểm tra
- **03 — Lỗi hệ thống khẩn:** Báo Dev ngay
- **04 — Yêu cầu tính năng:** Cần product xem
- **05 — Nhiều người dùng:** Xử lý từng case
- **06 — Gia hạn deadline:** Cần người duyệt
