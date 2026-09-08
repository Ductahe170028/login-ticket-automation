# BÁO CÁO PHÂN TÍCH TICKET — TECHNICAL SUPPORT

**Nguồn dữ liệu:** Helpdesk export `sample.xlsx` — Plan tuần 5  
**Bản dữ liệu dùng để phân tích:** `sample-tickets.csv`  
**Phạm vi:** 131 ticket Technical Support có mã không trùng lặp.

**Cách phân loại:** Ticket được phân nhóm theo hệ thống + nội dung yêu cầu trong Subject. Những ticket có cùng tên vấn đề nhưng nằm trên các hệ thống khác nhau không được mặc định là cùng nguyên nhân hoặc cùng cách xử lý.

## 1. Mục tiêu và cách đọc báo cáo

Báo cáo này không chỉ trả lời câu hỏi “có bao nhiêu ticket?”, mà đi theo chuỗi:

Volume → Pattern → Giả thuyết nguyên nhân → Hướng xử lý → Dữ liệu cần đo thêm

Mục tiêu là trả lời bốn câu hỏi:

- Ticket đang tập trung ở đâu?
- Trong các khu vực đó, người dùng thực sự đang gặp loại vấn đề nào?
- Support đang phải xử lý theo kiểu nào: hướng dẫn, xin quyền, điều tra lỗi, chuyển bộ phận hay thao tác lặp lại?
- Với từng kiểu vấn đề, hướng cải thiện nào hợp lý và cần đo thêm gì trước khi kết luận?

Volume dùng để xác định nơi cần nhìn vào trước. Giải pháp chỉ được đề xuất sau khi xem pattern và cách support thực sự xử lý.

## 2. Bức tranh tổng thể: ticket đang tập trung ở đâu?

```mermaid
pie title Ticket theo hệ thống — 131 ticket
  "CRM" : 37
  "LMS" : 26
  "TMS" : 20
  "Test" : 12
  "Denise" : 8
  "E-contract" : 7
  "Mail" : 6
  "Khác" : 6
  "Crystal" : 4
  "Ecount" : 3
  "Nội bộ" : 2
```

CRM, LMS và TMS có tổng cộng 83/131 ticket, chiếm 63,4% toàn bộ dữ liệu. Trong đó CRM có 37 ticket, LMS 26 và TMS 20.

Điều này cho thấy phần lớn workload support trong tập dữ liệu hiện tại đang nằm ở ba hệ thống trên. Vì vậy, nếu cần chọn nơi để phân tích sâu thì CRM, LMS và TMS là ba hệ thống cần xem trước.

Tuy nhiên, số lượng ticket cao không đồng nghĩa hệ thống đó có tỷ lệ lỗi cao. Dữ liệu hiện tại không có số người dùng của từng hệ thống, nên chưa thể tính số ticket trên mỗi người dùng. Một hệ thống có nhiều ticket có thể do lượng người dùng lớn, nghiệp vụ phức tạp, quyền hạn khó xử lý, người dùng chưa biết thao tác hoặc hệ thống thực sự lỗi.

Kết luận của bước này: khối lượng support tập trung ở CRM, LMS và TMS; cần đi sâu vào nội dung ticket của ba hệ thống để biết support đang mất công ở đâu.

## 3. Ticket đang tập trung vào loại công việc nào?

```mermaid
pie title Các nhóm việc có số lượng ticket nổi bật
  "Enroll" : 15
  "Thanh toán" : 13
  "Không đăng nhập" : 12
  "Chấm công" : 12
  "Test" : 12
  "Lead / trạng thái" : 7
  "Lớp / GV / học phần" : 7
  "Hợp đồng" : 7
```

Các nhóm có số lượng nổi bật nhất là Enroll 15, Thanh toán 13, Không đăng nhập 12, Chấm công 12 và Test 12.

