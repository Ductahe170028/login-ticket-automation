# Login Ticket Automation (Week 5 — Operating Engineer)

Tự động xử lý ticket **login issue** (Scenario 1). Chi tiết luồng: **`PLAN.md`**.

## Trạng thái code

| Module | Nội dung | Trạng thái |
|--------|----------|------------|
| 0 | Shared types | ✅ |
| 1 | `detectLoginIssue` | ✅ |
| 2 | `processLoginTicket` | ✅ |
| 2b | `resolveAutomationTag` + tag constants | ✅ |
| 3 | clients, utils, config (HTTP/Odoo) | 🔄 test Red (24), stub |
| 4 | mock-services HR/LMS | ⏳ |
| 5 | webhook + catch-up on startup | ⏳ |
| 6 | scripts demo E2E | ⏳ |
| 7 | Pattern report Odoo | ⏳ |

**Test:** `npm test` — automation + resolveAutomationTag pass; Module 3 Red (chờ implement).

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
npm start          # sau Module 5 (catch-up + webhook)
```

## Cấu trúc chính

```
src/
  automation/     detectLoginIssue, processLoginTicket, resolveAutomationTag, runTicketAutomation (M5)
  clients/        hr, lms, odoo (note + tags + list pending)
  constants/      automationTags
  config.ts
  server.ts       Module 5
tests/            automation/, clients/, config/, utils/
```

Xem `.env.example` — gồm `CATCHUP_DAYS` cho catch-up khi server khởi động lại.
