import {
  buildCustomerEmailSubject,
  buildReactivateCustomerEmail,
  buildResetPasswordCustomerEmail,
  noteEmployeeNotFound,
  noteEmployeeTerminated,
  noteMissingCustomerEmail,
  notePasswordReset,
  noteReactivatedAndReset,
} from "../../../src/automation/loginTicketMessages";

describe("loginTicketMessages", () => {
  it("note nội bộ — tiếng Việt, ngắn gọn", () => {
    expect(noteMissingCustomerEmail()).toMatch(/thiếu email/i);
    expect(noteEmployeeNotFound("a@b.vn")).toMatch(/Không tìm thấy nhân sự a@b\.vn/);
    expect(noteEmployeeTerminated("Nguyễn Văn A")).toMatch(/đã nghỉ việc/);
    expect(noteReactivatedAndReset("a@b.vn")).toMatch(/kích hoạt lại/);
    expect(notePasswordReset("a@b.vn")).toMatch(/reset mật khẩu/);
  });

  it("mail khách reset — trung tính (bạn), có mật khẩu tạm và nhờ xác nhận", () => {
    const body = buildResetPasswordCustomerEmail("Nguyễn Văn A", "TempPass123!");

    expect(body).toMatch(/Chào Nguyễn Văn A,/);
    expect(body).toMatch(/phản hồi giúp team/);
    expect(body).toMatch(/Cảm ơn bạn đã hỗ trợ!/);
    expect(body).toMatch(/MindX Support Team/);
    expect(body).not.toMatch(/Ticket #/);
    expect(body).not.toMatch(/\//);
    expect(body.split("\n\n").length).toBeGreaterThanOrEqual(4);
  });

  it("mail khách reactivate — khác đoạn giải quyết, cùng cấu trúc", () => {
    const body = buildReactivateCustomerEmail("Nguyễn Văn A", "NewPass456!");

    expect(body).toMatch(/kích hoạt lại tài khoản LMS/);
    expect(body).toMatch(/Mật khẩu mới: NewPass456!/);
    expect(body).toMatch(/phản hồi giúp team/);
  });

  it("subject — không có ticket id", () => {
    expect(buildCustomerEmailSubject("Không thể đăng nhập vào LMS")).toBe(
      "RE: Không thể đăng nhập vào LMS"
    );
  });
});
