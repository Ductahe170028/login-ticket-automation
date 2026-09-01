import axios from "axios";
import { TEST_CONFIG } from "../../helpers/testFixtures";

jest.mock("axios");

const mockedPost = jest.mocked(axios.post);

describe("odooClient.addInternalNote", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("ODOO_BASE_URL trống → không gọi axios, ghi log mock", async () => {
    const mockInfo = jest.fn();
    jest.doMock("../../../src/config", () => ({ config: TEST_CONFIG }));
    jest.doMock("../../../src/utils/logger", () => ({
      logger: { info: mockInfo, error: jest.fn() },
    }));

    const { addInternalNote } = await import("../../../src/clients/odooClient");

    await addInternalNote("TICKET-101", "Test note");

    expect(mockedPost).not.toHaveBeenCalled();
    expect(mockInfo).toHaveBeenCalledWith(
      expect.stringMatching(/TICKET-101.*Test note|mock|odoo/i)
    );
  });

  it("có ODOO_BASE_URL → POST đúng ticket id + note + api key", async () => {
    jest.doMock("../../../src/config", () => ({
      config: {
        ...TEST_CONFIG,
        odooBaseUrl: "http://odoo.test",
        odooApiKey: "odoo-secret",
      },
    }));
    jest.doMock("../../../src/utils/logger", () => ({
      logger: { info: jest.fn(), error: jest.fn() },
    }));

    mockedPost.mockResolvedValue({ status: 200, data: {} });

    const { addInternalNote } = await import("../../../src/clients/odooClient");

    await addInternalNote("TICKET-202", "Employee terminated — escalate");

    expect(mockedPost).toHaveBeenCalledWith(
      "http://odoo.test/api/tickets/TICKET-202/notes",
      { note: "Employee terminated — escalate" },
      { headers: { "x-api-key": "odoo-secret" } }
    );
  });
});