Nhưng chưa thể chọn ngay “nhóm nhiều nhất để làm tool”. Ví dụ, 15 ticket enroll thực tế gồm 9 ticket trên LMS và 6 ticket trên CRM. Cùng là enroll nhưng thao tác, dữ liệu và quyền xử lý khác nhau.

Ngược lại, 13 ticket thanh toán đều nằm trên CRM, nên đây là một cụm nghiệp vụ rõ hơn.

Từ đây báo cáo tách thành hai góc nhìn:

- Theo hệ thống: để xem từng hệ thống đang tạo ra loại ticket gì.
- Theo pattern support: để xem loại quy trình nào đang lặp lại và có thể cải thiện.

## 4. Phân tích ba hệ thống có nhiều ticket nhất

### 4.1. CRM — 37 ticket

```mermaid
pie title CRM — phân bố 37 ticket
  "Thanh toán" : 13
  "Lead / trạng thái" : 7
  "Enroll" : 6
  "Gọi / SMS" : 4
  "Sửa / xuất dữ liệu" : 3
  "Dropout" : 2
  "Cấp / chuyển TK" : 1
  "Không đăng nhập" : 1
```

Ba nhóm lớn nhất trên CRM là Thanh toán 13, Lead/trạng thái 7 và Enroll 6. Tổng cộng ba nhóm này có 26/37 ticket, chiếm 70,3% ticket CRM.

Điều này cho thấy ticket CRM không phân tán đều. Nếu muốn giảm workload support trên CRM thì ba nhóm trên là nơi cần điều tra trước.

#### 4.1.1. Thanh toán — 13 ticket

Thanh toán là nhóm lớn nhất của CRM, chiếm 35,1% ticket CRM.

Các ticket không phải cùng một lỗi mà gồm nhiều loại yêu cầu: tạo QR, add/gỡ payment, hủy hoặc confirm giao dịch, cập nhật trạng thái đóng tiền, hóa đơn và mã giảm giá.

Điểm quan trọng là:

13 ticket payment cho thấy đây là một nghiệp vụ tạo ra nhiều yêu cầu support, nhưng chưa chứng minh CRM có một lỗi payment lặp lại 13 lần.

Trước khi chọn giải pháp, cần tách nguyên nhân theo ít nhất bốn hướng:

**A. Người dùng chưa biết thao tác**  
→ Có thể xử lý bằng hướng dẫn hoặc auto-reply nếu thao tác đơn giản và đã có tài liệu.

**B. Người dùng biết thao tác nhưng không có quyền**  
→ Vấn đề nằm ở phân quyền hoặc routing; cần chuyển đúng người có quyền.

**C. Dữ liệu hoặc CRM thực sự lỗi**  
→ Cần thu thập bằng chứng và chuyển người phụ trách CRM/Dev điều tra.

**D. Nghiệp vụ bắt buộc có người kiểm soát**  
→ Không nên tự động thay đổi dữ liệu chỉ để giảm ticket.

File hiện tại không có log xử lý hoặc root cause cuối cùng nên chưa biết tỷ trọng A/B/C/D.

Dữ liệu cần bổ sung cho 13 ticket payment:

Nguyên nhân cuối cùng → người/bộ phận xử lý → thao tác đã thực hiện → có phải hỏi thêm thông tin không → thời gian xử lý → kết quả.

Sau khi có dữ liệu này mới quyết định được giải pháp chính là guide, form, routing hay automation.

#### 4.1.2. Lead / trạng thái — 7 ticket

Nhóm này chiếm gần 19% ticket CRM.

Cần tiếp tục tách xem ticket chủ yếu là yêu cầu đổi trạng thái, dữ liệu lead sai, không thao tác được, lỗi khi xử lý lead hay cần người có quyền cao hơn.

Nếu support thường xuyên phải hỏi lại cùng các thông tin như mã lead, trạng thái hiện tại, trạng thái mong muốn, lý do thay đổi, có thể chuẩn hóa form đầu vào.

