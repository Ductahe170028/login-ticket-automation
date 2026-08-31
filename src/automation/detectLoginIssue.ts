import type { Ticket } from "../types";

const LOGIN_KEYWORDS = [
  "đăng nhập",
  "dang nhap",
  "login",
  "password",
  "mật khẩu",
  "mat khau",
];

/** Tag Odoo ro rang danh dau ticket login (scenario-01: login, LMS, teacher). */
const LOGIN_TAGS = ["login"];

export function isLoginIssue(ticket: Ticket): boolean {
  const tags = (ticket.tags ?? []).map((tag) => tag.toLowerCase().trim());
  if (tags.some((tag) => LOGIN_TAGS.includes(tag))) {
    return true;
  }

  const text = `${ticket.title} ${ticket.description}`.toLowerCase();
  return LOGIN_KEYWORDS.some((keyword) => text.includes(keyword));
}
