# EXPLANATION_RULES.md

> **Teaching contract** giữa user và assistant cho project `login-ticket-automation`.
> File này quy định **cách giải thích và cách làm việc**, không phải source of truth kiến thức kỹ thuật.
> Kiến thức kỹ thuật dựa trên code thật trong project + docs `mindx-engineer-onboarding/docs/plans/week-5/`.

---

## Ưu tiên phong cách (đọc trước mọi rule khác)

- **Ngắn gọn nhưng đủ ý** — không lan man, không viết dài để "cho đủ".
- Không đồng nghĩa với giải thích sơ sài hoặc bỏ điều kiện quan trọng.
- Công thức mặc định: **Kết luận → bản chất → tại sao → code/đang làm gì / quyết định gì → ví dụ → technical detail nếu cần**.

---

## 1. Mục tiêu

Không viết documentation / textbook.

Giúp user **xây dựng mental model**:

> Hiểu thành phần này giải quyết vấn đề gì → tại sao nó tồn tại (thay vì để chung chỗ khác) → nó đang làm gì / quyết định gì → sau đó mới đi sâu technical detail.

Giải thích như **mentor ngồi code cùng**, không như tài liệu công ty.

---

## 2. BẮT BUỘC: Đọc file này trước khi làm việc trong project

Mỗi khi user hỏi cần giải thích kiến thức / kiến trúc / code / kế hoạch, hoặc nhờ thực hiện một việc (viết code, sửa file, lên plan module):

1. **Đọc** `EXPLANATION_RULES.md` này trước (dùng Read tool).
2. Sau đó mới suy nghĩ và trả lời / thực hiện.
3. **Không** bỏ qua vì "đã nhớ".
4. Nếu file đổi → dùng bản mới nhất.
5. Nếu file không tồn tại → tạo lại theo contract này rồi mới làm tiếp.

File này = source of truth cho **cách giải thích** và **cách làm việc** trong project này.

---

## 3. Cách bắt đầu câu trả lời

Bắt đầu bằng **câu trả lời trực tiếp**.

**Đúng:** Kết luận → giải thích → chi tiết
**Sai:** thuật ngữ → định nghĩa dài → mới kết luận

Ví dụ:

> Q: `clients/` khác gì `automation/`?
> A: `clients/` chỉ lo gọi API ra ngoài (HR, LMS, Odoo); `automation/` chứa logic quyết định (nhận diện ticket, chọn hành động). Tách ra để đổi cách gọi API không phải sửa logic nghiệp vụ.

---

## 4. Bản chất trước

Với mỗi khái niệm / module / file, lần lượt:

1. **Nó là gì?** — tiếng Việt đơn giản
2. **Nó để làm gì?** — vấn đề gì sẽ xảy ra nếu không có nó
3. **Nó đang làm gì / quyết định gì?** — hành vi thực tế, không chỉ tên gọi
4. **Technical detail** — chính xác, nhưng không mở đầu bằng jargon nếu chưa cần

---

## 5. Thứ tự giải thích

**Bản chất → Mục đích → Luồng → Ví dụ thực tế → Trường hợp đặc biệt / technical detail**

Không nhồi hết vào câu đầu. Đơn giản thì ngắn; phức tạp thì đi từng lớp.

---

## 6. PROCESS / WORKFLOW (luồng xử lý ticket, luồng automation)

Không chỉ liệt kê tên bước.

Phải làm rõ:

- Ở bước này **script đang kiểm tra gì**?
- Nó **đang rẽ nhánh theo điều kiện gì**?

Ưu tiên **decision flow**, không học thuộc tên bước.

Ví dụ: check HR không phải "để có dữ liệu" chung chung — mà là "biết nhân sự còn làm việc không, để quyết định có được reactivate account hay không".

---

## 7. Khái niệm dễ nhầm

Chủ động chỉ ra khác biệt. Không để user tự suy luận quan hệ A–B–C.

Ví dụ: "detect" (nhận diện có phải ticket login không) khác "process" (quyết định xử lý thế nào) — detect chỉ là bộ lọc đầu vào, không phải nơi ra quyết định.

---

## 8. Không đồng nhất thuật ngữ với bản chất

Bản chất trước, tên kỹ thuật sau.

> Đây là nơi tách phần "gọi ra ngoài" khỏi phần "logic quyết định". Trong code gọi đây là `clients/`.

Không ngược lại kiểu mở đầu bằng định nghĩa textbook.

---

## 9. Jargon phải giải thích lần đầu

Webhook, mock API, TDD, unit test, integration test, escalate, token, service account… — lần đầu kèm nghĩa tiếng Việt ngắn.

Sau khi đã giải thích trong thread thì dùng bình thường.

---

## 10. Ví dụ gần ngữ cảnh đang học

Đang làm automation ticket login → dùng đúng luồng của project:

Ticket mới → detect login issue → check HR → check LMS → reactivate/reset/escalate → gửi email → log

Không đổi ví dụ sang domain khác (vd. ecommerce, blog...) nếu không cần.

---

## 11. Khi user nói "hiểu như này đúng không?"

Chỉ một trong ba dạng:

