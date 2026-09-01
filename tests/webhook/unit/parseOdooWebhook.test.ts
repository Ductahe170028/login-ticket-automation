import {
  extractOdooTicketId,
  isFullTicketPayload,
  resolveWebhookTicket,
  TicketNotFoundError,
  WebhookPayloadError,
} from "../../../src/webhook/parseOdooWebhook";

jest.mock("../../../src/clients/odooClient", () => ({
  getTicketById: jest.fn(),
}));

import { getTicketById } from "../../../src/clients/odooClient";

const mockedGetTicketById = jest.mocked(getTicketById);

const fullTicket = {
  id: "15",
  title: "Không đăng nhập được LMS",
  description: "Lỗi password",
  customerEmail: "teacher@mindx.edu.vn",
  tags: ["login"],
};

describe("parseOdooWebhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("isFullTicketPayload — nhận payload đủ field", () => {
    expect(isFullTicketPayload(fullTicket)).toBe(true);
    expect(isFullTicketPayload({ id: "1" })).toBe(false);
  });

  it("extractOdooTicketId — Odoo Send Webhook mặc định gửi _id", () => {
    expect(extractOdooTicketId({ _id: 15, _model: "helpdesk.ticket" })).toBe(
      "15"
    );
    expect(extractOdooTicketId({ id: "99" })).toBe("99");
    expect(extractOdooTicketId({ id: "TICKET-1" })).toBeNull();
  });

  it("resolveWebhookTicket — payload đủ field → trả luôn", async () => {
    const result = await resolveWebhookTicket(fullTicket);

    expect(result).toEqual(fullTicket);
    expect(mockedGetTicketById).not.toHaveBeenCalled();
  });

  it("resolveWebhookTicket — chỉ có _id → fetch Odoo", async () => {
    mockedGetTicketById.mockResolvedValue(fullTicket);

    const result = await resolveWebhookTicket({ _id: 15 });

    expect(mockedGetTicketById).toHaveBeenCalledWith("15");
    expect(result).toEqual(fullTicket);
  });

  it("resolveWebhookTicket — payload lỗi → WebhookPayloadError", async () => {
    await expect(resolveWebhookTicket({ foo: "bar" })).rejects.toBeInstanceOf(
      WebhookPayloadError
    );
  });

  it("resolveWebhookTicket — ticket không tồn tại → TicketNotFoundError", async () => {
    mockedGetTicketById.mockResolvedValue(null);

    await expect(resolveWebhookTicket({ _id: 404 })).rejects.toBeInstanceOf(
      TicketNotFoundError
    );
  });
});