Nếu nguyên nhân chủ yếu là thiếu quyền thì hướng phù hợp hơn là routing, không phải automation sửa dữ liệu.

#### 4.1.3. Enroll trên CRM — 6 ticket

CRM có 6 ticket enroll. Các ticket này cần tách khỏi enroll trên LMS dù đều liên quan đến học viên/lớp, vì thao tác xử lý nằm trên hai hệ thống khác nhau.

Với CRM, nội dung chủ yếu liên quan đến enrollment hoặc chỉnh sửa thông tin trên enrollment.

Kết luận: có thể gom enroll để nhìn tổng volume, nhưng không được dùng một quy trình xử lý chung cho CRM và LMS.

### 4.2. LMS — 26 ticket

```mermaid
pie title LMS — phân bố 26 ticket
  "Enroll" : 9
  "Lớp / GV / học phần" : 7
  "Compass / học tập" : 3
  "Cấp / chuyển TK" : 2
  "Dropout" : 2
  "Điểm thưởng" : 1
  "Không đăng nhập" : 1
  "Điểm danh lớp" : 1
```

Hai nhóm lớn nhất là Enroll 9 và Lớp/GV/học phần 7, tổng cộng 16/26 ticket, chiếm 61,5% ticket LMS.

Điều này cho thấy phần lớn ticket LMS trong tập dữ liệu hiện tại xoay quanh đưa học viên vào lớp và quản lý lớp/học phần.

#### 4.2.1. Enroll trên LMS — 9 ticket

Các tình huống gồm thêm học viên, không tìm thấy lớp hoặc slot, enroll trùng và lỗi trong quá trình enroll.

Chỉ dựa trên Subject chưa thể biết root cause. Có ít nhất bốn khả năng:

- Người dùng thao tác chưa đúng.
- Dữ liệu học viên/lớp thiếu hoặc sai.
- Tài khoản không đủ quyền.
- LMS thực sự lỗi.

Bốn nguyên nhân này dẫn tới bốn hướng xử lý khác nhau:

- Guide / auto-reply nếu người dùng thiếu hướng dẫn.
- Form nếu support thường phải hỏi lại mã lớp, học viên hoặc dữ liệu đầu vào.
- Routing nếu cần người có quyền enroll.
- Dev nếu nhiều ticket có cùng triệu chứng lỗi hệ thống.

Điểm cần tránh là kết luận ngay “9 ticket enroll → viết guide”.

Nếu chưa có guide, viết guide là một hướng hợp lý. Nhưng nếu đã có guide mà ticket vẫn tiếp tục phát sinh thì phải kiểm tra tiếp: người dùng có biết tài liệu tồn tại không, tài liệu có dễ tìm không, còn đúng với giao diện hiện tại không, người dùng đọc rồi nhưng vẫn không thao tác được hay ticket thực chất là vấn đề quyền/lỗi hệ thống.

Vì vậy, guide chỉ là một trong các hướng xử lý, không phải kết luận cuối cùng từ số lượng ticket.

#### 4.2.2. Lớp / giáo viên / học phần — 7 ticket

Nhóm này gồm các yêu cầu như không thêm được giáo viên, điều chỉnh lớp hoặc lỗi liên quan đến học phần.

Cần tách hai loại:

- Yêu cầu nghiệp vụ: cần người có quyền chỉnh lớp/GV/học phần.
- Lỗi hệ thống: chức năng đúng ra phải dùng được nhưng không hoạt động.

Nếu là yêu cầu nghiệp vụ thì giải pháp là routing hoặc quy trình quyền. Nếu là lỗi hệ thống thì cần ghi nhận thao tác, dữ liệu đầu vào, ảnh lỗi và phạm vi ảnh hưởng để Dev kiểm tra.

### 4.3. TMS — 20 ticket

