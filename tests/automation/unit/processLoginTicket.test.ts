/**
 * Unit test cho processLoginTicket — "bộ não" xử lý ticket login.
 * Mock toàn bộ client bên ngoài; tập trung vào nhánh quyết định nghiệp vụ.
 */
import type { Employee, LmsAccount, Ticket } from "../../../src/types";

jest.mock("../../../src/clients/hrClient");
jest.mock("../../../src/clients/lmsClient");
jest.mock("../../../src/clients/odooClient");
jest.mock("../../../src/utils/emailSender");

import { processLoginTicket } from "../../../src/automation/processLoginTicket";
import * as hrClient from "../../../src/clients/hrClient";
import * as lmsClient from "../../../src/clients/lmsClient";
import * as odooClient from "../../../src/clients/odooClient";
import * as emailSender from "../../../src/utils/emailSender";

const mockedGetEmployeeStatus = jest.mocked(hrClient.getEmployeeStatus);
const mockedGetAccountStatus = jest.mocked(lmsClient.getAccountStatus);
const mockedReactivateAccount = jest.mocked(lmsClient.reactivateAccount);
const mockedResetPassword = jest.mocked(lmsClient.resetPassword);
const mockedAddInternalNote = jest.mocked(odooClient.addInternalNote);
const mockedSendEmail = jest.mocked(emailSender.sendEmail);

const CUSTOMER_EMAIL = "teacher@mindx.edu.vn";
const TICKET_ID = "TICKET-101";

function makeLoginTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: TICKET_ID,
    title: "Không thể đăng nhập vào LMS",
    description: "Em bị lỗi Invalid username or password.",
    customerEmail: CUSTOMER_EMAIL,
    tags: ["login", "LMS", "teacher"],
    ...overrides,
  };
}

function makeNonLoginTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "TICKET-999",
    title: "Dashboard load rất chậm",
    description: "Trang báo cáo mất gần 1 phút để load.",
    customerEmail: "user@mindx.edu.vn",
    tags: ["performance"],
    ...overrides,
  };
}

const activeEmployee: Employee = {
  email: CUSTOMER_EMAIL,
  fullName: "Nguyễn Văn A",
  status: "active",
};

const terminatedEmployee: Employee = {
  email: CUSTOMER_EMAIL,
  fullName: "Trần Thị B",
  status: "terminated",
};

const activeLmsAccount: LmsAccount = {
  email: CUSTOMER_EMAIL,
  accountStatus: "active",
  lastLoginDaysAgo: 14,
};

const deactivatedLmsAccount: LmsAccount = {
  email: CUSTOMER_EMAIL,
  accountStatus: "deactivated",
  lastLoginDaysAgo: 45,
};

function setupActivePathMocks(tempPassword = "TempPass123!"): void {
  mockedGetEmployeeStatus.mockResolvedValue(activeEmployee);
  mockedGetAccountStatus.mockResolvedValue(activeLmsAccount);
  mockedResetPassword.mockResolvedValue({ tempPassword });
  mockedReactivateAccount.mockResolvedValue(undefined);
  mockedAddInternalNote.mockResolvedValue(undefined);
  mockedSendEmail.mockResolvedValue(undefined);
}

