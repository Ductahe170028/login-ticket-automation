import { TEST_CONFIG } from "../../helpers/testFixtures";

const mutableConfig = {
  ...TEST_CONFIG,
  odooBaseUrl: "" as string,
  odooApiKey: "" as string,
  odooLogin: "" as string,
  odooDatabase: "" as string,
  catchUpDays: TEST_CONFIG.catchUpDays as number,
};

const mockLoggerInfo = jest.fn();
const mockExecuteKw = jest.fn();
const mockIsOdooRpcConfigured = jest.fn();

jest.mock("../../../src/config", () => ({
  config: mutableConfig,
}));

jest.mock("../../../src/utils/logger", () => ({
  logger: { info: mockLoggerInfo, error: jest.fn() },
}));

jest.mock("../../../src/clients/odooRpc", () => ({
  executeKw: (...args: unknown[]) => mockExecuteKw(...args),
  isOdooRpcConfigured: () => mockIsOdooRpcConfigured(),
}));

import {
  addInternalNote,
  addTagsToTicket,
  listPendingLoginTickets,
  sendCustomerEmail,
} from "../../../src/clients/odooClient";

describe("odooClient", () => {
  beforeEach(() => {
    mutableConfig.odooBaseUrl = "";
    mutableConfig.odooApiKey = "";
    mutableConfig.odooLogin = "";
    mutableConfig.odooDatabase = "";
    mutableConfig.catchUpDays = 7;
    mockExecuteKw.mockReset();
    mockLoggerInfo.mockClear();
    mockIsOdooRpcConfigured.mockReturnValue(false);
  });

  describe("sendCustomerEmail", () => {
    it("Odoo chưa cấu hình → log mock, không gọi RPC", async () => {
      await sendCustomerEmail("101", {
        to: "teacher@mindx.edu.vn",
        subject: "RE: Login",
        body: "Temp password: abc",
      });

      expect(mockExecuteKw).not.toHaveBeenCalled();
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringMatching(/101.*teacher@mindx\.edu\.vn.*RE: Login/s)
      );
    });

    it("Odoo đã cấu hình → mail.mail gửi khách + message_post ghi lại trên ticket", async () => {
      mockIsOdooRpcConfigured.mockReturnValue(true);
      mockExecuteKw
        .mockResolvedValueOnce(55)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await sendCustomerEmail("404", {
        to: "user@mindx.edu.vn",
        subject: "RE: Ticket #404",
        body: "Đoạn 1.\n\nĐoạn 2.",
      });

      expect(mockExecuteKw).toHaveBeenNthCalledWith(1, "mail.mail", "create", [
        {
          subject: "RE: Ticket #404",
          body_html: "<p>Đoạn 1.</p><p>Đoạn 2.</p>",
          body: "Đoạn 1.\n\nĐoạn 2.",
          email_to: "user@mindx.edu.vn",
          model: "helpdesk.ticket",
          res_id: 404,
          auto_delete: true,
        },
      ]);
      expect(mockExecuteKw).toHaveBeenNthCalledWith(2, "mail.mail", "send", [
        [55],
      ]);
      expect(mockExecuteKw).toHaveBeenNthCalledWith(
        3,
        "helpdesk.ticket",
        "message_post",
        [[404]],
        {
          body: [
            "Mail đã gửi cho khách",
            "Tới: user@mindx.edu.vn",
            "Tiêu đề: RE: Ticket #404",
            "",
            "Đoạn 1.\n\nĐoạn 2.",
          ].join("\n"),
          message_type: "comment",
          subtype_xmlid: "mail.mt_note",
        }
      );
    });
  });

  describe("addInternalNote", () => {
    it("Odoo chưa cấu hình → log mock, không gọi RPC", async () => {
      await addInternalNote("101", "Test note");

      expect(mockExecuteKw).not.toHaveBeenCalled();
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringMatching(/101.*Test note|mock|odoo/i)
      );
    });

    it("Odoo đã cấu hình → message_post internal note", async () => {
      mockIsOdooRpcConfigured.mockReturnValue(true);
      mockExecuteKw.mockResolvedValue(true);

      await addInternalNote("202", "Employee terminated — escalate");

      expect(mockExecuteKw).toHaveBeenCalledWith(
        "helpdesk.ticket",
        "message_post",
        [[202]],
        {
          body: "Employee terminated — escalate",
          message_type: "comment",
          subtype_xmlid: "mail.mt_note",
        }
      );
    });
  });

  describe("addTagsToTicket", () => {
    it("Odoo chưa cấu hình → log mock", async () => {
      await addTagsToTicket("101", ["auto-resolved"]);

      expect(mockExecuteKw).not.toHaveBeenCalled();
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringMatching(/101.*auto-resolved/i)
      );
    });

    it("Odoo đã cấu hình → tạo tag nếu chưa có và write tag_ids", async () => {
      mockIsOdooRpcConfigured.mockReturnValue(true);
      mockExecuteKw
        .mockResolvedValueOnce([{ id: 9, name: "manual-review" }])
        .mockResolvedValueOnce([{ tag_ids: [1] }])
        .mockResolvedValueOnce(true);

      await addTagsToTicket("303", ["manual-review"]);

      expect(mockExecuteKw).toHaveBeenNthCalledWith(
        1,
        "helpdesk.tag",
        "search_read",
        [[["name", "=", "manual-review"]]],
        { fields: ["id", "name"], limit: 1 }
      );
      expect(mockExecuteKw).toHaveBeenNthCalledWith(
        3,
        "helpdesk.ticket",
        "write",
        [[303], { tag_ids: [[6, 0, [1, 9]]] }]
      );
    });
  });

  describe("listPendingLoginTickets", () => {
    it("Odoo chưa cấu hình → []", async () => {
      expect(await listPendingLoginTickets()).toEqual([]);
      expect(mockExecuteKw).not.toHaveBeenCalled();
    });

    it("Odoo đã cấu hình → search_read và bỏ ticket đã processed tag", async () => {
      mockIsOdooRpcConfigured.mockReturnValue(true);
      mockExecuteKw
        .mockResolvedValueOnce([
          {
            id: 1,
            name: "Login issue",
            description: "password",
            partner_email: "teacher@mindx.edu.vn",
            tag_ids: [],
          },
          {
            id: 2,
            name: "Done ticket",
            description: "done",
            partner_email: "done@mindx.edu.vn",
            tag_ids: [99],
          },
        ])
        .mockResolvedValueOnce([{ id: 99, name: "auto-resolved" }]);

      const result = await listPendingLoginTickets(3);

      expect(mockExecuteKw).toHaveBeenNthCalledWith(
        1,
        "helpdesk.ticket",
        "search_read",
        expect.any(Array),
        expect.objectContaining({
          fields: ["id", "name", "description", "partner_email", "tag_ids"],
        })
      );
      expect(result).toEqual([
        {
          id: "1",
          title: "Login issue",
          description: "password",
          customerEmail: "teacher@mindx.edu.vn",
          tags: [],
        },
      ]);
    });
  });
});
