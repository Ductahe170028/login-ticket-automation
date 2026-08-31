# PLAN.md — Kế hoạch triển khai login-ticket-automation

> Đọc `EXPLANATION_RULES.md` trước khi làm/giải thích bất kỳ module nào ở đây.
> Mỗi module xong = 1 commit riêng.

---

## Thứ tự tổng quan và lý do

```
0. Shared types      -> mọi module cần nói chung 1 "ngôn ngữ" dữ liệu
1. detectLoginIssue   -> logic đơn giản nhất, làm nóng lại nhịp TDD
2. processLoginTicket -> lõi quyết định, TDD với client giả lập (chưa cần client thật)
3. clients/ + utils/  -> hiện thực hoá phần gọi ra ngoài đã "hứa" ở bước 2
4. mock-services/     -> dựng HR/LMS giả để clients có chỗ gọi thật
5. server + index     -> ráp webhook, nơi Odoo/script chạm vào hệ thống
6. scripts/ + fixtures -> công cụ demo tay, test end-to-end thủ công
7. Docs & pattern report -> deliverable ngày 1-2 của Week 5 (không phải code)
```

Lý do làm `processLoginTicket` (bước 2) **trước** khi có client thật (bước 3):
logic quyết định không cần biết HR API gọi bằng axios hay gì — nó chỉ cần biết
"gọi hàm X sẽ nhận lại kiểu dữ liệu Y". Nên có thể test đầy đủ bằng cách giả
lập (mock) các hàm client, viết xong logic mới quay lại code phần gọi API thật.

---

## Module 0 — Shared types (`src/types.ts`)

**Giải quyết:** nếu không định nghĩa trước, mỗi module tự đoán hình dạng dữ liệu
(ticket có field gì, HR trả về gì) — dễ lệch nhau khi ráp lại.

**Không cần TDD** (type không có hành vi để test).

**Việc làm:**

```ts
export interface Ticket {
  id: string;
  title: string;
  description: string;
  customerEmail: string;
}

export interface Employee {
  email: string;
  fullName: string;
  status: "active" | "terminated";
}

export interface LmsAccount {
  email: string;
  accountStatus: "active" | "deactivated";
  lastLoginDaysAgo: number;
}

export interface ProcessResult {
  handled: boolean;
  reason?: string;
  action?: string;
}
```

**Xong khi:** file tồn tại, `npx tsc --noEmit` không lỗi.

---

## Module 1 — `src/automation/detectLoginIssue.ts`

**Giải quyết:** lọc xem ticket có khả năng là login issue không, trước khi
tốn công gọi HR/LMS cho những ticket không liên quan.

**Input/Output:** `(ticket: Ticket) => boolean`

**Test cases cần viết trước (Red), file `tests/automation/unit/detectLoginIssue.test.ts`:**

1. Title chứa "đăng nhập" → `true`
2. Description chứa "mật khẩu" / "password" → `true`
3. Không chứa keyword nào (vd. ticket về dashboard chậm) → `false`
4. Viết hoa/thường khác nhau ("ĐĂNG NHẬP") → vẫn `true`
5. Description rỗng, title rỗng → `false`, không throw lỗi
6. Có tag `login` (kể cả khi title/description không có keyword) → `true`
7. Tag `LOGIN` viết hoa → vẫn `true`
8. Tag không liên quan (`exam`, `outage`) và không có keyword → `false`

**Xong khi:** 5 case trên pass bằng `npm test`.

---

## Module 2 — `src/automation/processLoginTicket.ts` (lõi)

**Giải quyết:** đây là "bộ não" — nhận ticket login, quyết định reactivate,
reset password, hay escalate, theo đúng `scenario-01-login-issue.md`.

**Phụ thuộc (chỉ cần khai báo kiểu hàm, chưa cần code thật):**

```ts
hrClient.getEmployeeStatus(email: string): Promise<Employee | null>
lmsClient.getAccountStatus(email: string): Promise<LmsAccount | null>
lmsClient.reactivateAccount(email: string): Promise<void>
lmsClient.resetPassword(email: string): Promise<{ tempPassword: string }>
odooClient.addInternalNote(ticketId: string, note: string): Promise<void>
emailSender.sendEmail(input: { to: string; subject: string; body: string }): Promise<void>
```

**Test cases cần viết trước (Red), file `tests/automation/unit/processLoginTicket.test.ts`,
dùng `jest.mock()` cho 4 module trên:**

1. Ticket không phải login issue → `{ handled: false, reason: "not_login_issue" }`,
   **không** gọi `hrClient` (assert `not.toHaveBeenCalled()`)
2. HR không tìm thấy nhân sự → gọi `addInternalNote`, trả `handled: false`
3. Nhân sự `terminated` → gọi `addInternalNote` escalate, **không** gọi `reactivateAccount`
   (đây là case quan trọng nhất — an toàn nghiệp vụ, phải test kỹ)
4. Nhân sự active nhưng không có account LMS → ghi note, `handled: false`
5. Nhân sự active + account `deactivated` → gọi `reactivateAccount` **và**
   `resetPassword`, gửi email, `handled: true`, `action: "reactivated_and_reset_password"`
