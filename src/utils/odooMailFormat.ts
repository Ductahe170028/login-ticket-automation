function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Ghi chú nội bộ — plain text only (Odoo trial escape HTML → không dùng thẻ). */
export function buildEmailSentChatterNote(input: {
  to: string;
  subject: string;
  body: string;
}): string {
  return [
    "Mail đã gửi cho khách",
    `Tới: ${input.to}`,
    `Tiêu đề: ${input.subject}`,
    "",
    input.body,
  ].join("\n");
}

/** Plain text (đoạn cách nhau bằng \\n\\n) → HTML cho mail.mail.body_html của Odoo. */
export function plainTextToHtmlEmail(plainBody: string): string {
  return plainBody
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => {
      const html = escapeHtml(paragraph).replace(/\n/g, "<br/>");
      return `<p>${html}</p>`;
    })
    .join("");
}
