# Login Ticket Automation (Week 5 — Operating Engineer)

> **Trạng thái:** Skeleton — chỉ có cấu trúc thư mục + config, chưa có logic.
> Sẽ code dần theo plan, mỗi module hoàn thành sẽ commit riêng.

Tự động xử lý ticket **login issue** (Scenario 1), theo tư duy Operating
Engineer: automation/workaround nhanh, không sửa code core LMS.

Bám theo:
`mindx-engineer-onboarding/docs/plans/week-4/scenarios/scenario-01-login-issue.md`
`mindx-engineer-onboarding/docs/plans/week-5/tasks.md`

## Stack

- **TypeScript** — nhất quán với `ticket-manager-cli`, an toàn hơn khi
  dữ liệu đi qua nhiều API (HR, LMS, Odoo).
- **Jest + ts-jest** — viết theo TDD cho phần logic quyết định
  (`src/automation/`), phần khung (server, mock API) test tay là đủ.

## Cấu trúc thư mục (skeleton)

```
login-ticket-automation/
├── src/
│   ├── automation/     # Logic nhận diện + quyết định xử lý ticket login
│   ├── clients/        # Gọi HR API, LMS API, Odoo API
│   └── utils/          # logger, gửi email, helper dùng chung
├── mock-services/      # Mock HR + LMS API (giả lập hệ thống thật để test)
├── fixtures/           # Dữ liệu ticket mẫu dùng cho test/demo
├── scripts/            # Script chạy tay (vd. giả lập Odoo gửi webhook)
├── tests/
│   ├── automation/
│   │   ├── unit/         # Test logic quyết định (TDD ở đây)
│   │   └── integration/  # Test luồng end-to-end với mock API
│   └── clients/
│       └── unit/
└── logs/                # File log tự sinh khi chạy (không commit)
```

## Kế hoạch tiếp theo

Chưa code — sẽ lên plan chi tiết từng module trước khi làm, theo thứ tự
dự kiến (sẽ chốt cùng nhau):

1. `src/automation/detectLoginIssue` — nhận diện ticket login (TDD trước)
2. `src/automation/processLoginTicket` — logic quyết định chính (TDD trước)
3. `mock-services/` — API giả lập HR/LMS để test được logic ở trên
4. `src/clients/` — client gọi HR/LMS/Odoo
5. `src/server` — webhook Express nhận ticket từ Odoo
6. `scripts/` — mô phỏng Odoo gửi ticket để test end-to-end
