# Hiểu tool từ đầu đến cuối — để demo cho mentor

Đọc file này như đang nghe một người giải thích, không cần biết lập trình.

---

## Tool này là gì? (một câu)

Khi support nhận ticket **không đăng nhập được LMS**, thay vì tự mở HR, mở LMS, đặt mật khẩu, gửi mail từng bước — **tool làm giúp phần lớn việc đó**, rồi để lại dấu trên ticket Odoo để support biết đã xong hay cần xem tay.

---

## Ai làm gì?

| Vai trò | Việc |
|---------|------|
| **Support** | Tạo ticket trên Odoo, kiểm tra thông tin, kéo sang "Đang xử lý" |
| **Odoo** | Báo cho tool biết có ticket cần xử lý |
| **Tool** | Đọc ticket, hỏi HR/LMS, xử lý, gửi mail, ghi chú, gắn tag |
| **Support (lần nữa)** | Xem tag trên Odoo — nếu `auto-resolved` thì xác nhận với khách rồi đóng ticket |

Support **không** cần mở terminal hay chạy lệnh. Tool chạy nền trên máy server (khi demo thì chạy trên laptop em).

---

## Bức tranh lớn — từ lúc khách gửi ticket đến lúc xong

```
Khách: "Em không đăng nhập được LMS"
        ↓
Support tạo ticket trên Odoo (tiêu đề, email, mô tả)
        ↓
Support kiểm tra lại — email đúng chưa, mô tả đủ chưa
        ↓
Support kéo ticket sang giai đoạn "Đang xử lý"
        ↓
Odoo gửi tín hiệu cho tool (qua internet, dùng ngrok khi demo local)
        ↓
Tool nhận tín hiệu, đọc đủ thông tin ticket từ Odoo
        ↓
Tool tự hỏi: "Đây có phải ticket đăng nhập không?"
        ↓
        ├── Không → bỏ qua, không làm gì thêm
        └── Có → tiếp tục ↓
Tool hỏi HR: "Email này còn là nhân viên không?"
        ↓
        ├── Không tìm thấy → ghi chú, gắn tag manual-review
        ├── Đã nghỉ việc → ghi chú, gắn tag manual-review
        └── Còn làm việc → tiếp tục ↓
Tool hỏi LMS: "Tài khoản này đang hoạt động hay bị khóa?"
        ↓
        ├── Không có tài khoản → ghi chú, gắn tag manual-review
        ├── Bị khóa → mở khóa + đặt mật khẩu mới + gửi mail
        └── Đang hoạt động → chỉ đặt mật khẩu mới + gửi mail
        ↓
Tool ghi chú nội bộ trên ticket + gắn tag auto-resolved
        ↓
Support thấy tag, xác nhận với khách, đóng ticket
```

---

## Tool biết ticket nào cần xử lý bằng cách nào?

Không phải ticket nào Odoo gửi tới tool cũng xử lý. Tool chỉ xử lý khi:

1. **Tiêu đề hoặc mô tả** có từ liên quan đăng nhập (đăng nhập, login, mật khẩu, password, …)
   **HOẶC** ticket có tag `login`

2. Ticket **chưa** có tag `auto-resolved` hoặc `manual-review` (tránh xử lý lại lần hai)

Ví dụ ticket "Xin gia hạn deadline" → tool bỏ qua, không đụng vào.

---

## Từng bước tool làm gì? (chi tiết dễ nhớ)

### Bước 0: Ticket đã xử lý chưa?

Nếu ticket đã có tag `auto-resolved` hoặc `manual-review` → **dừng**, không làm lại.

*Ví dụ: Odoo gửi tín hiệu lần hai khi support sửa ticket — tool thấy đã xử lý rồi thì bỏ qua.*

### Bước 1: Có phải ticket đăng nhập không?

Đọc tiêu đề + mô tả + tag. Không phải → dừng, không gắn tag gì.

### Bước 2: Có email khách không?