```mermaid
pie title TMS — phân bố 20 ticket
  "Chấm công / bảng công" : 12
  "Lỗi hệ thống" : 6
  "Không đăng nhập" : 2
```

Có 18/20 ticket TMS, tương đương 90%, nằm ở chấm công hoặc lỗi hệ thống. Đây là hệ thống có pattern tập trung rõ nhất trong ba hệ thống chính.

#### 4.3.1. Chấm công / bảng công — 12 ticket

Các triệu chứng gồm không hiển thị công, không duyệt được công, cần bù công, đi đúng ca nhưng hệ thống báo trễ và các vấn đề điểm danh/chấm công giáo viên.

Vì vậy, 12 ticket chấm công không phải 12 bản sao của cùng một lỗi.

Cần tách tiếp theo triệu chứng:

Không có dữ liệu → dữ liệu sai → không duyệt được → ghi nhận sai thời gian → vấn đề khác

Sau đó xác định phạm vi:

Một người → một ca → một cơ sở → nhiều cơ sở

Ví dụ, một người không thấy công có thể là dữ liệu cá nhân hoặc thao tác. Nhưng nếu nhiều người cùng cơ sở, cùng ca và cùng lỗi thì có thể là một incident. Nếu nhiều cơ sở cùng thời điểm thì mới tăng mạnh nghi ngờ lỗi hệ thống chung.

Ticket TMS nên có thêm các field:

Cơ sở → thời điểm → ca làm việc → người bị ảnh hưởng → số người cùng gặp → triệu chứng → ảnh lỗi

Mục tiêu không chỉ là đủ thông tin để xử lý, mà còn giúp support nhận ra nhiều ticket có thể đang nói về cùng một sự cố.

#### 4.3.2. Lỗi hệ thống — 6 ticket

Có 6 ticket mô tả mất dữ liệu, không hiển thị thông tin hoặc không thao tác được.

Đáng chú ý, ticket 233 và 234 cùng liên quan đến Tỉnh Nam 2, có triệu chứng tương tự và cùng nhắc đến lỗi từ ngày 31.

Dữ liệu này chưa đủ để khẳng định cùng root cause, nhưng đủ để tạo giả thuyết rằng hai ticket có thể thuộc cùng một incident.

Hướng xử lý phù hợp là so sánh:

Hệ thống + khu vực + thời gian + triệu chứng

Nếu trùng nhiều yếu tố, support liên kết chúng để cùng điều tra. Việc xác nhận cùng root cause vẫn phải dựa trên điều tra thực tế.

## 5. Pattern support xuất hiện trên nhiều hệ thống

Sau khi xem riêng CRM, LMS và TMS, bước tiếp theo là tìm quy trình support lặp lại xuyên hệ thống.

Đây là phần quan trọng vì automation không nhất thiết phải chọn nhóm có volume lớn nhất. Một nhóm nhỏ hơn nhưng quy trình rõ, lặp lại và ít rủi ro có thể phù hợp hơn.

### 5.1. Không đăng nhập / tài khoản — 12 ticket trên 7 hệ thống

```mermaid
pie title Không đăng nhập — 12 ticket trên 7 hệ thống
  "Denise" : 2
  "TMS" : 2
  "Mail" : 2
  "Ecount" : 2
  "Nội bộ" : 2
  "LMS" : 1
  "CRM" : 1
```

Không có hệ thống nào chiếm phần lớn nhóm login. Điểm đáng chú ý không nằm ở volume từng hệ thống mà ở cấu trúc xử lý lặp lại.

Một ticket login thường có thể đi qua chuỗi:

Xác định user → kiểm tra trạng thái nhân sự → kiểm tra trạng thái tài khoản → xác định nguyên nhân → reset/mở khóa nếu đủ điều kiện → phản hồi

Đây là dạng quy trình phù hợp để automation hỗ trợ vì đầu vào có thể chuẩn hóa, có điều kiện kiểm tra rõ và nhiều bước là truy vấn trạng thái.

