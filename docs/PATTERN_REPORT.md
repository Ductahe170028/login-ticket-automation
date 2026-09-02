# Phân tích ticket và lý do làm tool xử lý đăng nhập

---

## Kết luận

Tuần 4 có **6 tình huống**, mỗi tình huống một loại vấn đề khác nhau — không phải 6 ticket cùng kiểu.

Em so sánh 6 loại đó và chọn **đăng nhập LMS** để làm tool, vì loại này có quy trình xử lý lặp lại, kiểm tra được qua HR và LMS, và tool xử lý được phần lớn trường hợp.

Em đã làm tool tự động, tích hợp với Odoo Helpdesk. Repo: `login-ticket-automation`.

---

## Em đã làm gì?

**Bước 1 — Xem lại 6 tình huống tuần 4**

Em mở lại ticket trên Odoo và đối chiếu với 6 scenario tuần 4. Với mỗi loại, em xem:

- Khách phàn nàn gì
- Support phải làm những bước nào
- Mất khoảng bao lâu
- Có nên làm tool tự động không

**Bước 2 — Chọn vấn đề đăng nhập**

Sau khi so sánh, ticket đăng nhập phù hợp nhất để automate.

**Bước 3 — Làm tool và nối Odoo**

Tool nhận tín hiệu từ Odoo, kiểm tra HR/LMS, mở khóa hoặc đặt mật khẩu mới, gửi mail, ghi chú và gắn tag trên ticket.

---

## 6 loại vấn đề tuần 4 (mỗi loại một tình huống)

**01 — Không đăng nhập được / quên mật khẩu**  
- Xử lý tay mất khoảng 5–10 phút  
- Quy trình lặp lại, kiểm tra được qua HR và LMS  
- **Em đã làm tool cho loại này**

**02 — LMS chậm, không tải trang**  
- Xử lý tay mất khoảng 15–30 phút  
- Cần Dev Team tìm nguyên nhân, không automate được hết

**03 — Hệ thống lỗi (không nộp bài, sập hệ thống)**  
- Ảnh hưởng nhiều người, xử lý gấp  
- Phải báo Dev Team

**04 — Yêu cầu tính năng mới**  
- Mỗi case khác nhau  
- Cần product xem xét

**05 — Nhiều người / nhiều lớp cùng lúc**  
- Phức tạp, xử lý tay từng case

**06 — Xin gia hạn deadline**  
- Cần người có quyền duyệt

---

## Vì sao chọn đăng nhập, không chọn 5 loại còn lại?

**Bản chất vấn đề đăng nhập:**

- Khách thường báo sai mật khẩu, hoặc tài khoản bị khóa vì lâu không đăng nhập
- Hệ thống tự khóa tài khoản sau 30 ngày không login — nên loại này **dễ lặp lại trong thực tế**, dù tuần 4 chỉ có 1 tình huống mẫu
- Support làm cùng một chuỗi bước: kiểm tra HR → kiểm tra LMS → mở khóa hoặc đặt mật khẩu → gửi mail

**5 loại còn lại không phù hợp automate bằng:**

- LMS chậm, lỗi hệ thống → cần Dev Team điều tra
- Xin tính năng → cần product quyết định
- Nhiều người dùng, gia hạn deadline → mỗi case khác nhau, cần người xem xét

**Làm tool hay sửa code LMS?**

Quy định “30 ngày không đăng nhập thì khóa tài khoản” là rule có chủ đích. Đổi rule cần product đồng ý, mất vài tuần.

Làm tool mất vài ngày, giúp support xử lý ngay khi người còn làm việc nhưng tài khoản bị khóa. Đây là hướng Operating Engineer: giải quyết nhanh bằng quy trình, không cần chờ sửa code gốc.

---

## Tool hoạt động thế nào?

**Quy trình support sau khi có tool:**

- Tạo ticket trên Odoo, điền đủ thông tin, kiểm tra lại
- Chuyển ticket sang giai đoạn **Đang xử lý**
- Tool nhận tín hiệu, kiểm tra HR và LMS
- Nếu hợp lệ: mở khóa hoặc đặt mật khẩu mới, gửi email, ghi chú, gắn tag `auto-resolved`
- Nếu cần xem tay (đã nghỉ việc, không tìm thấy HR/LMS): ghi chú, gắn tag `manual-review`

**Một số điểm em đã xử lý:**

- Tool chỉ chạy khi ticket sang **Đang xử lý**, không chạy khi đang soạn ticket
- Ticket đã xử lý rồi thì không chạy lại
- Khi bật lại server, tool tự quét ticket còn sót

Chi tiết cài đặt và chạy: xem `README.md`.

---

## Tool mang lại gì?

Mỗi ticket đăng nhập xử lý tay mất khoảng 8 phút. Có tool, support chỉ cần xem lại tag trên Odoo, khoảng 1 phút.

Ngoài tiết kiệm thời gian:

- Khách nhận mail nhanh hơn
- Ít sót bước (ví dụ quên kiểm tra HR trước khi mở khóa)
- Support có thời gian cho ticket khẩn hơn

---

## Tóm lại

Tuần 4 có 6 loại vấn đề khác nhau. Em so sánh và chọn đăng nhập vì quy trình lặp lại và phù hợp automate. Em đã làm tool và nối Odoo. Tool không thay được việc đổi quy định 30 ngày của hệ thống, nhưng giúp support xử lý nhanh các case hợp lệ.