Không có email → ghi chú "thiếu email", gắn tag `manual-review`, support xử lý tay.

### Bước 3: Hỏi HR

Tool gửi email khách sang hệ thống HR (khi demo dùng mock-api giả lập).

- **Không tìm thấy** → ghi chú, tag `manual-review`
- **Đã nghỉ việc** → ghi chú, tag `manual-review` (không được mở tài khoản cho người đã nghỉ)
- **Còn làm việc** → sang bước 4

### Bước 4: Hỏi LMS

Tool gửi email sang hệ thống LMS.

- **Không có tài khoản** → ghi chú, tag `manual-review`
- **Tài khoản bị khóa (deactivated)** → mở khóa + đặt mật khẩu mới
- **Tài khoản đang hoạt động** → chỉ đặt mật khẩu mới

### Bước 5: Thông báo cho khách

Tool gửi email tiếng Việt cho khách qua Odoo, nội dung kiểu:
- Tài khoản đã được mở lại / mật khẩu mới là gì
- Hướng dẫn đăng nhập lại

### Bước 6: Ghi lại trên ticket Odoo

- **Ghi chú nội bộ** (chỉ support thấy): đã làm gì, email gửi cho ai
- **Gắn tag `auto-resolved`** nếu xử lý xong
- **Gắn tag `manual-review`** nếu cần người xem tay

---

## Hai tag support cần nhớ

| Tag | Nghĩa là gì | Support làm gì |
|-----|--------------|----------------|
| `auto-resolved` | Tool đã xử lý xong, mail đã gửi | Gọi/nhắn khách xác nhận đăng nhập được → đóng ticket |
| `manual-review` | Tool không tự xử lý được | Đọc ghi chú trên ticket → xử lý tay |

Không có tag = chưa chạy automation hoặc không phải ticket đăng nhập.

---

## Các tình huống demo hay gặp (kịch bản kể cho mentor)

### Kịch bản A — Thành công: tài khoản bị khóa

- **Khách:** `ducgioibvb5@gmail.com` — tiêu đề có "không đăng nhập được"
- **HR:** còn làm việc
- **LMS:** tài khoản bị khóa
- **Tool làm:** mở khóa + mật khẩu mới + gửi mail
- **Odoo thấy:** tag `auto-resolved`, ghi chú nội bộ, mail trong chatter

### Kịch bản B — Thành công: chỉ cần đổi mật khẩu

- **Khách:** `active.user@mindx.edu.vn`
- **LMS:** tài khoản đang hoạt động
- **Tool làm:** chỉ đặt mật khẩu mới + gửi mail
- **Odoo thấy:** tag `auto-resolved`

### Kịch bản C — Cần xem tay: đã nghỉ việc

- **Khách:** `terminated@mindx.edu.vn`
- **HR:** đã nghỉ việc
- **Tool làm:** ghi chú, **không** gửi mail mật khẩu
- **Odoo thấy:** tag `manual-review`

### Kịch bản D — Bỏ qua: không phải ticket đăng nhập

- **Tiêu đề:** "Xin gia hạn deadline bài tập"
- **Tool làm:** không làm gì
- **Odoo thấy:** không có tag mới

### Kịch bản E — Đã xử lý rồi

- Ticket đã có tag `auto-resolved`
- Odoo gửi tín hiệu lại → tool **bỏ qua**
- *Giải thích cho mentor: tránh gửi mail hai lần*

---

## Hai cách tool được "đánh thức"

### Cách 1 — Odoo báo ngay (luồng chính)

Support kéo ticket sang **Đang xử lý** → Odoo gửi tín hiệu → tool chạy ngay.

**Vì sao không chạy lúc mới tạo ticket?**  
Odoo tự lưu ticket khi support chuyển tab — nếu automation chạy "khi tạo", mail có thể gửi sớm khi support còn đang soạn. Em cấu hình chạy khi **Đang xử lý** để support kiểm tra xong mới chạy.

