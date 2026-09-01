import axios from "axios";
import { TEST_CONFIG } from "../../helpers/testFixtures";

jest.mock("axios");

const mutableConfig = {
  ...TEST_CONFIG,
  odooBaseUrl: "" as string,
  odooApiKey: "" as string,
  catchUpDays: TEST_CONFIG.catchUpDays as number,
};

const mockLoggerInfo = jest.fn();

jest.mock("../../../src/config", () => ({
  config: mutableConfig,
}));

jest.mock("../../../src/utils/logger", () => ({
  logger: { info: mockLoggerInfo, error: jest.fn() },
}));

import {
  addInternalNote,
  addTagsToTicket,
  listPendingLoginTickets,
} from "../../../src/clients/odooClient";

const mockedGet = jest.mocked(axios.get);
const mockedPost = jest.mocked(axios.post);

describe("odooClient", () => {
  beforeEach(() => {
    mutableConfig.odooBaseUrl = "";
    mutableConfig.odooApiKey = "";
    mutableConfig.catchUpDays = 7;
    mockedGet.mockReset();
    mockedPost.mockReset();
    mockLoggerInfo.mockClear();
  });

  describe("addInternalNote", () => {
    it("ODOO_BASE_URL trống → không gọi axios, ghi log mock", async () => {
      await addInternalNote("TICKET-101", "Test note");

      expect(mockedPost).not.toHaveBeenCalled();
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringMatching(/TICKET-101.*Test note|mock|odoo/i)
      );
    });

    it("có ODOO_BASE_URL → POST đúng ticket id + note + api key", async () => {
      mutableConfig.odooBaseUrl = "http://odoo.test";
      mutableConfig.odooApiKey = "odoo-secret";
      mockedPost.mockResolvedValue({ data: {} });

      await addInternalNote("TICKET-202", "Employee terminated — escalate");

      expect(mockedPost).toHaveBeenCalledWith(
        "http://odoo.test/api/tickets/TICKET-202/notes",
        { note: "Employee terminated — escalate" },
        { headers: { "x-api-key": "odoo-secret" } }
      );
    });
  });

  describe("addTagsToTicket", () => {
    it("ODOO_BASE_URL trống → log mock, không gọi axios", async () => {
      await addTagsToTicket("TICKET-101", ["auto-resolved"]);

      expect(mockedPost).not.toHaveBeenCalled();
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringMatching(/TICKET-101.*auto-resolved/i)
      );
    });

    it("có ODOO_BASE_URL → POST tags", async () => {
      mutableConfig.odooBaseUrl = "http://odoo.test";
      mutableConfig.odooApiKey = "odoo-secret";
      mockedPost.mockResolvedValue({ data: {} });

      await addTagsToTicket("TICKET-303", ["manual-review"]);

      expect(mockedPost).toHaveBeenCalledWith(
        "http://odoo.test/api/tickets/TICKET-303/tags",
        { tags: ["manual-review"] },
        { headers: { "x-api-key": "odoo-secret" } }
      );
    });
  });

  describe("listPendingLoginTickets", () => {
    it("ODOO_BASE_URL trống → []", async () => {
      expect(await listPendingLoginTickets()).toEqual([]);
      expect(mockedGet).not.toHaveBeenCalled();
    });

    it("có ODOO_BASE_URL → GET pending-login với sinceDays", async () => {
      mutableConfig.odooBaseUrl = "http://odoo.test";
      mutableConfig.odooApiKey = "odoo-secret";
      const tickets = [
        {
          id: "T1",
          title: "Cannot login",
          description: "Forgot password",
          customerEmail: "teacher@mindx.edu.vn",
        },
      ];
      mockedGet.mockResolvedValue({ data: tickets });

      const result = await listPendingLoginTickets(3);

      expect(mockedGet).toHaveBeenCalledWith(
        "http://odoo.test/api/tickets/pending-login?sinceDays=3",
        { headers: { "x-api-key": "odoo-secret" } }
      );
      expect(result).toEqual(tickets);
    });

    it("sinceDays mặc định dùng catchUpDays", async () => {
      mutableConfig.odooBaseUrl = "http://odoo.test";
      mutableConfig.odooApiKey = "odoo-secret";
      mutableConfig.catchUpDays = 14;
      mockedGet.mockResolvedValue({ data: [] });

      await listPendingLoginTickets();

      expect(mockedGet).toHaveBeenCalledWith(
        "http://odoo.test/api/tickets/pending-login?sinceDays=14",
        expect.any(Object)
      );
    });
  });
});
