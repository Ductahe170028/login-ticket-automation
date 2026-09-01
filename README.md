# Login Ticket Automation

Tool tự động xử lý ticket **không đăng nhập được** trên Odoo Helpdesk.

Khi support nhận ticket kiểu “không đăng nhập được”, “quên mật khẩu”, tool sẽ:

1. Kiểm tra nhân viên trên hệ thống HR và tài khoản LMS
2. Kích hoạt lại hoặc đặt lại mật khẩu nếu cần
3. Gửi email hướng dẫn cho khách qua Odoo
4. Ghi chú nội bộ và gắn tag trên ticket (`auto-resolved` hoặc `manual-review`)

Support chỉ cần lọc ticket theo tag trên Odoo — không cần chạy lệnh terminal.

---

## Mục lục

- [Tool làm gì?](#tool-làm-gì)
- [Luồng hoạt động](#luồng-hoạt-động)
- [Yêu cầu](#yêu-cầu)
- [Cài đặt](#cài-đặt)
- [Cấu hình `.env`](#cấu-hình-env)
- [Chạy thử trên máy](#chạy-thử-trên-máy)
- [Kết nối Odoo thật + ngrok](#kết-nối-odoo-thật--ngrok)
- [Cấu hình Automation trên Odoo](#cấu-hình-automation-trên-odoo)
- [Các tình huống xử lý](#các-tình-huống-xử-lý)
- [Tag trên Odoo](#tag-trên-odoo)
- [Các lệnh hữu ích](#các-lệnh-hữu-ích)
- [Chạy test](#chạy-test)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Gặp lỗi thì xem đây](#gặp-lỗi-thì-xem-đây)

---

## Tool làm gì?

| Bước | Mô tả |
|------|--------|
| Nhận ticket | Odoo báo khi ticket sẵn sàng xử lý, hoặc tool tự quét lại khi bật server |
| Lọc ticket login | Chỉ xử lý ticket có từ khóa đăng nhập trong tiêu đề/mô tả, hoặc có tag `login` |
| Kiểm tra HR | Xác nhận email thuộc nhân viên còn làm việc |
| Kiểm tra LMS | Xem tài khoản đang hoạt động hay bị khóa |
| Xử lý | Kích hoạt lại + đặt mật khẩu mới, hoặc chỉ đặt mật khẩu mới |
| Thông báo | Gửi email tiếng Việt cho khách, ghi chú trên Odoo |
| Đánh dấu | Gắn tag để support biết ticket đã xong hay cần xem tay |

---

## Luồng hoạt động

### Khi support chuyển ticket sang "Đang xử lý"

```
Support tạo ticket trên Odoo
    → Kiểm tra lại thông tin
    → Kéo giai đoạn sang "Đang xử lý"
    → Odoo gửi tín hiệu cho tool
    → Tool đọc ticket, xử lý, gửi mail, gắn tag
```

### Khi server vừa bật lại

Nếu server tắt một lúc, một số ticket có thể bị bỏ sót.

Khi chạy `npm run dev` hoặc `npm start`, tool **tự quét** các ticket login trong 7 ngày gần nhất (có thể đổi trong `.env`) chưa được xử lý, rồi mới chờ nhận tín hiệu từ Odoo.

### Một ticket được xử lý thế nào?

```
Ticket vào
    → Đã có tag auto-resolved / manual-review? → Bỏ qua, không làm lại
    → Không phải ticket login? → Bỏ qua
    → Kiểm tra HR + LMS
    → Gửi email + ghi chú nội bộ
    → Gắn tag phù hợp
```

---

## Yêu cầu

- **Node.js** 18 trở lên
- **npm**
- Tài khoản **Odoo Helpdesk** (có API key)
- **ngrok** — chỉ cần khi test từ Odoo cloud về máy local (xem `docs/ODOO_WEBHOOK_SETUP.md`)

---

## Cài đặt

```bash
cd login-ticket-automation
npm install
cp .env.example .env    # rồi mở .env và điền thông tin Odoo
npm test
npm run build           # nếu chạy production
```

---

## Cấu hình `.env`

Copy từ `.env.example` và điền các mục quan trọng:

### Odoo (bắt buộc khi chạy thật)

```env
ODOO_BASE_URL=https://yourdb.odoo.com
ODOO_API_KEY=<api-key-từ-odoo>
ODOO_LOGIN=<email-đăng-nhập-odoo>
```

> Địa chỉ Odoo không có `/odoo` ở cuối.

### HR/LMS giả lập (khi chạy thử trên máy)

```env
HR_API_BASE_URL=http://localhost:4001
LMS_API_BASE_URL=http://localhost:4001
HR_API_KEY=demo-secret-key
LMS_API_KEY=demo-secret-key
MOCK_API_PORT=4001
```

### Bảo mật webhook (tùy chọn)

```env
WEBHOOK_SECRET=chuoi-bi-mat-cua-ban
```

Nếu bật, Odoo cần gửi kèm mã bí mật này trong header `x-webhook-secret`.

### Nhận diện ticket login

```env
LOGIN_KEYWORDS=đăng nhập,dang nhap,login,password,mật khẩu,mat khau
LOGIN_TAGS=login
```

### Tag sau khi xử lý

```env
TAG_AUTO_RESOLVED=auto-resolved
TAG_MANUAL_REVIEW=manual-review
CATCHUP_DAYS=7
```

Xem đầy đủ trong `.env.example`.

---

## Chạy thử trên máy

Cần **2 cửa sổ terminal** (3 cửa sổ nếu test qua ngrok).

### Terminal 1 — Giả lập HR + LMS

```bash
npm run mock-api
```

Chạy tại `http://localhost:4001`.

### Terminal 2 — Tool automation

```bash
npm run dev
```

- Tự quét ticket còn sót khi khởi động
- Chờ nhận tín hiệu từ Odoo tại `http://localhost:3000`
- Kiểm tra hoạt động: mở `http://localhost:3000/health` → thấy `{"ok":true}`

### Terminal 3 — Giả lập Odoo gửi tín hiệu (không cần Odoo thật)

```bash
npm run send-webhook -- login-deactivated --id 15 --email ducgioibvb5@gmail.com
```

### Email dùng để test

| Email | HR | LMS | Kết quả |
|-------|----|-----|---------|
| `ducgioibvb5@gmail.com` | đang làm | bị khóa | Kích hoạt lại + đặt mật khẩu mới + gửi mail |
| `active.user@mindx.edu.vn` | đang làm | hoạt động | Chỉ đặt mật khẩu mới |
| `terminated@mindx.edu.vn` | đã nghỉ | hoạt động | `manual-review` — cần xử lý tay |
| `no-lms@mindx.edu.vn` | đang làm | không có | `manual-review` — không tìm thấy LMS |
| email khác | không có | — | `manual-review` — không tìm thấy HR |

> Dữ liệu giả lập nằm trong bộ nhớ — tắt rồi bật lại `mock-api` sẽ reset trạng thái.

---

## Kết nối Odoo thật + ngrok

Odoo trên cloud không gọi được `localhost` trên máy bạn — cần **ngrok** để tạo đường dẫn public tạm thời.

| Terminal | Lệnh |
|----------|------|
| 1 | `npm run mock-api` |
| 2 | `npm run dev` |
| 3 | `ngrok http 3000` |

Đường dẫn gửi cho Odoo:

```
https://<tên-ngrok>.ngrok-free.dev/webhook/odoo-ticket
```

Odoo chỉ cần gửi mã số ticket — tool tự đọc đủ thông tin từ Odoo.

**Hướng dẫn chi tiết:** [`docs/ODOO_WEBHOOK_SETUP.md`](docs/ODOO_WEBHOOK_SETUP.md)

---

## Cấu hình Automation trên Odoo

### Vì sao không dùng "Khi tạo"?

Odoo **tự lưu** ticket khi bạn chuyển tab hoặc click chỗ khác — chưa cần bấm Lưu. Nếu automation chạy ngay "Khi tạo", mail có thể gửi sớm khi bạn còn đang soạn ticket.

**Nên dùng:** chạy automation khi ticket chuyển sang **Đang xử lý** — lúc support đã kiểm tra xong.

### Các bước (Odoo Studio)

1. Vào app **Hỗ trợ** → bật **Studio** → tab **Tự động hóa**
2. Tạo rule mới:
   - **Tên:** `Login ticket webhook`
   - **Mô hình:** `Phiếu hỗ trợ`
   - **Kích hoạt:** `Khi tạo và chỉnh sửa`
3. **Áp dụng cho** → **Sửa miền** → thêm:
   - `Giai đoạn` **bằng** `Đang xử lý`
4. **Thêm tác vụ** → **Gửi thông báo webhook**
   - **URL:** `https://<tên-ngrok>/webhook/odoo-ticket`
5. **Lưu** → **Đóng** Studio

### Quy trình support

```
Tạo ticket → điền đủ thông tin → kiểm tra lại
    → Kéo sang "Đang xử lý"
    → Tool tự xử lý và gửi mail
```

---

## Các tình huống xử lý

| Tình huống | Tool làm gì | Tag |
|------------|-------------|-----|
| Không phải ticket login | Bỏ qua | *(không gắn)* |
| Thiếu email khách | Ghi chú nội bộ | `manual-review` |
| Không tìm thấy nhân viên trên HR | Ghi chú nội bộ | `manual-review` |
| Nhân viên đã nghỉ việc | Ghi chú nội bộ | `manual-review` |
| Không có tài khoản LMS | Ghi chú nội bộ | `manual-review` |
| Tài khoản LMS bị khóa | Kích hoạt lại + đặt mật khẩu + gửi mail | `auto-resolved` |
| Tài khoản LMS đang hoạt động | Đặt mật khẩu mới + gửi mail | `auto-resolved` |

---

## Tag trên Odoo

| Tag | Ý nghĩa | Support làm gì |
|-----|---------|----------------|
| `auto-resolved` | Tool đã xử lý xong, mail đã gửi | Xác nhận với khách → đóng ticket |
| `manual-review` | Cần xử lý tay | Đọc ghi chú trên ticket |
| *(không có tag)* | Chưa chạy hoặc không phải ticket login | Tool sẽ quét lại khi bật server |

---

## Các lệnh hữu ích

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy tool (chế độ phát triển) |
| `npm start` | Chạy bản đã build |
| `npm run mock-api` | Bật HR/LMS giả lập |
| `npm run send-webhook` | Giả lập Odoo gửi tín hiệu |
| `npm test` | Chạy kiểm thử |
| `npm run build` | Build project |

### Kịch bản test với `send-webhook`

| Tên | Mô tả |
|-----|--------|
| `login-deactivated` | Tài khoản bị khóa → kích hoạt lại + đặt mật khẩu |
| `login-active-reset` | Tài khoản hoạt động → chỉ đặt mật khẩu |
| `login-terminated` | Nhân viên đã nghỉ |
| `not-login-issue` | Không phải ticket login → bỏ qua |

```bash
npm run send-webhook
npm run send-webhook -- login-deactivated --id 15 --email ducgioibvb5@gmail.com
```

---

## Chạy test

```bash
npm test
```

Hiện tại: **100 tests** pass.

---

## Cấu trúc thư mục

```
login-ticket-automation/
├── docs/ODOO_WEBHOOK_SETUP.md   # Hướng dẫn ngrok + Odoo
├── fixtures/tickets/            # Dữ liệu ticket mẫu để test
├── mock-services/               # HR/LMS giả lập
├── scripts/sendWebhook.ts       # Giả lập Odoo gửi tín hiệu
├── src/
│   ├── automation/              # Logic xử lý chính
│   ├── clients/                 # Kết nối HR, LMS, Odoo
│   ├── webhook/                 # Nhận tín hiệu từ Odoo
│   ├── server.ts                # Máy chủ web
│   └── index.ts                 # Khởi động tool
└── tests/
```

---

## Gặp lỗi thì xem đây

| Triệu chứng | Cách xử lý |
|-------------|------------|
| Port 3000 đã bị chiếm | Tắt process cũ hoặc đổi `PORT` trong `.env` |
| Odoo không gọi được tool | Kiểm tra ngrok còn chạy không; URL ngrok đổi mỗi lần restart |
| Lệnh `ngrok` không nhận | Đóng terminal, mở lại; hoặc chạy `ngrok update` |
| Báo lỗi 401 | Kiểm tra `WEBHOOK_SECRET` trong `.env` |
| Không tìm thấy ticket | Kiểm tra ID ticket và thông tin Odoo trong `.env` |
| Mail gửi quá sớm | Đổi automation: kích hoạt khi giai đoạn = **Đang xử lý** |
| Lỗi HR/LMS khi test local | Chạy `npm run mock-api` ở terminal riêng |
| Ticket đã xử lý vẫn nhận tín hiệu | Bình thường — tool sẽ bỏ qua nếu đã có tag |

---

## Tài liệu thêm

- [`docs/ODOO_WEBHOOK_SETUP.md`](docs/ODOO_WEBHOOK_SETUP.md) — Cài ngrok và cấu hình webhook Odoo từng bước
