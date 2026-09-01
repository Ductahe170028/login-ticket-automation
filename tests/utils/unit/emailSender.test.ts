const mockSendCustomerEmail = jest.fn();
const mockIsOdooRpcConfigured = jest.fn();

jest.mock("../../../src/clients/odooClient", () => ({
  sendCustomerEmail: (...args: unknown[]) => mockSendCustomerEmail(...args),
}));

jest.mock("../../../src/clients/odooRpc", () => ({
  isOdooRpcConfigured: () => mockIsOdooRpcConfigured(),
}));

jest.mock("../../../src/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

import { sendEmail } from "../../../src/utils/emailSender";
import { logger } from "../../../src/utils/logger";

const mockedLoggerInfo = jest.mocked(logger.info);

describe("emailSender.sendEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsOdooRpcConfigured.mockReturnValue(false);
    mockSendCustomerEmail.mockResolvedValue(undefined);
  });

  it("Odoo chưa cấu hình → log mock, không gọi Odoo", async () => {
    const input = {
      ticketId: "101",
      to: "teacher@mindx.edu.vn",
      subject: "RE: Không thể đăng nhập - Ticket #101",
      body: "Temporary password: TempPass123!",
    };

    await expect(sendEmail(input)).resolves.toBeUndefined();

    expect(mockSendCustomerEmail).not.toHaveBeenCalled();
    expect(mockedLoggerInfo).toHaveBeenCalledWith(
      expect.stringMatching(/ticket=101.*teacher@mindx\.edu\.vn.*TempPass123!/s)
    );
  });

  it("Odoo đã cấu hình → gửi qua sendCustomerEmail (mail server Odoo)", async () => {
    mockIsOdooRpcConfigured.mockReturnValue(true);

    await sendEmail({
      ticketId: "202",
      to: "a@b.com",
      subject: "Test",
      body: "Hello",
    });

    expect(mockSendCustomerEmail).toHaveBeenCalledWith("202", {
      to: "a@b.com",
      subject: "Test",
      body: "Hello",
    });
    expect(mockedLoggerInfo).not.toHaveBeenCalled();
  });
});
