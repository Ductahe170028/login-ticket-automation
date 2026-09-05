# Phân tích ticket và lý do làm tool xử lý đăng nhập

---

## Kết luận

Tuần 4 có **6 tình huống**, mỗi tình huống một kiểu vấn đề khác nhau — không phải 6 ticket cùng một bệnh.

Em gom 6 loại thành 4 nhóm, rồi chọn **không đăng nhập được LMS** để làm tool. Lý do: support làm đi làm lại cùng một chuỗi việc, và máy kiểm tra được (còn đi làm không, tài khoản ra sao).

Em đã làm xong tool, nối với Odoo Helpdesk. Repo: `login-ticket-automation`.

---

## Em đã làm gì?

**Bước 1 — Xem lại 6 tình huống tuần 4**

Em mở lại ticket trên Odoo, đối chiếu với 6 bài tập tuần 4. Mỗi loại em xem:

- Khách phàn nàn gì
- Support phải làm những bước nào
- Mất khoảng bao lâu
- Có nên để máy làm giúp không

**Bước 2 — Chọn vấn đề đăng nhập**

Sau khi so sánh, loại đăng nhập phù hợp nhất để máy làm giúp.

**Bước 3 — Làm tool và nối Odoo**

Khi ticket chuyển sang **Đang xử lý**, tool tự kiểm tra người còn đi làm không và tài khoản LMS thế nào, rồi mở khóa hoặc đặt mật khẩu mới, gửi mail, ghi chú trên ticket.

---

## 6 loại vấn đề tuần 4 (mỗi loại một tình huống)

**01 — Không đăng nhập được / quên mật khẩu**  
- Thuộc nhóm: tài khoản LMS  
- Ảnh hưởng: 1 giáo viên  
- Làm tay khoảng 5–10 phút  
- Làm đi làm lại cùng bước, máy kiểm tra được  
- **Em đã làm tool cho loại này**

**02 — LMS chậm, không tải trang**  
- Thuộc nhóm: LMS bị chậm / lỗi chạy  
- Ảnh hưởng: 15 học viên một lớp  
- Làm tay khoảng 15–30 phút  
- Cần Dev Team tìm nguyên nhân, máy không tự sửa hết được

**03 — Hệ thống lỗi (không nộp bài, sập hệ thống)**  
- Thuộc nhóm: LMS bị chậm / lỗi chạy  
- Ảnh hưởng: hơn 50 học viên, nhiều lớp, phải xử lý gấp  
- Phải báo Dev Team

**04 — Xin tính năng mới**  
- Thuộc nhóm: product  
- Ảnh hưởng: 1 người xin  
- Mỗi lần xin một thứ khác nhau  
- Support không tự làm được, phải nhờ product xem

**05 — Video không xem được, nhiều người cùng lúc**  
- Thuộc nhóm: LMS bị chậm / lỗi chạy  
- Ảnh hưởng: 12 học viên  
- Phải xem từng trường hợp, không có một nút bấm cho tất cả

**06 — Xin báo cáo gấp, có hạn chót**  
- Thuộc nhóm: việc nội bộ / hạn chót  
- Ảnh hưởng: 1 giám đốc, phải có báo cáo trước 09:00  
- Phải người có quyền duyệt, máy không tự duyệt được

---

## Phân loại theo hệ thống / nhóm

Em không để 6 ticket nằm rời. Gom theo chỗ bị hỏng:

- **Nhóm A — Tài khoản LMS** (không vào được, quên mật khẩu, tài khoản bị khóa): ticket 01  
- **Nhóm B — LMS chạy kém** (chậm, sập, video lỗi): ticket 02, 03, 05  
- **Nhóm C — Xin tính năng mới:** ticket 04  
- **Nhóm D — Việc nội bộ có hạn chót:** ticket 06

Nhóm B nhiều loại nhất (3 trên 6). Nhóm A trong bài tập tuần 4 chỉ có 1 ticket, nhưng dễ gặp lại — giả sử hệ thống khóa tài khoản sau 30 ngày không đăng nhập. Vì vậy em làm tool cho nhóm A, không phải nhóm B.

---

## Thống kê — việc tập trung ở đâu

Số liệu lấy từ ticket luyện tuần 4 trên Odoo (ảnh: [`odoo-danh-sach-ticket.png`](./odoo-danh-sach-ticket.png)). List có **8 ticket**: 6 bài tập + 2 phiếu video trùng (`00012`, `00013`). Đây là bài tập, không phải số ticket cả tháng. Vẫn đủ để thấy nhóm nào nhiều loại, nhóm nào đụng nhiều người, nhóm nào tốn phút của support.

