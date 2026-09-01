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
