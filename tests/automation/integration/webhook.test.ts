import request from "supertest";

jest.mock("../../../src/automation/runTicketAutomation");

import { runTicketAutomation } from "../../../src/automation/runTicketAutomation";
import { createApp } from "../../../src/server";

const mockedRunTicketAutomation = jest.mocked(runTicketAutomation);

const validTicket = {
  id: "TICKET-202",
  title: "Không đăng nhập được LMS",
  description: "Quên mật khẩu",
  customerEmail: "teacher@mindx.edu.vn",
  tags: ["login"],
};

describe("webhook server", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /health → 200", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it("POST /webhook/odoo-ticket thiếu field → 400", async () => {
    const response = await request(app)
      .post("/webhook/odoo-ticket")
      .send({ id: "TICKET-1" });

    expect(response.status).toBe(400);
    expect(mockedRunTicketAutomation).not.toHaveBeenCalled();
  });

  it("POST /webhook/odoo-ticket hợp lệ → gọi runTicketAutomation", async () => {
    mockedRunTicketAutomation.mockResolvedValue({
      handled: true,
      action: "reset_password",
    });

    const response = await request(app)
      .post("/webhook/odoo-ticket")
      .send(validTicket);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      result: { handled: true, action: "reset_password" },
    });
    expect(mockedRunTicketAutomation).toHaveBeenCalledWith(validTicket);
  });

  it("runTicketAutomation throw → 500", async () => {
    mockedRunTicketAutomation.mockRejectedValue(new Error("HR down"));

    const response = await request(app)
      .post("/webhook/odoo-ticket")
      .send(validTicket);

    expect(response.status).toBe(500);
  });
});