**Theo nhóm (6 ticket):**

- Nhóm A — tài khoản LMS: **1 ticket** (khoảng 17%)  
- Nhóm B — LMS chạy kém: **3 ticket** (50%)  
- Nhóm C — xin tính năng: **1 ticket** (khoảng 17%)  
- Nhóm D — hạn chót: **1 ticket** (khoảng 17%)

**Theo mức khẩn (tuần 4 chia theo số người bị ảnh hưởng, hoặc có hạn chót):**

- 1 người, không gấp hệ thống: 2 ticket (01, 04)  
- Nhiều người (khoảng 5–25): 2 ticket (02, 05)  
- Rất nhiều người, phải xử lý ngay: 1 ticket (03)  
- Có hạn chót cứng: 1 ticket (06)

**Người bị ảnh hưởng (theo đề từng bài):**

- 01 đăng nhập: 1 giáo viên  
- 02 LMS chậm: 15 học viên  
- 03 nộp bài sập: hơn 50 học viên  
- 04 xin tính năng: 1 người  
- 05 video: 12 học viên  
- 06 báo cáo: 1 giám đốc, có hạn chót

Nhóm B đụng nhiều người nhất (15 + hơn 50 + 12). Nhóm A ít người hơn, nhưng làm đi làm lại cùng bước, máy làm giúp được.

**Thời gian support làm tay (ước lượng lúc làm tuần 4):**

- 01 đăng nhập: khoảng 8 phút mỗi ticket  
- 02 LMS chậm: 15–30 phút (xem, báo khách, chuyển Dev Team)  
- 03 sự cố lớn: phải theo dõi, khoảng 15 phút báo một lần đến khi Dev Team xong  
- 04 xin tính năng: ghi nhận rồi chuyển product, support không “sửa” được  
- 05 video: tìm cách xem tạm, rồi nhờ Dev Team nếu là lỗi hệ thống  
- 06 hạn chót: hỏi rõ cần gì, xin người có quyền duyệt — chờ họ, không chủ động được hết

**Đọc số rồi quyết định gì:**

- Trong 6 ticket, **nhiều loại nhất** là LMS chạy kém (nhóm B).  
- **Đụng nhiều người nhất** là ticket 03 (nộp bài sập).  
- **Máy làm giúp được ngay** là ticket 01 (đăng nhập).  
- Nếu chỉ nhìn “nhóm nào nhiều ticket” thì sẽ chọn nhóm B. Em không chọn vì: nhóm B phải Dev Team sửa hệ thống, không phải việc support làm một tool trong vài ngày.

---

## Vì sao chọn đăng nhập, không chọn 5 loại còn lại?

Khách hay báo sai mật khẩu, hoặc vào không được. Giả sử hệ thống khóa tài khoản sau 30 ngày không đăng nhập — thì loại này sẽ gặp lại.

Support mỗi lần cũng làm vậy: xem người còn đi làm không, xem tài khoản LMS, rồi mở khóa hoặc đặt mật khẩu mới, rồi gửi mail.

Năm loại kia máy không làm giúp được hết:

- LMS chậm, sập, video lỗi → phải Dev Team tìm chỗ hỏng  
- Xin tính năng → product quyết định có làm không  
- Nhiều người cùng lúc, xin báo cáo gấp → mỗi lần khác nhau, phải người xem

**Làm tool hay chờ sửa LMS?**

Giả sử hệ thống có rule khóa sau 30 ngày không đăng nhập. Đó là quy định cố ý. Đổi quy định phải product đồng ý, mất vài tuần.

Làm tool mất vài ngày. Người còn đi làm mà tài khoản bị khóa thì mở lại được ngay, không phải chờ Dev Team đổi rule trên LMS. Em chọn hướng này.

---

## Phương án cho từng nhóm

**Nhóm A — Tài khoản LMS (01)**

- Làm ngay: tool đã có. Ticket sang Đang xử lý thì máy kiểm tra, mở khóa hoặc đặt mật khẩu mới, gửi mail. Làm xong thì ghi trên ticket là máy đã xử lý.  
- Làm sau: nếu giả sử có rule khóa 30 ngày, hỏi product có gửi mail nhắc trước khi khóa không — để bớt người bị khóa rồi mới kêu support.  
- Tool không tự làm được với các trường hợp: Người đã nghỉ việc, hoặc không thấy trên hồ sơ nhân sự / LMS, máy chỉ đánh dấu cần xem tay. Support xem những ticket đó.

**Nhóm B — LMS chạy kém (02, 03, 05)**