Tuy nhiên, 12 ticket login không đồng nghĩa workflow hiện tại xử lý được cả 12. Các hệ thống có cơ chế tài khoản khác nhau và workflow hiện tại chỉ xử lý được phần nằm trong phạm vi hệ thống mà tool truy cập.

Vì vậy, mục tiêu tiếp theo là đo:

- tổng ticket đưa vào workflow;
- số ticket xử lý hoàn toàn;
- số ticket chỉ hỗ trợ kiểm tra;
- số ticket không xử lý được;
- lý do không xử lý được;
- thời gian trước và sau workflow.

Khi có số liệu này mới đánh giá được automation coverage và hiệu quả thực tế.

### 5.2. Enroll — 15 ticket trên hai hệ thống

```mermaid
pie title Enroll theo hệ thống — 15 ticket
  "LMS" : 9
  "CRM" : 6
```

Enroll là nhóm lớn nhất nếu chỉ nhìn theo tên công việc, nhưng pattern ở đây khác login.

Login có thể có một chuỗi kiểm tra tương đối giống nhau.

Enroll phụ thuộc mạnh vào hệ thống.

Vì vậy, với enroll, hướng hợp lý trước mắt là chuẩn hóa đầu vào và tách quy trình LMS/CRM, chưa phải xây một workflow chung.

Thông tin đầu vào có thể gồm:

Hệ thống → mã lớp → thông tin học viên → thao tác đã thử → lỗi nhìn thấy

Sau đó mới đánh giá từng hệ thống có bước nào lặp lại đủ rõ để tiếp tục tự động hóa.

## 6. Những tình huống không nên vội chốt nguyên nhân

### 6.1. Hệ thống chậm / timeout / tải lâu

File hiện tại không có nhiều ticket loại “LMS chậm”, nên chưa thể thống kê thành một nhóm lớn. Tuy nhiên, khi gặp loại ticket này, không nên kết luận ngay “server chậm”.

Cần hỏi theo thứ tự:

- Một người hay nhiều người cùng gặp?
- Một cơ sở hay nhiều cơ sở?
- Xảy ra trong khung giờ nào?
- Đã thử máy khác, mạng khác, trình duyệt khác chưa?
- Chậm ở bước nào: mở trang, tải file/video, lưu hay submit?
- Có thay đổi mạng, firewall hoặc release hệ thống gần thời điểm đó không?

Cách suy luận:

- Một user → kiểm tra môi trường người dùng trước.
- Nhiều user cùng cơ sở → kiểm tra mạng/cơ sở và dữ liệu chung.
- Nhiều cơ sở cùng thời điểm → tăng khả năng sự cố phía hệ thống/server/CDN.

“Chậm” là triệu chứng, không phải root cause.

### 6.2. Nhiều người cùng triệu chứng

Khi nhiều ticket giống nhau, support cần kiểm tra xem đây là nhiều lỗi độc lập hay một incident.

Thông tin tối thiểu để so sánh:

Hệ thống + khu vực + thời gian + triệu chứng + số người bị ảnh hưởng

Nếu trùng các yếu tố trên, tạo một incident chính và liên kết các ticket liên quan có thể giúp tránh nhiều support cùng điều tra một nguyên nhân.

### 6.3. Tính năng mới và yêu cầu có hạn chót

Hai loại này không nên xử lý giống bug.

Tính năng mới: ghi nhận nhu cầu, xác định người quyết định, không tự hứa thời gian release.

Yêu cầu có deadline: xác định thời hạn thực tế, phạm vi ảnh hưởng và người có quyền xử lý.

Những việc cần quyền phê duyệt không nên đưa vào automation chỉ vì có deadline.

## 7. Trạng thái và priority nói được gì — và chưa nói được gì?

### 7.1. Trạng thái