describe("processLoginTicket", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("lọc sớm — nhận diện login issue", () => {
    it("ticket không liên quan → dừng ngay, không gọi client nào", async () => {
      const result = await processLoginTicket(makeNonLoginTicket());

      expect(result).toEqual({
        handled: false,
        reason: "not_login_issue",
      });
      expect(mockedGetEmployeeStatus).not.toHaveBeenCalled();
      expect(mockedGetAccountStatus).not.toHaveBeenCalled();
      expect(mockedReactivateAccount).not.toHaveBeenCalled();
      expect(mockedResetPassword).not.toHaveBeenCalled();
      expect(mockedAddInternalNote).not.toHaveBeenCalled();
      expect(mockedSendEmail).not.toHaveBeenCalled();
    });

    it("chỉ tag LMS + lỗi khác login → không xử lý (tránh false positive)", async () => {
      const ticket = makeLoginTicket({
        title: "Không nộp được bài thi trên LMS",
        description: "Nút Submit bị grey out sau khi upload file.",
        tags: ["LMS", "exam", "urgent"],
      });

      const result = await processLoginTicket(ticket);

      expect(result.reason).toBe("not_login_issue");
      expect(mockedGetEmployeeStatus).not.toHaveBeenCalled();
    });

    it.each([
      {
        label: "tag login",
        ticket: makeLoginTicket({
          title: "Cần hỗ trợ",
          description: "Giáo viên báo không vào được hệ thống.",
          tags: ["login"],
        }),
      },
      {
        label: "keyword trong description",
        ticket: makeLoginTicket({
          title: "Cần hỗ trợ gấp",
          description: "Em quên mật khẩu, không vào được LMS.",
          tags: [],
        }),
      },
    ])("nhận qua $label → vào pipeline xử lý", async ({ ticket }) => {
      setupActivePathMocks();

      const result = await processLoginTicket(ticket);

      expect(result.handled).toBe(true);
      expect(mockedGetEmployeeStatus).toHaveBeenCalledWith(CUSTOMER_EMAIL);
    });
  });

  describe("validate email", () => {
    it.each(["", "   "])(
      "customerEmail rỗng hoặc chỉ khoảng trắng (%#) → missing_customer_email, không gọi HR",
      async (customerEmail) => {
        const result = await processLoginTicket(
          makeLoginTicket({ customerEmail })
        );

        expect(result).toEqual({
          handled: false,
          reason: "missing_customer_email",
        });
        expect(mockedAddInternalNote).toHaveBeenCalledWith(
          TICKET_ID,
          expect.stringMatching(/thiếu email/i)
        );
        expect(mockedGetEmployeeStatus).not.toHaveBeenCalled();
      }
    );
  });

  describe("tra cứu HR", () => {
    it("không tìm thấy nhân sự → ghi note đúng ticket id, không gọi LMS", async () => {
      mockedGetEmployeeStatus.mockResolvedValue(null);

      const result = await processLoginTicket(
        makeLoginTicket({ id: "TICKET-404" })
      );

      expect(result).toEqual({
        handled: false,
        reason: "employee_not_found",
      });
      expect(mockedGetEmployeeStatus).toHaveBeenCalledWith(CUSTOMER_EMAIL);
      expect(mockedAddInternalNote).toHaveBeenCalledWith(
        "TICKET-404",
        expect.stringMatching(/Không tìm thấy nhân sự/)
      );
      expect(mockedGetAccountStatus).not.toHaveBeenCalled();
      expect(mockedReactivateAccount).not.toHaveBeenCalled();
      expect(mockedResetPassword).not.toHaveBeenCalled();
      expect(mockedSendEmail).not.toHaveBeenCalled();
    });
  });

  describe("nhân sự terminated — an toàn nghiệp vụ", () => {
    it("đã nghỉ việc → escalate note có tên nhân viên, cấm mọi thao tác LMS/email", async () => {
      mockedGetEmployeeStatus.mockResolvedValue(terminatedEmployee);

      const result = await processLoginTicket(makeLoginTicket());

      expect(result).toEqual({
        handled: false,
        reason: "employee_terminated",
      });
      expect(mockedAddInternalNote).toHaveBeenCalledWith(
        TICKET_ID,
        expect.stringMatching(/Trần Thị B.*đã nghỉ việc/)
      );
      expect(mockedGetAccountStatus).not.toHaveBeenCalled();
      expect(mockedReactivateAccount).not.toHaveBeenCalled();
      expect(mockedResetPassword).not.toHaveBeenCalled();
      expect(mockedSendEmail).not.toHaveBeenCalled();
    });
  });

  describe("tra cứu LMS", () => {
    it("nhân sự active nhưng không có account LMS → ghi note, không thao tác LMS", async () => {
      mockedGetEmployeeStatus.mockResolvedValue(activeEmployee);
      mockedGetAccountStatus.mockResolvedValue(null);

      const result = await processLoginTicket(makeLoginTicket());

      expect(result).toEqual({
        handled: false,
        reason: "lms_account_not_found",
      });
      expect(mockedGetAccountStatus).toHaveBeenCalledWith(CUSTOMER_EMAIL);
      expect(mockedAddInternalNote).toHaveBeenCalledWith(
        TICKET_ID,
        expect.stringMatching(/Không tìm thấy tài khoản LMS/)
      );
      expect(mockedReactivateAccount).not.toHaveBeenCalled();
      expect(mockedResetPassword).not.toHaveBeenCalled();
      expect(mockedSendEmail).not.toHaveBeenCalled();
    });
  });

  describe("giải quyết — account deactivated", () => {
    it("reactivate + reset + email + note Odoo", async () => {
      mockedGetEmployeeStatus.mockResolvedValue(activeEmployee);
      mockedGetAccountStatus.mockResolvedValue(deactivatedLmsAccount);
      mockedReactivateAccount.mockResolvedValue(undefined);
      mockedResetPassword.mockResolvedValue({ tempPassword: "NewPass456!" });
      mockedAddInternalNote.mockResolvedValue(undefined);
      mockedSendEmail.mockResolvedValue(undefined);

      const result = await processLoginTicket(makeLoginTicket());

      expect(result).toEqual({
        handled: true,
        action: "reactivated_and_reset_password",
      });
      expect(mockedReactivateAccount).toHaveBeenCalledWith(CUSTOMER_EMAIL);
      expect(mockedResetPassword).toHaveBeenCalledWith(CUSTOMER_EMAIL);
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: CUSTOMER_EMAIL,
          subject: "RE: Không thể đăng nhập vào LMS",
          body: expect.stringMatching(/kích hoạt lại.*NewPass456!/s),
        })
      );
      expect(mockedAddInternalNote).toHaveBeenCalledWith(
        TICKET_ID,
        expect.stringMatching(/kích hoạt lại/)
      );
    });
  });

  describe("giải quyết — account active", () => {
    it("chỉ reset password + note Odoo + email (không reactivate)", async () => {
      setupActivePathMocks("OnlyReset789!");

      const result = await processLoginTicket(
        makeLoginTicket({ id: "TICKET-777" })
      );

      expect(result).toEqual({
        handled: true,
        action: "reset_password",
      });
      expect(mockedResetPassword).toHaveBeenCalledWith(CUSTOMER_EMAIL);
      expect(mockedReactivateAccount).not.toHaveBeenCalled();
      expect(mockedAddInternalNote).toHaveBeenCalledWith(
        "TICKET-777",
        expect.stringMatching(/reset mật khẩu/)
      );
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: CUSTOMER_EMAIL,
          subject: "RE: Không thể đăng nhập vào LMS",
          body: expect.stringMatching(/reset mật khẩu.*OnlyReset789!/s),
        })
      );
    });
  });

  describe("thứ tự gọi", () => {
    it("HR trước LMS khi nhân sự active", async () => {
      const callOrder: string[] = [];
      mockedGetEmployeeStatus.mockImplementation(async () => {
        callOrder.push("hr");
        return activeEmployee;
      });
      mockedGetAccountStatus.mockImplementation(async () => {
        callOrder.push("lms");
        return activeLmsAccount;
      });
      mockedResetPassword.mockResolvedValue({ tempPassword: "x" });
      mockedSendEmail.mockResolvedValue(undefined);
      mockedAddInternalNote.mockResolvedValue(undefined);

      await processLoginTicket(makeLoginTicket());

      expect(callOrder).toEqual(["hr", "lms"]);
    });

    it("reactivate trước resetPassword khi account deactivated", async () => {
      const callOrder: string[] = [];
      mockedGetEmployeeStatus.mockResolvedValue(activeEmployee);
      mockedGetAccountStatus.mockResolvedValue(deactivatedLmsAccount);
      mockedReactivateAccount.mockImplementation(async () => {
        callOrder.push("reactivate");
      });
      mockedResetPassword.mockImplementation(async () => {
        callOrder.push("reset");
        return { tempPassword: "x" };
      });
      mockedAddInternalNote.mockResolvedValue(undefined);
      mockedSendEmail.mockResolvedValue(undefined);

      await processLoginTicket(makeLoginTicket());

      expect(callOrder).toEqual(["reactivate", "reset"]);
    });
  });
});
