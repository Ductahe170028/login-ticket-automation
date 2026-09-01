# PLAN.md — Kế hoạch triển khai login-ticket-automation

> Đọc `EXPLANATION_RULES.md` trước khi làm/giải thích bất kỳ module nào ở đây.
> Mỗi module xong = 1 commit riêng.
> **Luồng vận hành đã chốt** — code theo PLAN này, không bàn lại quy trình.

---

## Luồng vận hành (đã chốt)

### Trigger chính: Webhook (Week 5 docs)

Server automation **chạy nền** (`npm start` trên VM/container, không phải support mở terminal).
Odoo gửi `POST /webhook/odoo-ticket` **ngay khi có ticket mới** → xử lý từng ticket.

**Không** dùng browser extension. **Không** quét thủ công khi support nhớ chạy.

### Catch-up khi server bật lại (bù ticket miss)

Nếu server tắt, webhook fail → ticket tích lũy trên Odoo **chưa được automation xử lý**.

Khi `npm start` lần tiếp theo, **trước khi** lắng nghe webhook:

1. Gọi `odooClient.listPendingLoginTickets(catchUpDays)` — ticket login **chưa có**
   tag `auto-resolved` hoặc `manual-review` (trong `CATCHUP_DAYS` ngày gần nhất, mặc định 7)
2. Với mỗi ticket → `runTicketAutomation(ticket)` (xem dưới)
3. Sau catch-up xong → mở webhook listener bình thường

### Một ticket đi qua automation như thế nào

```
Ticket (webhook hoặc catch-up)
    ↓
Đã có tag auto-resolved / manual-review? ──YES──→ Bỏ qua (idempotent)
    ↓ NO
processLoginTicket(ticket)          ← Module 2: logic quyết định
    ↓
resolveAutomationTag(result)        ← Module 2b: map → tag Odoo
    ↓
not_login_issue? ──YES──→ Dừng (không gắn tag, không note bắt buộc thêm)
    ↓ NO
addInternalNote (đã gọi trong processLoginTicket)
addTagsToTicket(tag)                ← Module 3 odooClient
```

### Tag Odoo — support lọc queue (không đọc terminal)

| Tag | Khi nào | Support hiểu |
|-----|---------|--------------|
| `auto-resolved` | `handled: true` — reset/reactivate + email đã gửi | Automation xong; confirm user → đóng ticket |
| `manual-review` | Login issue nhưng escalate (`handled: false`, mọi reason trừ `not_login_issue`) | Cần xử lý tay; đọc internal note |
| *(không tag)* | `not_login_issue` hoặc chưa chạy automation | Catch-up sẽ pick ticket login chưa tag |

Hằng số: `src/constants/automationTags.ts`. Helper: `src/automation/resolveAutomationTag.ts`.

### Ai làm gì

| Vai trò | Việc |
|---------|------|
| Dev/infra | Server luôn bật, health check, log |
| Odoo admin | Cấu hình webhook → URL server |
| Support | Lọc Odoo theo tag; **không** chạy `npm start` |

---

## Thứ tự tổng quan và lý do

```
0. Shared types       -> "ngôn ngữ" dữ liệu chung
1. detectLoginIssue    -> lọc ticket login
2. processLoginTicket  -> logic quyết định (TDD)
2b. resolveAutomationTag + constants -> map kết quả → tag Odoo
3. clients/ + utils/   -> HTTP thật (HR, LMS, Odoo, email, logger)
4. mock-services/      -> HR/LMS giả
5. server + runner     -> webhook + catch-up on startup + gắn tag
6. scripts/ + fixtures -> demo E2E (giả lập Odoo gửi webhook)
7. Docs & pattern report -> Week 5 ngày 1-2 (ngoài repo)
```

---

## Module 0 — Shared types (`src/types.ts`) ✅

**Xong khi:** `Ticket`, `Employee`, `LmsAccount`, `ProcessResult` tồn tại; `Ticket.tags?` optional.

---

## Module 1 — `detectLoginIssue` ✅

**Test:** 8 case — keyword, tag `login`, false positive tag `LMS` only.

---

## Module 2 — `processLoginTicket` ✅

**Test:** 13 case (+ `it.each`) — lọc sớm, validate email, HR/LMS, 2 happy path, thứ tự gọi.

**Lưu ý:** Module 2 **chưa** gắn tag Odoo — để Module 5 `runTicketAutomation` làm sau
`processLoginTicket` (tránh duplicate logic).

---

## Module 2b — Tag mapping (`resolveAutomationTag`) ✅

- `src/constants/automationTags.ts`
- `src/automation/resolveAutomationTag.ts`
- **Test:** `tests/automation/unit/resolveAutomationTag.test.ts`

---

## Module 3 — `clients/`, `utils/`, `config.ts` ✅

**Giải quyết:** hiện thực HTTP + Odoo API (note, tag, list pending).

**Hợp đồng HTTP HR/LMS (khớp Module 4):**