```mermaid
pie title Trạng thái 131 ticket
  "Resolved" : 91
  "First Response Sent" : 17
  "Cancelled" : 12
  "New" : 6
  "In Progress" : 5
```

Có 91/131 ticket Resolved, tương đương 69,5%.

Con số này cho biết phần lớn ticket trong export đã được đóng, nhưng không đủ để đánh giá support đang làm nhanh hay chậm.

Để đánh giá hiệu quả xử lý cần thêm thời gian từ Created đến First Response, thời gian đến Resolved, SLA, reopen, assignee và số người/cơ sở bị ảnh hưởng.

Ví dụ, 69,5% resolved có thể tốt nếu ticket được xử lý trong thời gian ngắn, nhưng cũng có thể chưa tốt nếu phần lớn ticket mất nhiều ngày mới đóng.

### 7.2. Priority

```mermaid
pie title Mức độ ưu tiên — 131 ticket
  "High" : 42
  "Urgent" : 40
  "Low" : 40
  "Medium" : 9
```

High + Urgent có 82/131 ticket, chiếm 62,6%.

Đây là tỷ lệ đáng chú ý, nhưng chưa thể kết luận 62,6% ticket là sự cố nghiêm trọng. Cần biết priority được gán theo tiêu chí nào: số người bị ảnh hưởng, nghiệp vụ, deadline hay do người tạo ticket tự chọn.

Nếu không có quy tắc gán priority rõ ràng, tỷ lệ High/Urgent cao có thể làm giảm ý nghĩa của chính trường priority.

## 8. Từ phân tích đến quyết định cải thiện

Sau khi đi qua dữ liệu, có thể thấy không có một giải pháp chung cho mọi ticket.

| Nhóm | Điều đã biết | Điều chưa biết | Hướng hợp lý hiện tại |
| --- | --- | --- | --- |
| CRM — Payment | 13 ticket, nhiều dạng nghiệp vụ | Root cause và thao tác support thực tế | Phân loại nguyên nhân trước; ưu tiên form/routing, không tự sửa payment |
| CRM — Lead | 7 ticket | Chủ yếu thiếu thông tin, thiếu quyền hay lỗi hệ thống | Chuẩn hóa field và routing nếu xác nhận support phải hỏi lại |
| LMS — Enroll | 9 ticket | Root cause từng ticket | Tách guide/form/quyền/lỗi; không mặc định chỉ cần guide |
| CRM — Enroll | 6 ticket | Bước lặp lại thực tế | Quy trình riêng CRM |
| TMS — Chấm công | 12 ticket, nhiều triệu chứng | Phạm vi ảnh hưởng và root cause | Bổ sung field, phát hiện incident |
| TMS — Lỗi hệ thống | 6 ticket, có cụm Nam 2 | Có thực sự cùng root cause không | Điều tra incident chung |
| Login | 12 ticket, 7 hệ thống, quy trình kiểm tra lặp lại | Workflow xử lý được bao nhiêu | Tiếp tục workflow và đo coverage |
| Guide / tài liệu | Có khả năng hỗ trợ nhiều nhóm | Chưa biết KB hiện có gì và user có đọc không | Kiểm tra trước khi viết mới; đo hiệu quả auto-reply |

Điểm rút ra:

Volume trả lời “nên nhìn vào đâu”.  
Pattern trả lời “support đang lặp lại việc gì”.  
Root cause trả lời “vì sao ticket phát sinh”.  
Chỉ sau ba bước đó mới chọn được giải pháp.

## 9. Hướng xử lý và ưu tiên

Từ các nhóm đã phân tích, không nên chọn giải pháp chỉ dựa trên số lượng ticket. Hướng xử lý cần dựa vào nguyên nhân, mức độ lặp lại của quy trình support và rủi ro của thao tác.

### 9.1. Login — tiếp tục sử dụng workflow và đo hiệu quả thực tế