- LMS chậm: báo khách đã nhận, nói rõ khoảng 15 người bị ảnh hưởng, chuyển Dev Team. Trong lúc chờ, nhờ thử lại hoặc dùng cách khác nếu có. Không viết tool cho loại này — máy không tự sửa được trang chậm.  
- Nộp bài sập: nhận ngay là việc rất gấp, gom vào một ticket chính, báo khách theo nhịp, chuyển Dev Team. Support không tự sửa hệ thống nộp bài.  
- Video lỗi nhiều người: một ticket chính cho cả nhóm 12 người, đưa cách xem tạm, chuyển Dev Team nếu là lỗi hệ thống.  
- Muốn ít ticket nhóm này: Dev Team sửa chỗ hỏng, và có bài hướng dẫn khách biết lúc nào là sự cố chung (nên chờ) chứ không phải lỗi một mình họ.

**Nhóm C — Xin tính năng (04)**

- Support ghi nhận, không hứa ngày có tính năng, chuyển product.  
- Không làm tool để “tự viết tính năng mới”.  
- Muốn ít ticket loại này: form xin tính năng + nói rõ support không làm tính năng mới.

**Nhóm D — Việc có hạn chót (06)**

- Support hỏi rõ cần gì, đưa việc tối thiểu cho kịp hạn, xin người có quyền. Không tự duyệt.  
- Không để máy tự duyệt báo cáo.  
- Muốn ít mail mơ hồ: mẫu “cần báo cáo gấp” — kỳ nào, cơ sở nào, hạn nào.

---

## Tool hoạt động thế nào?

Support tạo ticket trên Odoo, điền đủ, kiểm tra lại, rồi chuyển sang **Đang xử lý**.

Tool nhận việc đó, kiểm tra hồ sơ nhân sự và tài khoản LMS.

- Còn đi làm và tìm thấy tài khoản: mở khóa hoặc đặt mật khẩu mới, gửi mail, ghi chú, đánh dấu máy đã xử lý.  
- Đã nghỉ việc, hoặc không tìm thấy: ghi chú, đánh dấu cần support xem tay.

Mấy điểm em đã chặn:

- Đang soạn ticket thì tool chưa chạy. Chỉ chạy khi sang **Đang xử lý**.  
- Ticket tool đã làm rồi thì không làm lại.  
- Bật lại server thì tool tự tìm ticket còn sót.

---

## Tool mang lại gì?

Mỗi ticket đăng nhập làm tay mất khoảng 8 phút. Có tool, support chỉ cần nhìn trên Odoo xem tool đã xong hay cần xem tay, khoảng 1 phút.

Tuần 4 chỉ có 1 ticket loại này nên chưa so được “tháng trước / tháng này”. Nếu sau này nhiều ticket đăng nhập hơn (giả sử có rule khóa 30 ngày), mỗi ticket đỡ khoảng 7 phút.

Ngoài ra:

- Khách nhận mail nhanh hơn  
- Ít quên bước (ví dụ quên xem còn đi làm rồi mới mở khóa)  
- Support có thì giờ cho việc gấp hơn (LMS sập, nhiều người bị chậm)

---

## Kế hoạch giảm lượng ticket

- **Làm ngay (đã xong):** tool cho nhóm A, để support không lặp lại 8 phút mỗi khi có ticket đăng nhập.  
- **Khi có thêm ticket thật:** đếm trên Odoo các ticket gắn chữ login, LMS, máy-đã-xử-lý — xem loại đăng nhập có nhiều lên không.  
- **Cùng lúc:** một bài hướng dẫn ngắn cho từng nhóm (đăng nhập, LMS chậm, sự cố, xin tính năng, báo cáo gấp) để khách tự làm bước đầu.  
- **Không làm tool cho nhóm B, C, D.** Nhóm B chờ Dev Team. Nhóm C chờ product. Nhóm D chờ người có quyền duyệt.  
- **Nếu product đồng ý, và giả sử có rule khóa 30 ngày:** nhắc trước ngày khóa, hoặc đổi rule. Lúc đó ít người bị khóa hơn. Tool còn lại chủ yếu cho người quên mật khẩu.

---

## Tóm lại

Sáu ticket tuần 4 thuộc 4 nhóm. Nhiều loại nhất là **LMS chạy kém**. Em vẫn làm tool cho **tài khoản LMS**, vì việc lặp lại và máy kiểm tra được.

Tool đã nối Odoo. Nó không đổi được rule khóa (giả sử hệ thống khóa sau 30 ngày), cũng không thay Dev Team sửa LMS bị chậm hay sập. Nó giúp support xong nhanh các ticket đăng nhập mà máy xử lý được.