| Client | Method | Endpoint | Ghi chú |
|--------|--------|----------|---------|
| hrClient | GET | `/hr/employees/:email` | 404 → `null` |
| lmsClient | GET | `/lms/accounts/:email` | 404 → `null` |
| lmsClient | POST | `/lms/accounts/:email/reactivate` | lỗi → throw |
| lmsClient | POST | `/lms/accounts/:email/reset-password` | trả `{ tempPassword }` |

**Hợp đồng Odoo (Module 3):**

| Hàm | Mô tả |
|-----|--------|
| `addInternalNote(ticketId, note)` | POST note nội bộ |
| `addTagsToTicket(ticketId, tags)` | POST gắn tag (không duplicate nếu đã có) |
| `listPendingLoginTickets(sinceDays?)` | GET ticket login, **không** có `auto-resolved` / `manual-review` |

Endpoint tham khảo: `POST /api/tickets/:id/notes`, `POST /api/tickets/:id/tags`,
`GET /api/tickets/pending-login?sinceDays=7` (mock Module 4 có thể mirror).

**Config (`.env`):**

- `PORT`, `HR_*`, `LMS_*`, `ODOO_*`
- `CATCHUP_DAYS=7` — lookback catch-up

**Việc làm:**

- `src/config.ts` — đọc `.env`, trim trailing slash, defaults
- `src/clients/hrClient.ts`, `lmsClient.ts`
- `src/clients/odooClient.ts` — 3 hàm trên
- `src/utils/emailSender.ts`, `src/utils/logger.ts`

**Test (24 case — Red phase đã viết):**

- `tests/config/config.test.ts` (4) — thêm case `CATCHUP_DAYS` default 7 khi implement
- `tests/clients/unit/hrClient.test.ts` (5)
- `tests/clients/unit/lmsClient.test.ts` (8)
- `tests/clients/unit/odooClient.test.ts` (2) — **mở rộng thêm** test `addTagsToTicket`, `listPendingLoginTickets` khi implement
- `tests/utils/unit/emailSender.test.ts` (2)
- `tests/utils/unit/logger.test.ts` (3)

**Xong khi:** 24+ test Module 3 pass; test Module 1–2 vẫn pass.

---

## Module 4 — `mock-services/` ✅

HR/LMS giả trên **một server** (`npm run mock-api`), path đọc từ `.env` (`HR_EMPLOYEES_PATH`, `LMS_ACCOUNTS_PATH`).
Không mock Odoo — dùng Odoo test thật.

**Việc làm:**

- `mock-services/server.ts` — Express, port `MOCK_API_PORT`
- `mock-services/routes/hrRoutes.ts`, `lmsRoutes.ts` — mount path từ `config`
- `mock-services/fixtures.ts` — email demo (teacher, active.user, terminated, no-lms)
- `mock-services/store.ts` — in-memory; `reactivate` đổi `accountStatus` thật
- `tests/mock-services/mockApi.integration.test.ts` (5 case)

**Xong khi:** `npm run mock-api` chạy được; `npm test` 64 pass; clients + mock dùng chung path từ `.env`.

---

## Module 5 — `server.ts`, `index.ts`, `runTicketAutomation` ⏳

**Giải quyết:** webhook + catch-up + orchestration (note đã có trong Module 2, **tag ở đây**).

**Việc làm:**

- `src/automation/runTicketAutomation.ts`:
  - Skip nếu ticket đã có tag processed
  - Gọi `processLoginTicket`
  - `resolveAutomationTag` → `addTagsToTicket` nếu không null
  - Trả `ProcessResult`
- `src/server.ts`:
  - `POST /webhook/odoo-ticket` — body `Ticket`, validate, `runTicketAutomation`
  - `GET /health`
- `src/index.ts`:
  1. `await catchUpPendingTickets()` — loop `listPendingLoginTickets` + `runTicketAutomation`
  2. `app.listen(config.port)`

**Test:** `tests/automation/integration/webhook.test.ts` (supertest);
test catch-up: mock `listPendingLoginTickets` trả 2 ticket → cả 2 được xử lý + tag.

**Xong khi:** `npm start` → catch-up log → webhook nhận ticket mới → tag đúng trên Odoo (hoặc mock).

---

## Module 6 — `scripts/` + `fixtures/` ⏳

Giả lập Odoo POST webhook (không thay catch-up production).

---

## Module 7 — Pattern report (Odoo thật) ⏳

---

## Checklist tiến độ

- [x] Module 0 — Shared types
- [x] Module 1 — detectLoginIssue
- [x] Module 2 — processLoginTicket
- [x] Module 2b — resolveAutomationTag + constants
- [x] Module 3 — clients + utils + config (59 test)
- [x] Module 4 — mock-services HR/LMS (64 test tổng)
- [ ] Module 5 — server + webhook + catch-up + runTicketAutomation
- [ ] Module 6 — scripts + fixtures
- [ ] Module 7 — Docs & pattern report