Login có 12 ticket trên 7 hệ thống. Điểm đáng chú ý không phải là số ticket trên từng hệ thống, mà là chuỗi kiểm tra support có tính lặp lại:

Xác định user → kiểm tra trạng thái nhân sự → kiểm tra tài khoản → xác định nguyên nhân → xử lý nếu đủ điều kiện → phản hồi.

Đây là nhóm phù hợp để automation hỗ trợ vì nhiều bước là kiểm tra trạng thái và có thể đặt điều kiện rõ ràng.

Workflow login hiện đã được triển khai. Tuy nhiên, chưa nên kết luận tool giúp giảm bao nhiêu thời gian chỉ dựa trên việc workflow chạy được. Cần ghi nhận ngay trong quá trình sử dụng:

- tổng số ticket được đưa vào workflow;
- số ticket workflow xử lý hoàn toàn;
- số ticket workflow hỗ trợ một phần nhưng vẫn cần support;
- số ticket không xử lý được và lý do;
- thời gian xử lý thực tế.

Những số liệu này dùng để đánh giá automation coverage và mức giảm thao tác thủ công của support.

### 9.2. CRM Payment — ưu tiên xác định nguyên nhân trước khi tự động hóa

Payment có 13 ticket và là nhóm lớn nhất trên CRM. Tuy nhiên, các ticket gồm nhiều loại yêu cầu khác nhau như QR, payment, trạng thái giao dịch, hóa đơn và mã giảm giá.

Dữ liệu hiện tại mới cho thấy Payment tạo ra nhiều yêu cầu support, chưa cho biết nguyên nhân chính là:

- người dùng chưa biết thao tác;
- thiếu quyền;
- thiếu thông tin;
- lỗi dữ liệu/hệ thống;
- hay nghiệp vụ bắt buộc phải có người kiểm soát.

Vì vậy, chưa nên xây automation tự thay đổi dữ liệu payment.

Khi xử lý nhóm này cần ghi nhận thêm nguyên nhân cuối cùng, người/bộ phận xử lý, thao tác thực tế và việc ticket có phải hỏi bổ sung thông tin hay không. Nếu nguyên nhân chủ yếu là thiếu thông tin thì chuẩn hóa form; nếu thiếu quyền thì cải thiện routing; nếu người dùng chưa biết thao tác thì dùng guide; nếu là lỗi hệ thống thì chuyển điều tra kỹ thuật.

### 9.3. LMS/CRM Enroll — cùng nghiệp vụ nhưng tách quy trình

Enroll có 15 ticket, gồm 9 trên LMS và 6 trên CRM. Đây là nhóm có volume lớn nhất nếu chỉ nhìn theo loại việc.

Tuy nhiên, LMS và CRM có dữ liệu và thao tác khác nhau nên không nên xây một hướng xử lý chung chỉ vì cùng tên “Enroll”.

Với LMS, cần xác định ticket do thao tác, dữ liệu lớp/học viên, quyền hay lỗi hệ thống. Với CRM, cần tập trung vào thao tác và dữ liệu trên enrollment.

Thông tin đầu vào có thể được chuẩn hóa theo:

Hệ thống → mã lớp → thông tin học viên → thao tác đã thử → lỗi nhìn thấy.

Guide cũng cần tách riêng LMS và CRM. Nếu guide đã tồn tại nhưng ticket vẫn phát sinh thì cần kiểm tra người dùng có tìm thấy tài liệu không, tài liệu có còn đúng không và vấn đề có thực sự giải quyết được bằng guide hay không.

### 9.4. TMS — ưu tiên nhận diện incident

TMS có 20 ticket, trong đó 18 ticket thuộc chấm công hoặc lỗi hệ thống.

Các ticket này cần được bổ sung thông tin:

Thời gian → cơ sở/khu vực → ca làm việc → người bị ảnh hưởng → số người cùng gặp → triệu chứng.

