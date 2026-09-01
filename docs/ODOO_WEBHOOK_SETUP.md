# Cấu hình Webhook Odoo + ngrok

Odoo cloud gọi tool automation khi có ticket Helpdesk mới. Tool chỉ cần `_id` — tự đọc đủ thông tin ticket qua JSON-RPC.

## Chuẩn bị (3 terminal)

| Terminal | Lệnh |
|----------|------|
| 1 | `npm run mock-api` |
| 2 | `npm run dev` (port `3000`) |
| 3 | `ngrok http 3000` |

## Bước 1 — Cài ngrok (một lần)

1. Tải: https://ngrok.com/download
2. Đăng ký tài khoản miễn phí → lấy **authtoken**
3. Chạy:

```powershell
ngrok config add-authtoken <AUTHTOKEN_CUA_BAN>
```

4. Kiểm tra: `ngrok version`

## Bước 2 — Chạy tunnel

```powershell
ngrok http 3000
```

Copy URL dạng `https://xxxx.ngrok-free.app` → webhook URL:

```
https://xxxx.ngrok-free.app/webhook/odoo-ticket
```

Test nhanh (PowerShell):

```powershell
curl https://xxxx.ngrok-free.app/health
```

Kết quả: `{"ok":true}`

## Bước 3 — (Khuyến nghị) Secret header

Trong `.env`:

```env
WEBHOOK_SECRET=dat-mot-chuoi-bi-mat-dai
```

Odoo automation cần gửi header `x-webhook-secret` cùng giá trị (xem bước 5 nếu dùng Python).

## Bước 4 — Automation trên Odoo

1. Bật **Developer mode**: Settings → General Settings → Developer Tools
2. Vào **Settings → Technical → Automation → Automation Rules** (hoặc Studio → Automations)
3. **New**:
   - **Name:** `Login ticket → automation webhook`
   - **Model:** `Helpdesk Ticket` (`helpdesk.ticket`)
   - **Trigger:** `On Creation`
4. Tab **Actions** → **Add an action**:
   - Chọn **Send Webhook Notification** (nếu có)

### Nếu có "Send Webhook Notification"

| Field | Giá trị |
|-------|---------|
| URL | `https://xxxx.ngrok-free.app/webhook/odoo-ticket` |
| Fields | Chỉ cần mặc định (`_id`, `_model`) — tool tự fetch ticket |

### Nếu KHÔNG có "Send Webhook" (trial cũ) — dùng Execute Code

Action type: **Execute Code** (chỉ khi Odoo cho phép `requests`):

```python
import json
import urllib.request

url = "https://xxxx.ngrok-free.app/webhook/odoo-ticket"
payload = json.dumps({"_id": record.id, "_model": "helpdesk.ticket"}).encode("utf-8")
req = urllib.request.Request(
    url,
    data=payload,
    headers={
        "Content-Type": "application/json",
        "x-webhook-secret": "dat-mot-chuoi-bi-mat-dai",  # bỏ dòng này nếu không dùng WEBHOOK_SECRET
    },
    method="POST",
)
urllib.request.urlopen(req, timeout=30)
```

> Nếu Odoo chặn `urllib`/`requests`, dùng catch-up (`npm run dev` khi có ticket mới) hoặc hỏi admin bật Send Webhook.

5. **Save** và bật rule (Active).

## Bước 5 — Test end-to-end

1. `mock-api` + `dev` + `ngrok` đang chạy
2. Tạo ticket mới trên Odoo Helpdesk:
   - Tiêu đề có từ khóa login
   - Email khách = email trong mock fixtures (`ducgioibvb5@gmail.com`)
3. Vài giây sau kiểm tra:
   - Terminal `npm run dev` — log xử lý ticket
   - Odoo — tag `auto-resolved` hoặc `manual-review`, ghi chú nội bộ

### Test không cần Odoo (giả webhook)

```bash
npm run send-webhook -- login-deactivated --id 15 --email ducgioibvb5@gmail.com
```

### Test payload giống Odoo thật

```powershell
curl -X POST http://localhost:3000/webhook/odoo-ticket `
  -H "Content-Type: application/json" `
  -d "{\"_id\": 15, \"_model\": \"helpdesk.ticket\"}"
```

## Lưu ý vận hành

- **ngrok free:** URL đổi mỗi lần chạy lại → cập nhật lại URL trong Odoo automation
- **Catch-up:** Server tắt → ticket miss → lần `npm run dev` sau vẫn quét lại (backup)
- **Idempotent:** Ticket đã có tag `auto-resolved` / `manual-review` → bỏ qua

## Sự cố thường gặp

| Triệu chứng | Cách xử lý |
|-------------|------------|
| Odoo không gọi được | Kiểm tra ngrok URL, rule Active, tạo ticket **mới** |
| 401 Unauthorized | Khớp `WEBHOOK_SECRET` và header `x-webhook-secret` |
| 404 ticket not found | `id` trong webhook = số ticket Odoo; kiểm tra `ODOO_*` trong `.env` |
| Automation chạy nhưng HR lỗi | `mock-api` có đang chạy không? |
