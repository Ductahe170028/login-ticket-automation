import axios from "axios";
import { createAxiosError, TEST_CONFIG } from "../../helpers/testFixtures";

jest.mock("axios");
jest.mock("../../../src/config", () => ({
  config: TEST_CONFIG,
}));

import { getEmployeeStatus } from "../../../src/clients/hrClient";

const mockedGet = jest.mocked(axios.get);

const EMPLOYEE = {
  email: "teacher@mindx.edu.vn",
  fullName: "Nguyễn Văn A",
  status: "active" as const,
};

describe("hrClient.getEmployeeStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET đúng URL (encode email) + header x-api-key → trả Employee", async () => {
    mockedGet.mockResolvedValue({ status: 200, data: EMPLOYEE });

    const result = await getEmployeeStatus("teacher@mindx.edu.vn");

    expect(result).toEqual(EMPLOYEE);
    expect(mockedGet).toHaveBeenCalledWith(
      "http://localhost:4001/hr/employees/teacher%40mindx.edu.vn",
      {
        headers: { "x-api-key": "demo-secret-key" },
      }
    );
  });

  it("email có ký tự đặc biệt → encodeURIComponent trong URL", async () => {
    mockedGet.mockResolvedValue({ status: 200, data: EMPLOYEE });

    await getEmployeeStatus("user+tag@mindx.edu.vn");

    expect(mockedGet).toHaveBeenCalledWith(
      "http://localhost:4001/hr/employees/user%2Btag%40mindx.edu.vn",
      expect.any(Object)
    );
  });

  it("API 404 → null, không throw", async () => {
    mockedGet.mockRejectedValue(createAxiosError(404, "Not Found"));

    const result = await getEmployeeStatus("unknown@mindx.edu.vn");

    expect(result).toBeNull();
  });

  it("API 500 → throw", async () => {
    mockedGet.mockRejectedValue(createAxiosError(500, "Internal Server Error"));

    await expect(getEmployeeStatus("teacher@mindx.edu.vn")).rejects.toThrow();
  });

  it("lỗi mạng (không có response) → throw", async () => {
    mockedGet.mockRejectedValue(new Error("Network Error"));

    await expect(getEmployeeStatus("teacher@mindx.edu.vn")).rejects.toThrow(
      "Network Error"
    );
  });
});