Nếu nhiều ticket trùng thời gian, khu vực và triệu chứng thì support cần kiểm tra khả năng chúng thuộc cùng một incident.

Mục tiêu là tránh nhiều support cùng điều tra một nguyên nhân dưới nhiều ticket khác nhau. Hệ thống có thể hỗ trợ phát hiện ticket tương tự, nhưng việc kết luận cùng root cause vẫn cần người xử lý xác nhận.

### 9.5. Guide / tài liệu — không mặc định “có ticket thì viết guide”

Guide chỉ phù hợp khi nguyên nhân ticket thực sự liên quan đến việc người dùng thiếu hướng dẫn.

Nếu chưa có guide và thao tác có thể tự thực hiện, có thể bổ sung tài liệu.

Nếu đã có guide nhưng ticket vẫn tiếp tục phát sinh, cần kiểm tra:

- người dùng có biết guide tồn tại không;
- guide có dễ tìm không;
- nội dung còn đúng với hệ thống hiện tại không;
- người dùng đọc guide nhưng vẫn không thực hiện được;
- hay vấn đề thực chất là quyền hoặc lỗi hệ thống.

Nếu nguyên nhân chỉ là khó tìm tài liệu, có thể thử auto-reply kèm đúng guide khi ticket được tạo. Hiệu quả cần được đánh giá bằng số ticket người dùng tự xử lý được sau khi nhận tài liệu, thay vì chỉ đo số lần guide được gửi.

## 10. Kết luận

Phân tích 131 ticket cho thấy khối lượng support tập trung chủ yếu tại CRM, LMS và TMS, với tổng cộng 83 ticket, chiếm 63,4%.

Tuy nhiên, số lượng ticket chỉ giúp xác định nơi cần ưu tiên xem xét, chưa đủ để quyết định giải pháp.

Trên CRM, Payment là nhóm lớn nhất nhưng gồm nhiều loại yêu cầu nghiệp vụ và chưa có dữ liệu root cause. Vì vậy, hướng phù hợp hiện tại là phân loại nguyên nhân và chuẩn hóa quy trình xử lý trước khi cân nhắc automation.

Trên LMS, ticket tập trung vào Enroll và quản lý lớp/giáo viên/học phần. Với Enroll, cần phân biệt vấn đề do thao tác, dữ liệu, quyền hay lỗi hệ thống; đồng thời không gộp quy trình LMS với CRM chỉ vì cùng tên nghiệp vụ.

Trên TMS, 90% ticket nằm ở chấm công hoặc lỗi hệ thống. Các ticket có cùng thời gian, khu vực và triệu chứng cần được kiểm tra theo hướng incident chung để tránh xử lý lặp lại.

Nhóm Login có đặc điểm khác: ticket rải trên nhiều hệ thống nhưng chuỗi kiểm tra support có tính lặp lại và điều kiện xử lý tương đối rõ. Vì vậy đây là nhóm phù hợp để tiếp tục sử dụng workflow automation. Việc đánh giá hiệu quả cần dựa trên tỷ lệ workflow xử lý hoàn toàn, tỷ lệ vẫn cần support can thiệp và thời gian xử lý thực tế.

Từ dữ liệu hiện tại, hướng ưu tiên là:

- Đo hiệu quả thực tế của workflow login đã triển khai.
- Xác định root cause của các nhóm có volume cao như Payment và Enroll trước khi chọn giải pháp.
- Bổ sung thông tin phạm vi cho ticket TMS để nhận diện incident.
- Chỉ sử dụng guide, form, routing hoặc automation khi nguyên nhân thực tế phù hợp với giải pháp đó.

Kết luận chính của báo cáo là:

Volume cho biết nên nhìn vào đâu; pattern cho biết support đang lặp lại việc gì; root cause cho biết vì sao ticket phát sinh. Chỉ sau khi xác định được ba yếu tố này mới nên lựa chọn giải pháp cải thiện.
