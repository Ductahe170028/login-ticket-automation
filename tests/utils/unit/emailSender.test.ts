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
  });

  it("ghi log với to, subject, body — không throw", async () => {
    const input = {
      to: "teacher@mindx.edu.vn",
      subject: "RE: Không thể đăng nhập - Ticket #TICKET-101",
      body: "Temporary password: TempPass123!",
    };

    await expect(sendEmail(input)).resolves.toBeUndefined();

    expect(mockedLoggerInfo).toHaveBeenCalledWith(
      expect.stringMatching(/teacher@mindx\.edu\.vn/)
    );
    expect(mockedLoggerInfo).toHaveBeenCalledWith(
      expect.stringMatching(/TempPass123!/)
    );
  });

  it("không gửi SMTP thật (chỉ log mock)", async () => {
    await sendEmail({
      to: "a@b.com",
      subject: "Test",
      body: "Hello",
    });

    const logMessage = mockedLoggerInfo.mock.calls[0]?.[0] ?? "";
    expect(logMessage).toMatch(/a@b\.com/);
    expect(logMessage).toMatch(/Test/);
    expect(logMessage).toMatch(/Hello/);
  });
});
