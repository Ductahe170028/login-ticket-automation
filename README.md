# Login Ticket Automation (Week 5 — Operating Engineer)

Tự động xử lý ticket **login issue** (Scenario 1). Chi tiết luồng: **`PLAN.md`**.

## Trạng thái code

| Module | Nội dung | Trạng thái |
|--------|----------|------------|
| 0 | Shared types | ✅ |
| 1 | `detectLoginIssue` | ✅ |
| 2 | `processLoginTicket` | ✅ |
| 2b | `resolveAutomationTag` + tag constants | ✅ |
| 3 | clients, utils, config (HTTP/Odoo) | ✅ |
| 4 | mock-services HR/LMS | ✅ |
| 5 | webhook + catch-up on startup | ✅ |
| 6 | scripts demo E2E | ✅ |
| 7 | Pattern report Odoo | ⏳ |

**Test:** `npm test` — 83 test pass.

**Chạy end-to-end (dev):**

```bash
npm run mock-api          # terminal 1 — HR/LMS giả
npm run dev               # terminal 2 — catch-up + webhook :3000
npm run send-webhook -- login-deactivated --id TICKET-12345   # terminal 3 — giả Odoo gửi webhook
```

Điền `ODOO_BASE_URL` + `ODOO_API_KEY` trong `.env` để ghi note/tag lên Odoo thật. Dùng `--id` trùng ticket ID trên Odoo.

### Script demo webhook (`npm run send-webhook`)

**Module 6** = giả lập bước Odoo bắn webhook, **không** thay catch-up khi server khởi động.

| Fixture | Kịch bản |
|---------|----------|
| `login-deactivated` | teacher — reactivate + reset |
| `login-active-reset` | active.user — chỉ reset |
| `login-terminated` | terminated — manual-review |
| `not-login-issue` | không phải login — bỏ qua |

```bash
npm run send-webhook                              # xem danh sách fixture
npm run send-webhook -- login-deactivated --id TICKET-12345
```


Xem `.env.example` — gồm URL API, đường dẫn endpoint, tag Odoo, keyword login, logger, `CATCHUP_DAYS`.

### Mock HR/LMS (`npm run mock-api`)

Một server Express, hai nhóm route (HR và LMS). Dùng khi chưa có API công ty thật.

| Email | HR | LMS | Kịch bản test |
|-------|----|-----|----------------|
| `teacher@mindx.edu.vn` | active | deactivated | Reactivate + reset password |
| `active.user@mindx.edu.vn` | active | active | Chỉ reset password |
| `terminated@mindx.edu.vn` | terminated | active | Escalate manual-review |
| `no-lms@mindx.edu.vn` | active | 404 | LMS không tồn tại |
| email khác | 404 | — | HR không tồn tại |

```bash
npm run mock-api   # terminal 1 — port MOCK_API_PORT (mặc định 4001)
```

## Luồng vận hành (tóm tắt)

```
[Bình thường]
Odoo ticket mới → POST /webhook/odoo-ticket → runTicketAutomation → tag Odoo

[Server vừa bật lại sau khi tắt]
catchUpPendingTickets() → quét ticket login chưa tag → xử lý → tag
→ rồi mới lắng nghe webhook
```

**Tag Odoo (support lọc queue):**

- `auto-resolved` — đã gửi mail reset/reactivate
- `manual-review` — escalate (terminated, not found, …)
- Không tag — `not_login_issue` hoặc chưa chạy automation

## Stack

TypeScript · Jest · axios · Express

## Chạy project

```bash
cp .env.example .env
npm install
npm test
npm run build
npm run mock-api   # sau Module 4
npm run dev          # catch-up + webhook (port PORT)
npm start            # production build
```

## Cấu trúc chính

```
fixtures/         ticket JSON demo (Module 6)
scripts/          sendWebhook.ts
src/
  automation/     detectLoginIssue, processLoginTicket, resolveAutomationTag, runTicketAutomation (M5)
  clients/        hr, lms, odoo (note + tags + list pending)
  constants/      automationTags
  config.ts
  server.ts       Module 5
tests/            automation/, clients/, config/, utils/
```

Xem `.env.example` — gồm `CATCHUP_DAYS` cho catch-up khi server khởi động lại.
