/**
 * Unit test cho isLoginIssue — bo loc "ticket nay co phai login issue khong?".
 * Chi test hanh vi nhan dien, khong lien quan HR/LMS.
 */
import { isLoginIssue } from "../../../src/automation/detectLoginIssue";
import type { Ticket } from "../../../src/types";

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "TICKET-001",
    title: "",
    description: "",
    customerEmail: "user@mindx.edu.vn",
    tags: [],
    ...overrides,
  };
}

describe("isLoginIssue", () => {
  it("title chứa 'đăng nhập' → true", () => {
    const ticket = makeTicket({ title: "Không thể đăng nhập vào LMS" });

    expect(isLoginIssue(ticket)).toBe(true);
  });

  it("description chứa 'mật khẩu' hoặc 'password' → true", () => {
    const ticket = makeTicket({
      title: "Cần hỗ trợ",
      description: "Em bị lỗi Invalid username or password.",
    });

    expect(isLoginIssue(ticket)).toBe(true);
  });

  it("không chứa keyword nào (ticket khác, vd. dashboard chậm) → false", () => {
    const ticket = makeTicket({
      title: "Dashboard load rất chậm",
      description: "Trang báo cáo mất gần 1 phút để load.",
    });

    expect(isLoginIssue(ticket)).toBe(false);
  });

  it("viết hoa toàn bộ ('ĐĂNG NHẬP') vẫn nhận diện được → true", () => {
    const ticket = makeTicket({ title: "LỖI ĐĂNG NHẬP HỆ THỐNG" });

    expect(isLoginIssue(ticket)).toBe(true);
  });

  it("title và description đều rỗng → false, không throw lỗi", () => {
    const ticket = makeTicket({ title: "", description: "" });

    expect(() => isLoginIssue(ticket)).not.toThrow();
    expect(isLoginIssue(ticket)).toBe(false);
  });

  it("có tag 'login' dù title/description không có keyword → true", () => {
    const ticket = makeTicket({
      title: "Cần hỗ trợ",
      description: "Giáo viên báo không vào được hệ thống.",
      tags: ["login", "LMS", "teacher"],
    });

    expect(isLoginIssue(ticket)).toBe(true);
  });

  it("tag 'LOGIN' viết hoa vẫn nhận diện được → true", () => {
    const ticket = makeTicket({
      title: "Ticket hỗ trợ",
      description: "",
      tags: ["LOGIN"],
    });

    expect(isLoginIssue(ticket)).toBe(true);
  });

  it("tag không liên quan (exam, outage) và không có keyword login → false", () => {
    const ticket = makeTicket({
      title: "LMS - Không nộp được bài thi",
      description: "Hệ thống nộp bài thi không hoạt động.",
      tags: ["LMS", "exam", "expedite", "outage"],
    });

    expect(isLoginIssue(ticket)).toBe(false);
  });
});