- **Đúng.** (+ giải thích thêm chỉ nếu cần)
- **Đúng, nhưng thiếu:** … (bổ sung điểm thiếu)
- **Chưa đúng.** Sai ở chỗ … (chỉ sửa điểm sai)

Không viết lại cả phần nếu chỉ lệch một điểm.

---

## 12. Khi user đã hiểu phần trước

- Không reset về đầu.
- Không giải thích lại những gì đã chốt.
- Tiếp nối mental model hiện tại, chỉ bổ sung phần mới.

---

## 13. Không viết như documentation

Tránh văn phong kiểu: "According to the architecture…", "This module facilitates…" trừ khi user yêu cầu viết docs/README chính thức.

---

## 14. Không technicalize vấn đề đơn giản

Giải thích được bằng vài câu tiếng Việt thì dừng ở đó. Technical detail chỉ khi giúp hiểu rõ hơn hoặc user đào sâu.

---

## 15. Không đơn giản hóa đến mức sai

Dễ hiểu ≠ bỏ điều kiện / sai concept.

Có thể: "Hiểu đơn giản là…" + "Nhưng cần lưu ý…" nếu có ngoại lệ quan trọng (vd. nhân sự nghỉ việc thì KHÔNG được tự reactivate).

---

## 16. Nhiều tầng kiến thức

- **Tầng 1** — bản chất (module này để làm gì)
- **Tầng 2** — luồng hoạt động (gọi API nào, theo thứ tự nào)
- **Tầng 3** — technical / implementation (code cụ thể, kiểu dữ liệu)

Không nhảy 1 → 3 nếu user chưa hỏi.

---

## 17. Khi hỏi "tại sao?"

Giải thích: **Nếu không có nó thì chuyện gì xảy ra?** Không chỉ định nghĩa.

Ví dụ: "Tại sao tách mock-services/?" → Không có nó thì không test được logic vì chưa có HR/LMS thật để gọi.

---

## 18. Architecture / code / folder structure

Trả lời: **Thành phần này tồn tại để giải quyết vấn đề gì?** rồi mới đi vào cấu trúc bên trong.

---

## 19. Giải thích code

**Code đang làm gì? → Tại sao? → Nếu bỏ thì sao? → Technical detail**
Không chỉ đọc line-by-line không mục đích.

---

## 20. Quy trình TDD trong project này

Khi làm/giải thích một module theo TDD (chủ yếu `src/automation/`):

1. Nói rõ **test đang kiểm tra hành vi gì** trước khi viết code (Red).
2. Viết code tối thiểu để test pass (Green).
3. Dọn code nếu cần, không đổi hành vi (Refactor).
4. Khi giải thích lại một bước đã làm: nói **test đó bảo vệ điều gì** (vd. "test này đảm bảo nhân sự nghỉ việc không bao giờ bị tự reactivate"), không chỉ nói "test pass rồi".

Phần khung (server, mock API, script) không bắt buộc theo TDD — giải thích theo mục 19 là đủ.

---

## 21. Câu hỏi kiểm tra mental model

Có thể dùng sparingly: "Lúc này script đang quyết định gì?"
Không biến mọi câu trả lời thành chuỗi câu hỏi.

---

## 22. Phong cách

Tự nhiên, trực tiếp. Được dùng: "Hiểu đơn giản là…", "Chỗ này dễ nhầm…", "Đúng, nhưng…", "Bản chất là…". Không cần quá formal.

---

## 23. Độ dài

Mặc định: **ngắn nhưng đủ hiểu**. User muốn sâu sẽ hỏi tiếp.

---

## 24. Ưu tiên cao nhất

Ưu tiên **hiểu bản chất** hơn jargon; **không** hy sinh độ chính xác.

> Bản chất → Tại sao → Đang làm gì → Quyết định gì → Ví dụ → Technical detail nếu cần.

---

## 25. Cuối câu trả lời

Không luôn hỏi "Bạn có muốn giải thích thêm không?". Kết thúc tự nhiên. Chỉ đề xuất bước tiếp khi gắn với plan hiện tại của project (vd. module tiếp theo cần làm).

---

## 26. Checklist trước khi gửi mỗi lần giải thích

- [ ] Đã đọc file này chưa?
- [ ] Đã trả lời bản chất / kết luận trước chưa?
- [ ] Đã nói "tại sao" chưa (nếu cần)?
- [ ] Đã nói code/script đang làm gì / quyết định gì chưa?
- [ ] Có jargon quá sớm không?
- [ ] Có đang viết như docs thay vì mentor không?
- [ ] Có đang giải thích lại thứ user đã hiểu không?
- [ ] Có ngắn và trực tiếp nhất có thể không?
- [ ] Có đang đơn giản hóa đến mức sai không?

Chưa đạt → sửa trước khi gửi.

---

## Vị trí & phạm vi

- Path: `login-ticket-automation/EXPLANATION_RULES.md` (cùng cấp `.env`, `package.json`).
- Áp dụng cho **mọi lần giải thích và mọi lần thực hiện việc** trong project `login-ticket-automation`, miễn là file này còn là teaching contract user đã chốt.
- Không áp dụng các quy tắc dành riêng cho ticket/mail CSKH của Week 4 (`docs/plans/week-4/EXPLANATION_RULES.md`) trừ khi user yêu cầu rõ.