6. Nhân sự active + account `active` → chỉ gọi `resetPassword`, **không** gọi
   `reactivateAccount`

**Xong khi:** 6 case trên pass, đặc biệt case 3 và 6 phải assert rõ hàm nguy hiểm
(`reactivateAccount`) không bị gọi nhầm.

---

## Module 3 — `src/clients/`, `src/utils/`, `src/config.ts`

**Giải quyết:** hiện thực hoá thật sự các hàm đã "hứa kiểu dữ liệu" ở Module 2 —
gọi HTTP thật (tới mock-services hoặc hệ thống thật sau này).

**Việc làm:**

- `src/config.ts` — đọc `.env` (base URL, API key cho HR/LMS/Odoo)
- `src/clients/hrClient.ts` — `getEmployeeStatus`
- `src/clients/lmsClient.ts` — `getAccountStatus`, `reactivateAccount`, `resetPassword`
- `src/clients/odooClient.ts` — `addInternalNote` (mock/log nếu chưa có Odoo API thật)
- `src/utils/emailSender.ts` — `sendEmail` (mock/log, chưa cần SMTP thật)
- `src/utils/logger.ts` — ghi log ra console + file

**Test (khuyến khích, không bắt buộc TDD nghiêm ngặt):** `tests/clients/unit/hrClient.test.ts`
dùng `jest.mock("axios")` — kiểm tra gọi đúng URL, đúng header `x-api-key`,
xử lý đúng khi API trả 404 (trả `null`, không throw).

**Xong khi:** các hàm export đúng chữ ký đã định nghĩa ở Module 2 (Module 2's
test vẫn pass khi build lại vì interface không đổi).

---

## Module 4 — `mock-services/`

**Giải quyết:** clients ở Module 3 cần một server thật để gọi thử (không chỉ
mock trong unit test) — vì chưa có quyền vào HR/LMS thật của công ty.

**Việc làm:**

- `mock-services/data.ts` — dữ liệu nhân sự + account giả (đủ 3 case: active
  account active, active account deactivated, terminated)
- `mock-services/server.ts` — Express, endpoint theo đúng hợp đồng Module 3:
  - `GET /hr/employees/:email`
  - `GET /lms/accounts/:email`
  - `POST /lms/accounts/:email/reactivate`
  - `POST /lms/accounts/:email/reset-password`
  - Middleware check header `x-api-key`

**Test:** không bắt buộc; có thể thêm 1-2 test nhẹ (401 khi sai key, 404 khi
không có email) nếu muốn chắc chắn.

**Xong khi:** chạy `npm run mock-api`, gọi thử bằng curl/Postman thấy đúng dữ liệu.

---

## Module 5 — `src/server.ts` + `src/index.ts`

**Giải quyết:** đây là nơi Odoo (hoặc script giả lập) thật sự "chạm" vào hệ
thống của bạn — nhận ticket, gọi Module 2 xử lý, trả kết quả.

**Việc làm:**

- `POST /webhook/odoo-ticket` — nhận body `Ticket`, validate field bắt buộc,
  gọi `processLoginTicket`, trả JSON kết quả
- `GET /health` — kiểm tra server sống
- `src/index.ts` — khởi động server, đọc `config.port`

**Test:** `tests/automation/integration/webhook.test.ts` dùng `supertest`,
gửi ticket mẫu, mock `processLoginTicket` hoặc chạy thật với mock-services.

**Xong khi:** `npm start` chạy, gọi webhook bằng curl thấy phản hồi đúng.

---

## Module 6 — `scripts/` + `fixtures/`

**Giải quyết:** công cụ demo tay — giả lập Odoo gửi một loạt ticket, để xem
toàn bộ luồng end-to-end chạy đúng mà không cần Odoo thật.

**Việc làm:**

- `fixtures/sample-tickets.json` — ticket mẫu, đủ nhánh (reactivate, terminated,
  reset-only, không phải login issue)
- `scripts/simulate-ticket.ts` — đọc fixtures, gửi lần lượt qua `axios.post`
  tới webhook, in kết quả

**Không cần test tự động** (theo `EXPLANATION_RULES.md` mục 20 — phần khung/
script demo không bắt buộc TDD).

**Xong khi:** chạy 3 terminal (`mock-api`, `start`, script) thấy 4 ticket mẫu
ra đúng kết quả kỳ vọng.

---

## Module 7 — Docs & pattern report (không phải code)

Đây là deliverable riêng của Week 5 (ngày 1–2 trong `docs/plans/week-5/tasks.md`):
report ticket pattern từ Odoo thật + doc phân tích. Làm sau khi automation
chạy ổn, không phụ thuộc code trong repo này.

---

## Checklist tiến độ

- [x] Module 0 — Shared types
- [x] Module 1 — detectLoginIssue (TDD)
- [ ] Module 2 — processLoginTicket (TDD)
- [ ] Module 3 — clients + utils + config
- [ ] Module 4 — mock-services
- [ ] Module 5 — server + index
- [ ] Module 6 — scripts + fixtures
- [ ] Module 7 — Docs & pattern report (Odoo thật)
