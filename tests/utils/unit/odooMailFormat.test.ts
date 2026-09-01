import { buildEmailSentChatterNote, plainTextToHtmlEmail } from "../../../src/utils/odooMailFormat";

describe("odooMailFormat", () => {
  it("buildEmailSentChatterNote — plain text, tách header và nội dung, không HTML", () => {
    const note = buildEmailSentChatterNote({
      to: "user@mindx.edu.vn",
      subject: "RE: Login",
      body: "Chào bạn,\n\nNội dung mail.",
    });

    expect(note).toBe(
      [
        "Mail đã gửi cho khách",
        "Tới: user@mindx.edu.vn",
        "Tiêu đề: RE: Login",
        "",
        "Chào bạn,\n\nNội dung mail.",
      ].join("\n")
    );
    expect(note).not.toMatch(/<p>|<br/i);
  });

  describe("plainTextToHtmlEmail", () => {
    it("tách đoạn \\n\\n thành nhiều <p> (chỉ dùng cho mail.mail Gmail)", () => {
      const html = plainTextToHtmlEmail("Đoạn 1.\n\nĐoạn 2.");

      expect(html).toBe("<p>Đoạn 1.</p><p>Đoạn 2.</p>");
      expect(html).not.toMatch(/<br\/>/);
    });

    it("xuống dòng đơn trong đoạn → <br/> bên trong <p>", () => {
      const html = plainTextToHtmlEmail("Trân trọng,\nMindX Support Team");

      expect(html).toBe("<p>Trân trọng,<br/>MindX Support Team</p>");
    });

    it("escape ký tự HTML trong nội dung", () => {
      const html = plainTextToHtmlEmail("a < b & c");

      expect(html).toBe("<p>a &lt; b &amp; c</p>");
    });
  });
});