### Cách 2 — Quét lại khi bật server (dự phòng)

Nếu tool tắt một lúc, có ticket bị bỏ sót.

Mỗi lần chạy `npm run dev`, tool **tự quét** ticket login trong 7 ngày gần nhất chưa có tag → xử lý → rồi mới chờ tín hiệu mới.

*Giải thích cho mentor: giống "bù" ticket miss khi server tắt.*

---

## Khi demo, cần chạy những gì?

Mở **3 cửa sổ terminal** trên laptop:

| Cửa sổ | Lệnh | Làm gì |
|--------|------|--------|
| 1 | `npm run mock-api` | Giả lập HR + LMS (thay hệ thống thật khi demo) |
| 2 | `npm run dev` | Tool automation — chờ tín hiệu từ Odoo |
| 3 | `ngrok http 3000` | Tạo đường dẫn public để Odoo cloud gọi về laptop |

Trên Odoo đã cấu hình automation: khi ticket sang **Đang xử lý** → gửi tín hiệu đến URL ngrok.

---

## Demo trước mentor — kịch bản nói từng bước

**1. Giới thiệu (30 giây)**  
"Em làm tool tự động xử lý ticket không đăng nhập được. Support tạo ticket, kéo sang Đang xử lý, tool tự check HR/LMS, gửi mail, gắn tag."

**2. Cho xem 3 terminal đang chạy**  
mock-api, dev server, ngrok.

**3. Tạo ticket mới trên Odoo**  
- Tiêu đề: "Không đăng nhập được LMS"
- Email: `ducgioibvb5@gmail.com`
- Lưu, kiểm tra, kéo **Đang xử lý**

**4. Chỉ terminal `npm run dev`**  
Thấy log xử lý ticket.

**5. Quay lại Odoo**  
- Tag `auto-resolved`
- Ghi chú nội bộ tiếng Việt
- Email đã gửi (nếu Odoo trial hiển thị)

**6. Giải thích tag `manual-review`**  
Tạo hoặc chỉ ticket `terminated@mindx.edu.vn` — tool ghi chú, không gửi mail, gắn tag cần xem tay.

**7. Kết**  
"Tuần 4 em so sánh 6 loại vấn đề, chọn đăng nhập vì quy trình lặp lại. Tool không sửa rule 30 ngày khóa tài khoản — giúp support xử lý nhanh case hợp lệ."

---

## Câu hỏi mentor có thể hỏi — trả lời ngắn

**"Tool chạy ở đâu?"**  
Chạy trên server (demo thì laptop + ngrok). Support chỉ dùng Odoo.

**"Odoo gửi gì cho tool?"**  
Chỉ mã số ticket. Tool tự đọc tiêu đề, email, mô tả từ Odoo.

**"Sai email thì sao?"**  
Tool hỏi HR — không thấy → gắn `manual-review`, support xử lý tay.

**"Người đã nghỉ việc?"**  
Tool không mở tài khoản, gắn `manual-review`.

**"Gửi mail hai lần?"**  
Không — ticket đã có tag thì tool bỏ qua.

**"Server tắt thì sao?"**  
Lần bật lại tool tự quét ticket còn sót (catch-up).

**"Khác gì support làm tay?"**  
Cùng quy trình: check HR → check LMS → reset/reactivate → mail. Tool làm tự động, nhanh hơn, ít sót bước.

**"Sao không sửa LMS cho hết khóa tài khoản?"**  
Rule 30 ngày là quy định hệ thống, đổi cần product. Tool giải quyết ngay — hướng Operating Engineer.

---

## Tóm lại — nhớ 5 ý khi demo

1. **Support kéo "Đang xử lý"** → tool mới chạy  
2. **Chỉ ticket đăng nhập** mới được xử lý  
3. **Check HR trước** — nghỉ việc thì không mở tài khoản  
4. **Tag trên Odoo** cho support biết xong hay cần xem tay  
5. **Catch-up** khi server bật lại — không bỏ sót ticket
